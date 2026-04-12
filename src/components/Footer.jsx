"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-slate-900 text-white">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full gap-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="pyramid-loader opacity-80">
            <div className="wrapper">
              <span className="side side1"></span>
              <span className="side side2"></span>
              <span className="side side3"></span>
              <span className="side side4"></span>
              <span className="shadow"></span>
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter font-['Playfair_Display',Georgia,serif]">RiskCanvas</span>
        </div>

        <div className="flex flex-wrap justify-center gap-10 font-mono text-xs uppercase tracking-widest">
          <Link href="/" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">Platform</Link>
          <Link href="/simulation" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">Simulation</Link>
          <Link href="/ai-analysis" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">AI Analysis</Link>
          <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">Privacy</a>
          <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">Terms</a>
          <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors opacity-80 hover:opacity-100">Methodology</a>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest text-slate-500 opacity-80">
          © 2024 RiskCanvas. Architectural Financial Education.
        </div>
      </div>
    </footer>
  );
}
