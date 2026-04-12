"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useApp } from '../context/AppContext';
import { generateRiskInsight } from '../services/gemini';
import { downloadPDFReport } from '../services/pdfReport';
import { getStockData, STOCK_LIST } from '../services/stockData';

const REFRESH_INTERVAL = 30000;

function MiniChart({ data, positive }) {
  if (!data || data.length < 2) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        Loading chart...
      </div>
    );
  }

  const values = data.map((point) => point.close);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / (max - min || 1)) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  const color = positive ? '#5140c8' : '#b6250d';

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="sandbox-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${points} 100,100 0,100`} fill="url(#sandbox-chart-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function SimulationSandbox() {
  const router = useRouter();
  const {
    balance,
    holdings,
    transactions,
    buyStock,
    sellStock,
    addToWatchlist,
    watchlist,
  } = useApp();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stockData, setStockData] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [position, setPosition] = useState('long');
  const [tab, setTab] = useState('trade');
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const priceRef = useRef(null);
  const portfolioRef = useRef(null);
  const prevPortfolioValue = useRef(0);
  const selectedStock = STOCK_LIST[selectedIndex];

  const fetchData = useCallback(async (index) => {
    const stock = STOCK_LIST[index ?? selectedIndex];
    setLoading(true);
    const nextData = await getStockData(stock.symbol);
    setStockData(nextData);

    const holdingSyms = Object.keys(holdings);
    const priceUpdates = { [stock.symbol]: nextData.price };
    if (holdingSyms.length > 0) {
      await Promise.all(holdingSyms.map(async (sym) => {
        if (sym !== stock.symbol) {
          const d = await getStockData(sym);
          priceUpdates[sym] = d.price;
        }
      }));
    }
    setLivePrices((prev) => ({ ...prev, ...priceUpdates }));

    setLastRefreshed(new Date());
    setLoading(false);
  }, [selectedIndex, holdings]);

  useEffect(() => {
    fetchData(selectedIndex);
    setAiInsight('');
  }, [fetchData, selectedIndex]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(selectedIndex), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, selectedIndex]);

  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLivePrices((current) => {
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

  useEffect(() => {
    if (!priceRef.current || !stockData) {
      return;
    }

    gsap.fromTo(
      priceRef.current,
      { scale: 1.08, color: stockData.change >= 0 ? '#22c55e' : '#b6250d' },
      { scale: 1, color: '#1c1c1e', duration: 0.45, ease: 'power2.out' },
    );
  }, [stockData?.price, stockData]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(''), 2800);
  }

  const expectedBasePrice = stockData?.price ?? 0;
  const price = livePrices[selectedStock?.symbol] ?? expectedBasePrice;
  const change = stockData?.change ?? 0;
  const displaySymbol = selectedStock.symbol.replace('.NS', '').replace('%26', '&');
  const tradeCost = parseFloat((quantity * price).toFixed(2));
  const riskScore = Math.min(Math.round(leverage * 26 + (Math.abs(change) > 2 ? 10 : 0)), 95);
  const inWatchlist = watchlist.some((entry) => entry.symbol === selectedStock.symbol);
  const holding = holdings[selectedStock.symbol];
  const pnlPercent = holding
    ? (((price - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2)
    : null;

  function handleBuy() {
    if (quantity < 1) {
      showToast('Please enter a valid quantity.');
      return;
    }

    if (tradeCost > balance) {
      showToast('Not enough balance for this trade.');
      return;
    }

    buyStock(selectedStock.symbol, selectedStock.name, quantity, price, change);
    showToast(`Bought ${quantity} share(s) of ${displaySymbol}. Portfolio, watchlist, and balance updated.`);
  }

  function handleSell() {
    if (!holding || quantity > holding.qty) {
      showToast('You do not have enough shares to sell.');
      return;
    }

    const isClosingPosition = holding.qty === quantity;
    sellStock(selectedStock.symbol, quantity, price, change);
    showToast(
      isClosingPosition
        ? `Sold ${displaySymbol}. Position closed and removed from watchlist.`
        : `Sold ${quantity} share(s) of ${displaySymbol}. Holdings and balance updated.`,
    );
  }

  function handleWatchlist() {
    if (inWatchlist) {
      showToast(`${displaySymbol} is already in your watchlist.`);
      return;
    }

    addToWatchlist({
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      price,
      change,
      currency: 'Rs.',
    });
    showToast(`${displaySymbol} added to your watchlist.`);
  }

  async function handleAIInsight() {
    setAiLoading(true);
    setAiInsight('');

    try {
      const insight = await generateRiskInsight({
        symbol: displaySymbol,
        price: price.toLocaleString('en-IN'),
        change: `${change >= 0 ? '+' : ''}${change}%`,
        volatility: Math.round(riskScore * 0.4),
        position,
        leverage,
        capital: tradeCost,
      });
      setAiInsight(insight);
    } catch {
      setAiInsight('Could not connect to AI. Please check your internet connection and API key.');
    }

    setAiLoading(false);
  }

  async function handlePDFReport() {
    setPdfLoading(true);
    let reportText = aiInsight;

    if (!reportText) {
      try {
        reportText = await generateRiskInsight({
          symbol: displaySymbol,
          price,
          change,
          volatility: 25,
          position,
          leverage,
          capital: tradeCost,
        });
      } catch {
        reportText = `Risk report for ${displaySymbol}. Position: ${position}, Leverage: ${leverage}x, Capital: Rs. ${tradeCost.toLocaleString('en-IN')}.`;
      }
    }

    downloadPDFReport({
      title: `${displaySymbol} - Simulation Risk Report`,
      symbol: displaySymbol,
      reportText,
      metrics: {
        'Current Price': `Rs. ${price.toLocaleString('en-IN')}`,
        'Day Change': `${change >= 0 ? '+' : ''}${change}%`,
        Capital: `Rs. ${tradeCost.toLocaleString('en-IN')}`,
        'Risk Score': `${riskScore}/100`,
        Position: `${position} ${leverage}x`,
        Balance: `Rs. ${balance.toLocaleString('en-IN')}`,
      },
      generatedAt: new Date().toLocaleString('en-IN'),
    });

    setPdfLoading(false);
  }

  const livePortfolioValue = Object.entries(holdings).reduce(
    (sum, [sym, entry]) => sum + entry.qty * (livePrices[sym] || entry.avgPrice),
    0
  );

  const investedValue = Object.values(holdings).reduce(
    (sum, entry) => sum + entry.qty * entry.avgPrice,
    0
  );

  const unrealizedPnL = livePortfolioValue - investedValue;
  const unrealizedPnLPercent = investedValue > 0 ? (unrealizedPnL / investedValue) * 100 : 0;
  
  const accountValue = balance + livePortfolioValue;
  const realizedProfit = balance + investedValue - 100000;

  useEffect(() => {
    if (!portfolioRef.current || prevPortfolioValue.current === 0) {
      prevPortfolioValue.current = livePortfolioValue;
      return;
    }
    const isUp = livePortfolioValue >= prevPortfolioValue.current;
    gsap.fromTo(
      portfolioRef.current,
      { color: isUp ? '#22c55e' : '#b6250d' },
      { color: '#0f172a', duration: 1.2, ease: 'power2.out' }
    );
    prevPortfolioValue.current = livePortfolioValue;
  }, [livePortfolioValue]);

  return (
    <div className="min-h-screen bg-mesh" style={{ fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div className="fixed bottom-24 right-4 z-[98] rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-2xl md:right-6">
          {toast}
        </div>
      )}

      <section className="bg-surface-container-low px-8 py-12">
        <div className="mx-auto max-w-screen-2xl">
          <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#5140c8]">
            Simulation Engine
          </span>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mb-3 text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-[-0.03em] text-[#1c1c1e]">
                Risk-Free <span className="text-[#5140c8]">Simulation Sandbox</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#49454f]">
                Practice buying and selling stocks with fake money. You start with
                <strong className="text-[#5140c8]"> Rs. 100,000 </strong>
                of virtual balance.
              </p>
            </div>

            <button
              onClick={() => router.push('/portfolio')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              <span className="material-symbols-outlined text-lg">pie_chart</span>
              View Portfolio
            </button>
          </div>
        </div>
      </section>

      <section className="px-8 py-10">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <div className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-[11px] font-bold tracking-[0.14em] text-slate-400">
                  SELECT ASSET
                </label>
              </div>
              <div className="mb-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                  <input
                    type="text"
                    placeholder="Search market..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-[#1c1c1e] outline-none transition focus:border-[#5140c8] focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {STOCK_LIST.map((stock, index) => ({ stock, index }))
                  .filter(({ stock }) => 
                    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    stock.exchange.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(({ stock, index }) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedIndex(index);
                        setQuantity(1);
                        setLeverage(1);
                      }}
                      className={`rounded-2xl px-3 py-3 text-left text-sm font-bold transition flex flex-col justify-between ${isSelected ? 'bg-[#5140c8] text-white shadow-md' : 'bg-slate-100 text-[#1c1c1e] hover:bg-slate-200'
                        }`}
                    >
                      <div className="truncate w-full">{stock.symbol.replace('.NS', '').replace('%26', '&').replace('-USD', '')}</div>
                      <div className={`mt-1 text-[10px] font-medium truncate w-full ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                        {stock.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex rounded-2xl bg-slate-100 p-1">
                {[
                  ['trade', 'Trade'],
                  ['analysis', 'AI Explain'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 rounded-2xl px-3 py-2 text-sm font-bold transition ${tab === key ? 'bg-[#5140c8] text-white' : 'text-slate-500'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'trade' ? (
                <>
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold tracking-[0.08em] text-slate-400">
                          HOW MANY SHARES
                        </label>
                        <button
                          onClick={() => {
                            if (price > 0) {
                              const maxShares = Math.floor(balance / price);
                              setQuantity(Math.max(1, maxShares));
                            }
                          }}
                          className="rounded bg-[#f4f0ff] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#5140c8] transition hover:bg-[#5140c8] hover:text-white"
                        >
                          MAX
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-[#5140c8]">
                        Total: Rs. {tradeCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#f4f0ff] text-xl font-black text-[#5140c8] transition hover:bg-[#5140c8] hover:text-white shadow-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-black text-[#1c1c1e] outline-none transition focus:border-[#5140c8] focus:ring-2 focus:ring-[#5140c8]/20"
                      />
                      <button
                        onClick={() => setQuantity((current) => current + 1)}
                        className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#f4f0ff] text-xl font-black text-[#5140c8] transition hover:bg-[#5140c8] hover:text-white shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-[11px] font-bold tracking-[0.08em] text-slate-400">
                        LEVERAGE
                      </label>
                      <span className="text-sm font-extrabold text-[#5140c8]">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={leverage}
                      onChange={(event) => setLeverage(Number(event.target.value))}
                      className="range-input"
                    />
                    <p className="mt-2 text-[11px] text-slate-400">
                      1x means no borrowing. Higher leverage increases risk quickly.
                    </p>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-2">
                    {['long', 'short'].map((nextPosition) => (
                      <button
                        key={nextPosition}
                        onClick={() => setPosition(nextPosition)}
                        className={`rounded-2xl px-3 py-3 text-sm font-bold capitalize transition ${position === nextPosition ? 'bg-[#5140c8] text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {nextPosition === 'long' ? 'Buy (Long)' : 'Sell Short'}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleBuy}
                      disabled={tradeCost > balance || loading}
                      className="rounded-2xl bg-[#5140c8] px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      BUY
                    </button>
                    <button
                      onClick={handleSell}
                      disabled={!holding || loading}
                      className="rounded-2xl bg-[#b6250d] px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      SELL {holding ? `(${holding.qty})` : ''}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleWatchlist}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${inWatchlist
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-600'
                        }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {inWatchlist ? 'bookmark' : 'bookmark_border'}
                      </span>
                      {inWatchlist ? 'Watching' : 'Watchlist'}
                    </button>
                    <button
                      onClick={handlePDFReport}
                      disabled={pdfLoading}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                      {pdfLoading ? 'Saving...' : 'PDF Report'}
                    </button>
                  </div>

                  {holding && (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-emerald-700">
                        YOUR POSITION
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[#1c1c1e]">
                          {holding.qty} shares @ Rs. {holding.avgPrice.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-sm font-extrabold ${Number(pnlPercent) >= 0 ? 'text-emerald-700' : 'text-[#b6250d]'}`}>
                          {Number(pnlPercent) >= 0 ? '+' : ''}{pnlPercent}%
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="mb-3 text-sm leading-6 text-slate-500">
                    Get a simple explanation of the risk of trading {displaySymbol} right now.
                  </p>
                  <button
                    onClick={handleAIInsight}
                    disabled={aiLoading}
                    className="mb-3 w-full rounded-2xl bg-[#5140c8] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c6bfff]"
                  >
                    {aiLoading ? 'Thinking...' : 'Explain the Risk'}
                  </button>
                  {aiInsight ? (
                    <div className="rounded-2xl bg-[#f4f0ff] p-4">
                      <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#5140c8]">
                        AI RISK EXPLANATION
                      </div>
                      <p className="text-sm leading-7 text-[#1c1c1e]">{aiInsight}</p>
                    </div>
                  ) : (
                    <p className="text-center text-xs leading-5 text-slate-400">
                      The AI explains risk in plain language, with no jargon.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#1c1c1e]">Risk Score</span>
                <span className={`text-base font-extrabold ${riskScore > 60 ? 'text-[#b6250d]' : riskScore > 40 ? 'text-orange-500' : 'text-emerald-600'
                  }`}>
                  {riskScore}/100
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${riskScore}%`,
                    background: riskScore > 60 ? '#b6250d' : riskScore > 40 ? '#f97316' : '#22c55e',
                  }}
                />
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                Risk score combines leverage and how sharply this stock is moving today.
              </p>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              {loading ? (
                <div className="flex h-56 items-center justify-center">
                  <div className="pyramid-loader">
                    <div className="wrapper">
                      <span className="side side1" />
                      <span className="side side2" />
                      <span className="side side3" />
                      <span className="side side4" />
                      <span className="shadow" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xl font-extrabold text-[#1c1c1e]">{selectedStock.name}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span ref={priceRef} className="text-4xl font-black text-[#1c1c1e]">
                          Rs. {price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className={`text-sm font-bold ${change >= 0 ? 'text-emerald-600' : 'text-[#b6250d]'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}% {change >= 0 ? 'up' : 'down'}
                        </span>
                        {!stockData?.live && (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-400">
                            estimated
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-[10px] tracking-[0.14em] text-slate-400">YOUR BALANCE</div>
                      <div className="text-2xl font-black text-[#5140c8]">Rs. {balance.toLocaleString('en-IN')}</div>
                      {lastRefreshed && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          Updated {lastRefreshed.toLocaleTimeString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-48 w-full">
                    <MiniChart data={stockData?.history} positive={change >= 0} />
                  </div>

                  {stockData?.history?.length > 0 && (
                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                      <span>{stockData.history[0]?.date}</span>
                      <span>1 Month Chart</span>
                      <span>{stockData.history[stockData.history.length - 1]?.date}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-[10px] text-slate-400">Cost of Trade</div>
                <div className="mt-1 text-xl font-black text-[#5140c8]">Rs. {tradeCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="mt-1 text-[10px] text-slate-400">Current order size</div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  Live Portfolio
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div ref={portfolioRef} className="mt-1 text-xl font-black text-[#0f172a]">Rs. {livePortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="mt-1 text-[10px] text-slate-400">Current market value</div>
              </div>

              <div className="group relative rounded-2xl bg-white p-4 shadow-sm cursor-help">
                <div className="text-[10px] text-slate-400 border-b border-dashed border-slate-300 w-max pb-0.5">Unrealized P&L</div>
                <div className="mt-1 text-xl font-black" style={{ color: unrealizedPnL >= 0 ? '#16a34a' : '#b6250d' }}>
                  {unrealizedPnL >= 0 ? '+' : ''}Rs. {unrealizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">{unrealizedPnLPercent >= 0 ? '+' : ''}{unrealizedPnLPercent.toFixed(2)}% of invested</div>
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 rounded bg-[#111827] px-3 py-2 text-[10px] font-medium text-white opacity-0 shadow-xl transition-all group-hover:-top-12 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 w-max">
                  This is your profit if you sold everything right now.
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-[10px] text-slate-400">Realized Profit</div>
                <div className="mt-1 text-xl font-black" style={{ color: realizedProfit >= 0 ? '#16a34a' : '#b6250d' }}>
                  {realizedProfit >= 0 ? '+' : ''}Rs. {realizedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">From closed positions</div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-extrabold text-[#1c1c1e]">Transaction History</h3>
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No trades yet. Buy or sell a stock above to see your history here.
                </p>
              ) : (
                <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                  {transactions.slice(0, 20).map((trade, index) => (
                    <div key={`${trade.symbol}-${trade.time}-${index}`} className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 px-4 py-3 transition hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md ${trade.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {trade.type}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1c1c1e]">
                            {trade.symbol.replace('.NS', '').replace('%26', '&')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {trade.qty} shares • {new Date(trade.time).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#1c1c1e]">
                          Rs. {(trade.qty * trade.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
