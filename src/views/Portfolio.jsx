"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScrollReveal from '../components/ScrollReveal';
import { useApp } from '../context/AppContext';
import { generatePortfolioAdvice } from '../services/gemini';
import { downloadPDFReport } from '../services/pdfReport';
import { getStockData } from '../services/stockData';

export default function Portfolio() {
  const router = useRouter();
  const { balance, holdings, transactions, watchlist } = useApp();
  const [marketPrices, setMarketPrices] = useState({});
  const [advice, setAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);

  const holdingEntries = Object.entries(holdings || {});
  const holdingSymbolsKey = holdingEntries.map(([symbol]) => symbol).join('|');

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      if (holdingEntries.length === 0) {
        setMarketPrices({});
        return;
      }

      const nextEntries = await Promise.all(
        holdingEntries.map(async ([symbol]) => {
          const data = await getStockData(symbol);
          return [symbol, data.price];
        }),
      );

      if (!cancelled) {
        setMarketPrices(Object.fromEntries(nextEntries));
      }
    }

    loadPrices();
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [holdingSymbolsKey]);

  useEffect(() => {
    const tickInterval = setInterval(() => {
      setMarketPrices((current) => {
        const next = { ...current };
        let changed = false;
        Object.keys(next).forEach(sym => {
          const jitter = next[sym] * (Math.random() - 0.5) * 0.001;
          next[sym] = next[sym] + jitter;
          changed = true;
        });
        return changed ? next : current;
      });
    }, 2100);
    return () => clearInterval(tickInterval);
  }, []);

  const portfolioStats = useMemo(() => {
    const invested = holdingEntries.reduce((sum, [, entry]) => sum + entry.qty * entry.avgPrice, 0);
    const currentValue = holdingEntries.reduce((sum, [symbol, entry]) => {
      const livePrice = marketPrices[symbol] ?? entry.avgPrice;
      return sum + entry.qty * livePrice;
    }, 0);
    const pnl = currentValue - invested;

    return {
      invested,
      currentValue,
      totalPortfolioValue: balance + currentValue,
      pnl,
      pnlPercent: invested > 0 ? (pnl / invested) * 100 : 0,
    };
  }, [balance, holdingEntries, marketPrices]);

  async function handleAdvice() {
    setAdviceLoading(true);
    try {
      const holdingsSummary = holdingEntries.length === 0
        ? 'No current holdings.'
        : holdingEntries
            .map(([symbol, entry]) => {
              const currentPrice = marketPrices[symbol] ?? entry.avgPrice;
              return `${symbol.replace('.NS', '').replace('%26', '&')}: ${entry.qty} shares, avg Rs. ${entry.avgPrice.toFixed(2)}, current Rs. ${currentPrice.toFixed(2)}`;
            })
            .join(' | ');

      const transactionSummary = transactions.slice(0, 5).map((entry) => (
        `${entry.type} ${entry.symbol.replace('.NS', '').replace('%26', '&')} x${entry.qty} at Rs. ${entry.price}`
      )).join(' | ') || 'No recent trades.';

      const marketSnapshot = watchlist.length > 0
        ? watchlist
            .slice(0, 5)
            .map((entry) => `${entry.symbol.replace('.NS', '').replace('%26', '&')}: ${entry.change >= 0 ? '+' : ''}${entry.change}%`)
            .join(' | ')
        : 'Fear and Greed is in the greed zone around the low 60s.';

      const nextAdvice = await generatePortfolioAdvice({
        holdings: holdingsSummary,
        balance: balance.toLocaleString('en-IN'),
        transactions: transactionSummary,
        marketSnapshot,
      });

      setAdvice(nextAdvice);
    } catch {
      setAdvice('AI advice is unavailable right now. Add your Gemini API key to enable live portfolio guidance.');
    }

    setAdviceLoading(false);
  }

  function handlePortfolioPDF() {
    const metrics = {
      'Cash Balance': `Rs. ${balance.toLocaleString('en-IN')}`,
      Invested: `Rs. ${portfolioStats.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      Positions: holdingEntries.length,
      'Portfolio Value': `Rs. ${portfolioStats.totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    };

    const holdingSummary = holdingEntries.length === 0
      ? 'No current holdings.'
      : holdingEntries
          .map(([symbol, entry]) => {
            const currentPrice = marketPrices[symbol] ?? entry.avgPrice;
            return `${symbol.replace('.NS', '').replace('%26', '&')}: ${entry.qty} shares, avg Rs. ${entry.avgPrice.toFixed(2)}, current Rs. ${currentPrice.toFixed(2)}`;
          })
          .join('\n');

    downloadPDFReport({
      title: 'Portfolio Overview Report',
      symbol: 'PORTFOLIO',
      reportText: `Portfolio Summary\n\n${holdingSummary}\n\nCash Balance: Rs. ${balance.toLocaleString('en-IN')}\nCurrent Portfolio Value: Rs. ${portfolioStats.totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n${advice ? `\nAI Advice: ${advice}` : ''}`,
      metrics,
      generatedAt: new Date().toLocaleString('en-IN'),
    });
  }

  return (
    <div className="min-h-screen bg-mesh font-body">
      <section className="bg-surface-container-low px-8 py-12">
        <div className="mx-auto max-w-screen-xl">
          <ScrollReveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="mb-4 block font-mono text-xs font-black uppercase tracking-widest text-primary">
                  Your Portfolio
                </span>
                <h1 className="mb-4 text-5xl font-black leading-[0.9] tracking-tighter text-on-surface">
                  Virtual <span className="text-primary">Portfolio</span>
                </h1>
                <p className="max-w-2xl leading-relaxed text-on-surface-variant">
                  Your simulated positions, cash, and recent trades all update from the sandbox in real time.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAdvice}
                  disabled={adviceLoading}
                  className="rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {adviceLoading ? 'Generating advice...' : 'Get AI Advice'}
                </button>
                <button
                  onClick={handlePortfolioPDF}
                  className="primary-gradient flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white btn-interactive"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  Export PDF
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-8 py-10">
        <div className="mx-auto max-w-screen-xl space-y-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
              {[
                { label: 'Cash Balance', value: `Rs. ${balance.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'text-primary bg-primary-fixed' },
                { label: 'Invested', value: `Rs. ${portfolioStats.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'trending_up', color: 'text-emerald-700 bg-emerald-100' },
                { label: 'Current Value', value: `Rs. ${portfolioStats.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'stacked_line_chart', color: 'text-slate-700 bg-slate-100' },
                { label: 'P&L', value: `${portfolioStats.pnl >= 0 ? '+' : ''}Rs. ${portfolioStats.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'monitoring', color: portfolioStats.pnl >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-secondary bg-secondary-fixed/40' },
                { label: 'Transactions', value: transactions.length || 0, icon: 'receipt_long', color: 'text-amber-700 bg-amber-100' },
              ].map((card) => (
                <div key={card.label} className="cloud-shadow flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <div>
                    <div className="font-mono text-xl font-black text-on-surface md:text-2xl">{card.value}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="rounded-3xl bg-[#0d0c18] p-6 text-white">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <div className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                    AI Portfolio Coach
                  </div>
                  <h2 className="mb-3 text-2xl font-black">What is happening in the market, and what should you do?</h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300">
                    The advisor looks at your holdings, recent trades, and current market tone to suggest what matters now and what to keep doing over time.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-5 text-sm leading-7 text-slate-200">
                  {advice || 'Tap "Get AI Advice" to see what may be happening in the market right now, what your portfolio is exposed to, and what a beginner could do next.'}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            {holdingEntries.length === 0 ? (
              <div className="cloud-shadow rounded-3xl bg-surface-container-lowest py-20 text-center">
                <span className="material-symbols-outlined mb-4 block text-6xl text-on-surface-variant">pie_chart</span>
                <h2 className="mb-3 text-2xl font-black text-on-surface">No holdings yet</h2>
                <p className="mb-6 text-on-surface-variant">
                  Buy stocks in the Simulation page to build your portfolio.
                </p>
                <button
                  onClick={() => router.push('/simulation')}
                  className="primary-gradient rounded-xl px-8 py-3 font-bold text-white btn-interactive"
                >
                  Go to Simulation
                </button>
              </div>
            ) : (
              <div className="cloud-shadow overflow-hidden rounded-3xl bg-surface-container-lowest">
                <div className="border-b border-surface-container p-6">
                  <h2 className="text-xl font-black text-on-surface">Holdings</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-container">
                        {['Symbol', 'Name', 'Qty', 'Avg Price', 'Live Price', 'Current Value', 'P&L'].map((heading) => (
                          <th key={heading} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdingEntries.map(([symbol, entry]) => {
                        const livePrice = marketPrices[symbol] ?? entry.avgPrice;
                        const invested = entry.qty * entry.avgPrice;
                        const currentValue = entry.qty * livePrice;
                        const pnl = currentValue - invested;
                        const pnlClass = pnl >= 0 ? 'text-emerald-600' : 'text-secondary';

                        return (
                          <tr key={symbol} className="border-b border-surface-container transition-colors hover:bg-surface-container/50">
                            <td className="px-5 py-4 font-mono font-bold text-on-surface">
                              {symbol.replace('.NS', '').replace('%26', '&')}
                            </td>
                            <td className="px-5 py-4 text-sm text-on-surface-variant">{entry.name}</td>
                            <td className="px-5 py-4 font-mono font-black text-on-surface">{entry.qty}</td>
                            <td className="px-5 py-4 font-mono text-on-surface">Rs.{entry.avgPrice.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 font-mono text-on-surface">Rs.{livePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td className="px-5 py-4 font-mono font-black text-on-surface">Rs.{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className={`px-5 py-4 font-mono font-black ${pnlClass}`}>
                              {pnl >= 0 ? '+' : ''}Rs.{pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ScrollReveal>

          {transactions.length > 0 && (
            <ScrollReveal delay={220}>
              <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-6">
                <h3 className="mb-5 text-xl font-bold text-on-surface">Transaction History</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 15).map((entry, index) => (
                    <div key={`${entry.symbol}-${entry.time}-${index}`} className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-surface-container">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${entry.type === 'BUY' ? 'bg-primary-fixed text-primary' : 'bg-secondary-fixed/50 text-secondary'}`}>
                          {entry.type === 'BUY' ? '↑' : '↓'}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">
                            {entry.symbol.replace('.NS', '').replace('%26', '&')}
                          </div>
                          <div className="font-mono text-xs text-on-surface-variant">
                            {entry.type} · {entry.qty} shares @ Rs.{entry.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-black ${entry.type === 'BUY' ? 'text-secondary' : 'text-emerald-600'}`}>
                          {entry.type === 'BUY' ? '-' : '+'}Rs.{(entry.qty * entry.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="font-mono text-[10px] text-on-surface-variant">
                          {new Date(entry.time).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}
