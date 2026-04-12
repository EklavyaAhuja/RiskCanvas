"use client";

import { useState, useEffect } from 'react';
import { getAllTickerData, STOCK_LIST } from '../services/stockData';

function TickerItem({ symbol, price, change, currency, live }) {
  const displaySymbol = symbol.replace('.NS', '').replace('%26', '&');
  const up = change >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-white font-bold text-xs tracking-wider">{displaySymbol}</span>
      <span className="text-white/60 font-mono text-xs">{currency}{Number(price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
      <div className={`flex items-center font-bold text-xs ${up ? 'text-emerald-400' : 'text-rose-500'}`}>
        <span>{up ? '+' : ''}{change.toFixed(2)}%</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {up ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </div>
      {!live && <span className="text-white/20 text-[9px] font-mono">~</span>}
    </div>
  );
}

export default function TickerBar() {
  const [stocks, setStocks] = useState(
    STOCK_LIST.slice(0, 8).map(s => ({
      symbol: s.symbol,
      price: 1000,
      basePrice: 1000, // Anchors the jitter
      change: 0,
      baseChange: 0,
      currency: s.exchange === 'NASDAQ' ? '$' : '₹',
      live: false,
    }))
  );

  useEffect(() => {
    const fetchAndSet = () => {
      getAllTickerData().then(data => {
        if (data && data.length) {
          setStocks(data.map(s => ({ ...s, basePrice: s.price, baseChange: s.change })));
        }
      }).catch(() => {});
    };

    fetchAndSet();
    // Refresh true market values every 5 minutes
    const interval = setInterval(fetchAndSet, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Synthetic High-Frequency Jitter Engine
  // Simulates constant sub-second trading volume and price discovery
  // while remaining strictly pegged to the real market API baseline.
  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setStocks(current => 
        current.map(s => {
          if (!s.basePrice) return s;
          const noise = (Math.random() - 0.5) * 0.002; // ±0.1% variance
          const changeNoise = (Math.random() - 0.5) * 0.08;
          return {
            ...s,
            price: s.basePrice * (1 + noise),
            change: s.baseChange + changeNoise
          };
        })
      );
    }, 1500); // Ticks every 1.5 seconds
    
    return () => clearInterval(jitterInterval);
  }, []);

  const doubled = [...stocks, ...stocks];

  return (
    <div className="w-full bg-[#0d0c18] py-2.5 overflow-hidden whitespace-nowrap border-b border-white/5">
      <div className="flex animate-marquee">
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center gap-8 px-4">
            <TickerItem {...t} />
          </div>
        ))}
      </div>
    </div>
  );
}
