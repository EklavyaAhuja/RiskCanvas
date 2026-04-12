"use client";

import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Globe3DDemo from '@/components/3d-globe-demo';
import CardSwap, { Card } from '@/components/ui/CardSwap';
import Globe from '@/components/ui/3d-orb';
import ArchitecturalBackground from '@/components/ui/ArchitecturalBackground';
import { BackgroundLines } from '@/components/ui/background-lines';
import { IconCloud } from '@/components/ui/icon-cloud';

gsap.registerPlugin(ScrollTrigger);

const LOGO_DEV_KEY = "pk_FGfoJ8YTRAaGzKfxhJfNlw";

const companies = [
  { name: "Paytm", domain: "paytm.com" },
  { name: "PhonePe", domain: "phonepe.com" },
  { name: "Razorpay", domain: "razorpay.com" },
  { name: "CRED", domain: "cred.club" },
  { name: "Zerodha", domain: "zerodha.com" },
  { name: "Groww", domain: "groww.in" },
  { name: "Upstox", domain: "upstox.com" },
  { name: "Angel One", domain: "angelone.in" },
  { name: "PolicyBazaar", domain: "policybazaar.com" },
  { name: "BankBazaar", domain: "bankbazaar.com" },
  { name: "INDmoney", domain: "indmoney.com" },
  { name: "Jupiter", domain: "jupiter.money" },
  { name: "Fi Money", domain: "fi.money" },
  { name: "BharatPe", domain: "bharatpe.com" },
  { name: "MobiKwik", domain: "mobikwik.com" },
  { name: "Navi", domain: "navi.com" },
];

export function IconCloudDemo() {
  const images = companies.map(
    (c) => `https://img.logo.dev/${c.domain}?token=${LOGO_DEV_KEY}&size=128`
  );

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <IconCloud images={images} />
    </div>
  );
}

const features = [
  {
    title: 'Stock Simulation',
    desc: 'Mimic live market dynamics with absolute precision and zero financial exposure.',
    icon: 'monitoring',
    span: 'md:col-span-3',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ToCD0pXYPEXDzeOL34z_vS5otwbagtlIvgVUCnMoNRZfFgAH2RzMLqC-oN2VNyetpgjDzslZESYLm0PPRlTkE649of3ksyZJ8EPlS4ufpn5NMAcQDQrxtjsmjsCuEZ4GGGdkDXu8hGZTtV4t5KgD1KOnG_2dQ5nOh3HgzZFhwX2oCow_NqBTYyZsZQjAHoBRNC4ZaaXddx1uNUhmR9A3dM44xWxJ5GZB9nWySpXh-qzIEn_XepzMfSbXdPrTlnSPOa7ktHe02-G2',
    route: '/simulation',
  },
  {
    title: 'AI-Powered Analysis',
    desc: 'Our proprietary models scan global news cycles to highlight truly impactful data.',
    icon: 'auto_awesome',
    span: 'md:col-span-3',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_tatY_eXzJlbQTYj6W8rdednAjwTpPHtA_5tehLZJ40qlLY21n-26ijkhrXHreYE5RZJ1JIN7n5VfH-xX9pKNoZb5-asnarhwCzFcDkRVWKjAVNWrIOTgxRfJpUDbve8WRNesoAVEnmsFpAvDteuG2e9tHl99s76RkU8W6tCJMq6W7KXnvedfzivRPNWmkzXnAb3Kh7dboDpC_KZVM9dftmFmd7REI0P8SCwHZB_lAJSDctB3qAnEwZietIFgKm6YeR2vbo0a0fEd',
    route: '/ai-analysis',
  },
  {
    title: 'Fear Index',
    desc: 'Quantify market sentiment and panic thresholds in real-time.',
    icon: 'psychology',
    span: 'md:col-span-2',
    img: null,
    route: '/fear-greed',
  },
  {
    title: 'Loss Calculator',
    desc: 'Measure potential downside with surgical mathematical precision.',
    icon: 'calculate',
    span: 'md:col-span-2',
    img: null,
    route: '/loss-calculator',
  },
  {
    title: 'Stress Test',
    desc: 'Submit portfolios to synthetic black-swan events and market crashes.',
    icon: 'electric_bolt',
    span: 'md:col-span-2',
    img: null,
    route: '/stress-test',
  },
];

