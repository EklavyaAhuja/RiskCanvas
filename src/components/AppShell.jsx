"use client";

import { useEffect } from 'react';
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
    // We let Lenis handle the main normalization, but keep scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto';

    const handleClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) {
        return;
      }

      const selector = anchor.getAttribute('href');
      const target = selector ? document.querySelector(selector) : null;
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
    };
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

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      <GlobalSplash>
        <AppProvider>
          <div className="flex min-h-screen flex-col bg-mesh">
            <SmoothScroll />
            <ScrollReset />

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
