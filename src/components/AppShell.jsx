"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactLenis } from 'lenis/react';
import NavBar from './NavBar';
import Footer from './Footer';
import TickerBar from './TickerBar';
import FloatingChatbot from './FloatingChatbot';
import { AppProvider } from '../context/AppContext';
import GlobalSplash from './GlobalSplash';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

function SmoothScroll() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';

    const handleClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const selector = anchor.getAttribute('href');
      if (!selector || selector === '#') return;
      let target = null;
      try { target = document.querySelector(selector); } catch { return; }
      if (!target) return;

      event.preventDefault();
      gsap.to(window, {
        duration: 1,
        ease: 'power3.out',
        scrollTo: { y: target, offsetY: 120 },
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

function ScrollReset() {
  const pathname = usePathname();

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

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const handleOpenVideo = () => setShowVideo(true);
    window.addEventListener('open-methodology-video', handleOpenVideo);
    return () => window.removeEventListener('open-methodology-video', handleOpenVideo);
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      <GlobalSplash>
        <AppProvider>
          <div className="flex min-h-screen flex-col bg-mesh">
            <SmoothScroll />
            <ScrollReset />

            {/* Global Methodology Video Modal — available on every page */}
            {showVideo && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                <div className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <button
                    onClick={() => setShowVideo(false)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-colors"
                  >
                    <span className="material-symbols-outlined font-normal text-2xl">close</span>
                  </button>
                  <video
                    src="/videos/Methodology.mp4"
                    controls
                    autoPlay
                    onCanPlay={(e) => { e.target.volume = 0.3; }}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </div>
              </div>
            )}

            <div className="fixed left-0 right-0 top-0 z-[70]">
              <TickerBar />
            </div>

            <div className="relative z-[60]" style={{ marginTop: '36px' }}>
              <NavBar isHome={isHome} />
            </div>

            <main className="flex-grow">{children}</main>

            <Footer />
            <FloatingChatbot />
          </div>
        </AppProvider>
      </GlobalSplash>
    </ReactLenis>
  );
}