export default function PlatformOverview() {
  const router = useRouter();
  const heroRef = useRef(null);
  const cardSwapRef = useRef(null);
  const [liveScore, setLiveScore] = useState(62.8);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let baseScore = 62.8;
    const fetchLiveFNG = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        if (data?.data?.[0]?.value) {
          baseScore = Number(data.data[0].value);
          setLiveScore(baseScore);
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    fetchLiveFNG();
    const syncInterval = setInterval(fetchLiveFNG, 60000);
    const timer = setInterval(() => {
      setLiveScore((current) => {
        const gravity = (baseScore - current) * 0.1;
        const nextValue = current + (Math.random() - 0.5) * 0.6 + gravity;
        return Math.min(100, Math.max(0, parseFloat(nextValue.toFixed(1))));
      });
    }, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(syncInterval);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text entrance
      gsap.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 });
      gsap.from('.hero-title', { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.25 });
      gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.45 });
      gsap.from('.hero-btns', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.65 });
      gsap.from('.hero-video', { opacity: 0, scale: 0.9, x: 40, duration: 1, ease: 'power3.out', delay: 0.4 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-mesh min-h-screen flex flex-col font-body" ref={heroRef}>
      {/* Video Modal overlay */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden cloud-shadow border border-white/20">
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

      {/* Hero */}
      <BackgroundLines className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden w-full px-4">
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto py-24">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full max-w-none">
              <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="hero-badge inline-block px-4 py-1.5 rounded-full glass-card text-primary font-mono text-xs font-bold tracking-widest mb-8 border border-primary/20">
                  ESTABLISHED 2024
                </span>
                <h1 className="hero-title text-6xl md:text-9xl font-black tracking-tighter text-on-surface leading-[0.85] mb-10">
                  Master your <br />
                  <span className="text-primary">market fear.</span>
                </h1>
                <p className="hero-sub text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed mb-12">
                  RiskCanvas distills the complexity of global finance into crystalline clarity. Practice without risk, analyze with AI, and trade with confidence.
                </p>
                <div className="hero-btns flex flex-wrap justify-center lg:justify-start gap-5">
                  <button
                    onClick={() => router.push('/simulation')}
                    className="primary-gradient text-white px-10 py-5 rounded-lg font-bold text-lg cloud-shadow btn-interactive active:scale-95 z-20"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="bg-white/80 backdrop-blur-md text-on-surface px-10 py-5 rounded-lg font-bold text-lg btn-secondary-interactive active:scale-95 border border-outline-variant/30 z-20"
                  >
                    View Methodology
                  </button>
                </div>
              </div>

              <div className="hero-video w-full h-[600px] flex justify-center items-center relative z-20 overflow-visible">
                <IconCloudDemo />
                <div className="absolute inset-0 pointer-events-none bg-primary/10 blur-[120px] -z-10 rounded-full mix-blend-normal opacity-50" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </BackgroundLines>

      {/* Feature Cards — CardSwap 3D stack */}
      <section className="h-[100vh] min-h-[700px] w-full flex flex-col justify-center px-8 relative overflow-hidden bg-background">
        <ArchitecturalBackground />
        <div className="max-w-screen-2xl w-full mx-auto relative z-10 flex flex-col items-center justify-center">
          <ScrollReveal className="mb-12 text-center">
            <span className="font-mono text-xs text-primary font-black tracking-widest uppercase mb-4 block">
              Ecosystem Modules
            </span>
            <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
              Architectural <span className="text-primary">Risk Controls</span>
            </h2>
          </ScrollReveal>

          {/* Optimized spacing to prevent overlap while maintaining clear proximity to the heading */}
          <div className="flex flex-col items-center gap-4 pt-16 pb-0 z-10 w-full relative mt-4">
            <CardSwap
              ref={cardSwapRef}
              width={640}
              height={440}
              cardDistance={40}
              verticalDistance={30}
              delay={5000}
              pauseOnHover
              easing="elastic"
              skewAmount={5}
            >
              {/* MOCK VIDEO URL: "https://www.w3schools.com/html/mov_bbb.mp4" - replace with actual links below */}
              {/* Card 1 — Stock Simulation */}
              <Card
                customClass="bg-slate-200 cursor-pointer group shadow-xl"
                onClick={() => router.push('/simulation')}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-on-surface">Stock Simulation</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-[260px]">
                        Mimic live market dynamics with absolute precision and zero financial exposure.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined text-2xl">monitoring</span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden rounded-2xl mt-2">
                    <video
                      src="/videos/rc-1.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/90" />
                  </div>
                </div>
              </Card>

              {/* Card 2 — AI-Powered Analysis */}
              <Card
                customClass="bg-slate-200 cursor-pointer group shadow-xl"
                onClick={() => router.push('/ai-analysis')}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-on-surface">AI-Powered Analysis</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-[260px]">
                        Our proprietary models scan global news cycles to highlight truly impactful data.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden rounded-2xl mt-2">
                    <video
                      src="/videos/rc-2.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/90" />
                  </div>
                </div>
              </Card>

              {/* Card 3 — Fear Index */}
              <Card
                customClass="bg-slate-200 cursor-pointer group shadow-xl"
                onClick={() => router.push('/fear-greed')}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-on-surface">Fear Index</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-[280px]">
                        Quantify market sentiment and panic thresholds in real-time.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined text-2xl">psychology</span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden rounded-2xl mt-2 mb-4">
                    <video
                      src="/videos/rc-3.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/90" />
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                    <span>Explore Fear Index</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </div>
              </Card>

              {/* Card 4 — Loss Calculator */}
              <Card
                customClass="bg-slate-200 cursor-pointer group shadow-xl"
                onClick={() => router.push('/loss-calculator')}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-on-surface">Loss Calculator</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-[280px]">
                        Measure potential downside with surgical mathematical precision.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined text-2xl">calculate</span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden rounded-2xl mt-2 mb-4">
                    <video
                      src="/videos/rc-4.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/90" />
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                    <span>Explore Loss Calculator</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </div>
              </Card>

              {/* Card 5 — Stress Test */}
              <Card
                customClass="bg-slate-200 cursor-pointer group shadow-xl"
                onClick={() => router.push('/stress-test')}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-on-surface">Stress Test</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed max-w-[280px]">
                        Submit portfolios to synthetic black-swan events and market crashes.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <span className="material-symbols-outlined text-2xl">electric_bolt</span>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden rounded-2xl mt-2 mb-4">
                    <video
                      src="/videos/rc-5.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/90" />
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                    <span>Explore Stress Test</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </div>
              </Card>
            </CardSwap>

            {/* Next button — Bold circular arrow icon */}
            <button
              onClick={() => {
                console.log('Next button clicked');
                cardSwapRef.current?.next();
              }}
              className="group flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl shadow-primary/30 border-4 border-slate-50 hover:scale-110 active:scale-95 transition-all duration-300 z-50 mt-4 mb-0"
              aria-label="Next Feature"
            >
              <span className="material-symbols-outlined text-3xl text-primary font-black" style={{ fontVariationSettings: "'wght' 900" }}>
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-40 bg-surface">
        <div className="max-w-screen-2xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <ScrollReveal className="order-2 lg:order-1 relative group h-[500px]">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-full h-full relative z-10 rounded-[2.5rem] overflow-hidden border border-white/50 bg-black shadow-2xl">
              <div className="absolute inset-0 scale-150 transform">
                <Globe />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="order-1 lg:order-2">
            <span className="font-mono text-xs text-primary font-black tracking-widest uppercase mb-4 block">Intelligence Layer</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-10 text-on-surface leading-[0.9]">
              AI that speaks <br /><span className="text-primary">fluent finance.</span>
            </h2>
            <div className="space-y-10">
              {[
                { icon: 'auto_awesome', color: 'bg-primary-container', title: 'Insight Extraction', desc: 'Our proprietary models scan thousands of quarterly reports and global news cycles.', route: '/ai-analysis' },
                { icon: 'query_stats', color: 'bg-secondary-container', title: 'Predictive Modeling', desc: 'Anticipate market shifts based on historical fractal patterns and real-time stressors.', route: '/ai-analysis' },
                { icon: 'shield', color: 'bg-tertiary-container', title: 'Risk Scoring', desc: 'Receive dynamic risk scores that evolve with your portfolio in real-time.', route: '/loss-calculator' },
              ].map(item => (
                <div
                  key={item.title}
                  className="flex gap-6 group cursor-pointer"
                  onClick={() => router.push(item.route)}
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${item.color} flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-white text-3xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-on-surface-variant text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Fear Index Preview */}
      <section className="py-40 px-8 overflow-hidden bg-white">
        <div className="max-w-screen-xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-secondary font-black tracking-widest uppercase mb-4 block">Proprietary Sentiment Analysis</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-20">The Market <span className="text-secondary">Fear Index</span></h2>
            <div className="relative py-20">
              <div className="h-6 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full w-1/4 bg-primary-fixed opacity-40" />
                <div className="h-full w-1/4 bg-primary-fixed-dim" />
                <div className="h-full w-1/4 bg-secondary-fixed" />
                <div className="h-full w-1/4 bg-secondary" />
              </div>
              <div className="absolute top-1/2 left-[62%] -translate-y-1/2 -translate-x-1/2 z-20 group">
                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-outline-variant/20 w-72 text-left transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-105">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] font-black text-secondary tracking-widest">LIVE FEED</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                  </div>
                  <div className="text-6xl font-black mb-2 text-on-surface tracking-tighter transition-all duration-300">
                    {liveScore.toFixed(1)}
                  </div>
                  <div className="text-xl font-bold text-secondary mb-4">
                    {liveScore > 60 ? 'Elevated Anxiety' : liveScore > 40 ? 'Cautious' : 'Risk-On Mode'}
                  </div>
                  <button
                    onClick={() => router.push('/fear-greed')}
                    className="w-full primary-gradient text-white py-2.5 rounded-lg font-semibold text-sm btn-interactive"
                  >
                    View Full Index →
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#0d0c18] py-32 text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_-10%,#4f46e5,transparent_35%)]" />
          <div className="absolute left-0 top-1/2 h-full w-full bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.18),transparent_28%)]" />
          <div className="absolute right-0 top-1/3 h-full w-full bg-[radial-gradient(circle_at_80%_40%,rgba(168,85,247,0.2),transparent_30%)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-screen-2xl items-center gap-16 px-8 lg:grid-cols-[1fr_0.95fr]">
          <ScrollReveal className="text-center lg:text-left">
            <span className="mb-4 block font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Global Community
            </span>
            <h2 className="mb-8 text-5xl font-black leading-[0.9] tracking-tighter md:text-8xl">
              Join others from <br /> all over the world.
            </h2>
            <p className="mb-12 max-w-2xl text-xl leading-relaxed text-slate-300 lg:mx-0">
              Learn alongside ambitious investors, students, and operators tracking market risk across every major financial hub.
            </p>
            <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
              <button
                onClick={() => router.push('/simulation')}
                className="primary-gradient rounded-lg px-12 py-6 text-xl font-black shadow-xl shadow-primary/40 btn-interactive"
              >
                Start Free Simulation
              </button>
              <button
                onClick={() => router.push('/ai-analysis')}
                className="rounded-lg border border-white/20 bg-white/10 px-12 py-6 text-xl font-black text-white backdrop-blur-md btn-secondary-interactive"
              >
                Explore AI Analysis
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal className="relative">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-sm">
              <Globe3DDemo />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
