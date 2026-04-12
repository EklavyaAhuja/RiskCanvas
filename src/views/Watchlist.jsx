"use client";

import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import ScrollReveal from '../components/ScrollReveal';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useApp();
  const router = useRouter();

  return (
    <div className="bg-mesh min-h-screen font-body">
      <section className="py-12 px-8 bg-surface-container-low">
        <div className="max-w-screen-xl mx-auto">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary font-black tracking-widest uppercase mb-4 block">Your Watchlist</span>
            <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-[0.9] mb-4">
              Stocks You're <span className="text-primary">Watching</span>
            </h1>
            <p className="text-on-surface-variant leading-relaxed">
              Track stocks you're interested in before committing virtual capital.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-10 px-8">
        <div className="max-w-screen-xl mx-auto">
          {watchlist.length === 0 ? (
            <div className="text-center py-24 bg-surface-container-lowest rounded-3xl cloud-shadow">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">bookmark_border</span>
              <h2 className="text-2xl font-black text-on-surface mb-3">No stocks in your watchlist</h2>
              <p className="text-on-surface-variant mb-6">Add stocks from the Simulation page to track them here.</p>
              <button
                onClick={() => router.push('/simulation')}
                className="primary-gradient text-white px-8 py-3 rounded-xl font-bold btn-interactive"
              >
                Go to Simulation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {watchlist.map((stock, i) => (
                <ScrollReveal key={stock.symbol} delay={i * 80}>
                  <div className="bg-surface-container-lowest rounded-3xl p-6 cloud-shadow hover-lift cursor-pointer group"
                    onClick={() => router.push('/simulation')}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-xl text-on-surface">{stock.symbol.replace('.NS', '').replace('%26', '&')}</h3>
                        <p className="text-on-surface-variant text-sm">{stock.name}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(stock.symbol); }}
                        className="text-on-surface-variant hover:text-secondary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-mono text-3xl font-black text-on-surface">
                          {stock.currency}{stock.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div className={`font-mono text-sm font-bold mt-1 ${stock.change >= 0 ? 'text-emerald-500' : 'text-secondary'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}% {stock.change >= 0 ? '↑' : '↓'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push('/simulation'); }}
                        className="primary-gradient text-white px-4 py-2 rounded-lg text-xs font-bold btn-interactive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Trade →
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
