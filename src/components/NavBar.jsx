"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/', label: 'Platform' },
  { to: '/simulation', label: 'Simulation' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/ai-analysis', label: 'AI Analysis' },
  { to: '/fear-greed', label: 'Fear Index' },
  { to: '/loss-calculator', label: 'Risk Labs' },
  { to: '/stress-test', label: 'Stress Test' },
];

export default function NavBar({ isHome = false }) {
  const [scrolled, setScrolled] = useState(false);
  const { watchlist, holdings, balance } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const holdingCount = Object.keys(holdings || {}).length;

  const linkClass = (href) =>
    pathname === href
      ? 'border-b-2 border-primary pb-1 font-bold text-primary transition-colors duration-200'
      : 'pb-1 font-medium text-slate-600 transition-colors duration-200 hover:text-primary';

  return (
    <nav
      className={`h-20 w-full overflow-hidden transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white/95 shadow-md backdrop-blur-xl'
          : 'bg-white/78 shadow-sm backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="pyramid-loader">
            <div className="wrapper">
              <span className="side side1"></span>
              <span className="side side2"></span>
              <span className="side side3"></span>
              <span className="side side4"></span>
              <span className="shadow"></span>
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter text-[#5140c8] md:text-2xl font-['Playfair_Display',Georgia,serif]">
            RiskCanvas
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} className={linkClass(item.to)} href={item.to}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-primary-fixed/60 px-3.5 py-1.5 text-primary md:flex shadow-sm border border-primary/10">
            <span className="material-symbols-outlined text-base">account_balance_wallet</span>
            <span className="font-mono text-xs font-black">
              Rs.{(balance || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <Link
            href="/watchlist"
            className="relative hidden items-center text-slate-600 transition-colors hover:text-primary md:flex"
          >
            <span className="material-symbols-outlined text-[22px]">bookmark</span>
            {watchlist?.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {watchlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/portfolio"
            className="relative hidden items-center text-slate-600 transition-colors hover:text-primary md:flex"
          >
            <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            {holdingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                {holdingCount}
              </span>
            )}
          </Link>

          <Link
            href="/simulation"
            className="rounded-lg bg-[#5140c8] px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] md:px-5"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
