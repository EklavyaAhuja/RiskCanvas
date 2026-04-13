import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import TickerBar from './components/TickerBar';
import FloatingChatbot from './components/FloatingChatbot';
import { AppProvider } from './context/AppContext';

import PlatformOverview from './pages/PlatformOverview';
import AIAnalysis from './pages/AIAnalysis';
import SimulationSandbox from './pages/SimulationSandbox';
import LossProbability from './pages/LossProbability';
import ScenarioStressTest from './pages/ScenarioStressTest';
import FearAndGreed from './pages/FearAndGreed';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

function SmoothScroll() {
  useEffect(() => {
    const normalize = ScrollTrigger.normalizeScroll(true);
    document.documentElement.style.scrollBehavior = 'auto';

    const handleClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) {
        return;
      }

      const selector = anchor.getAttribute('href');
      if (!selector || selector === '#') return;
      let target = null;
      try { target = document.querySelector(selector); } catch { return; }
      if (!target) {
        return;
      }

      event.preventDefault();
      gsap.to(window, {
        duration: 1,
        ease: 'power3.out',
        scrollTo: {
          y: target,
          offsetY: 120,
        },
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      normalize.kill();
    };
  }, []);

  return null;
}

function ScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    gsap.fromTo(
      'main',
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'all' },
    );

    gsap.to(window, { scrollTo: 0, duration: 0.45, ease: 'power2.out' });
  }, [pathname]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-mesh">
      <SmoothScroll />
      <ScrollReset />

      <div className="fixed left-0 right-0 top-0 z-[70]">
        <TickerBar />
      </div>

      <div className="relative z-[60]" style={{ marginTop: '36px' }}>
        <NavBar isHome={isHome} />
      </div>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<PlatformOverview />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/simulation" element={<SimulationSandbox />} />
          <Route path="/loss-calculator" element={<LossProbability />} />
          <Route path="/stress-test" element={<ScenarioStressTest />} />
          <Route path="/fear-greed" element={<FearAndGreed />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>

      <Footer />
      <FloatingChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}
