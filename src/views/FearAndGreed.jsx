"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { generateSentimentInsight } from '../services/gemini';
import { downloadPDFReport } from '../services/pdfReport';

gsap.registerPlugin(ScrollTrigger);

function GaugeChart({ value }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const centerX = 200;
  const centerY = 190;
  const outerRadius = 150;
  const innerRadius = 102;
  const tickRadius = 86;
  const numberRadius = 92;
  const gap = 2.5;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const valueToAngle = (input) => -180 + (input / 100) * 180;

  const segments = [
    { min: 0, max: 25, label: ['EXTREME', 'FEAR'], inactive: '#eceff3', active: '#fca5a5', border: '#ef4444' },
    { min: 25, max: 50, label: ['FEAR'], inactive: '#eceff3', active: '#fdba74', border: '#f97316' },
    { min: 50, max: 60, label: ['NEUTRAL'], inactive: '#eceff3', active: '#fde68a', border: '#eab308' },
    { min: 60, max: 75, label: ['GREED'], inactive: '#eceff3', active: '#86efac', border: '#22c55e' },
    { min: 75, max: 100, label: ['EXTREME', 'GREED'], inactive: '#eceff3', active: '#4ade80', border: '#16a34a' },
  ];

  const boundaries = [0, 25, 50, 75, 100];
  const ticks = Array.from({ length: 21 }, (_, index) => index * 5);
  const activeIndex = clampedValue >= 100
    ? segments.length - 1
    : segments.findIndex((segment) => clampedValue >= segment.min && clampedValue < segment.max);

  const polar = (angle, radius) => ({
    x: centerX + radius * Math.cos(toRadians(angle)),
    y: centerY + radius * Math.sin(toRadians(angle)),
  });

  const arcPath = (startAngle, endAngle, radiusOuter, radiusInner) => {
    const p1 = polar(startAngle, radiusOuter);
    const p2 = polar(endAngle, radiusOuter);
    const p3 = polar(endAngle, radiusInner);
    const p4 = polar(startAngle, radiusInner);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return `M ${p1.x} ${p1.y} A ${radiusOuter} ${radiusOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${radiusInner} ${radiusInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
  };

  const needleAngle = valueToAngle(clampedValue);
  const needleTip = polar(needleAngle, innerRadius - 18);

  return (
    <svg viewBox="0 0 400 300" className="mx-auto block w-full max-w-xl">
      {segments.map((segment, index) => {
        const startAngle = valueToAngle(segment.min) + gap / 2;
        const endAngle = valueToAngle(segment.max) - gap / 2;
        const isActive = index === activeIndex;

        return (
          <path
            key={`${segment.min}-${segment.max}`}
            d={arcPath(startAngle, endAngle, outerRadius, innerRadius)}
            fill={isActive ? segment.active : segment.inactive}
            stroke={isActive ? segment.border : '#ffffff'}
            strokeWidth={isActive ? 2.5 : 1}
          />
        );
      })}

      {segments.map((segment, index) => {
        const midpoint = valueToAngle((segment.min + segment.max) / 2);
        const point = polar(midpoint, outerRadius + 26);
        const isActive = index === activeIndex;

        return (
          <text
            key={`label-${segment.min}`}
            x={point.x}
            y={point.y}
            fill={isActive ? '#111827' : '#94a3b8'}
            fontSize="10"
            fontWeight="800"
            letterSpacing="0.06em"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {segment.label.join(' ')}
          </text>
        );
      })}

      {ticks.map((tick) => {
        const point = polar(valueToAngle(tick), tickRadius);
        const major = tick % 25 === 0;
        return (
          <circle
            key={tick}
            cx={point.x}
            cy={point.y}
            r={major ? 2.8 : 1.6}
            fill={major ? '#64748b' : '#cbd5e1'}
          />
        );
      })}

      {boundaries.map((boundary) => {
        const point = polar(valueToAngle(boundary), numberRadius);
        return (
          <text
            key={boundary}
            x={point.x}
            y={point.y}
            fill="#64748b"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {boundary}
          </text>
        );
      })}

      <line
        x1={centerX}
        y1={centerY}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="#111827"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx={centerX} cy={centerY} r="9" fill="#111827" />
      <circle cx={centerX} cy={centerY} r="4" fill="#ffffff" />

      <text
        x={centerX}
        y={centerY + 62}
        fill="#111827"
        fontSize="46"
        fontWeight="900"
        textAnchor="middle"
      >
        {Math.round(clampedValue)}
      </text>
      <text
        x={centerX}
        y={centerY + 84}
        fill="#94a3b8"
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.1em"
      >
        INDEX SCORE
      </text>
    </svg>
  );
}

const HISTORICAL_DATA = [
  { month: 'Apr', value: 38 },
  { month: 'May', value: 45 },
  { month: 'Jun', value: 52 },
  { month: 'Jul', value: 63 },
  { month: 'Aug', value: 70 },
  { month: 'Sep', value: 55 },
  { month: 'Oct', value: 62 },
  { month: 'Nov', value: 78 },
  { month: 'Dec', value: 61 },
  { month: 'Jan', value: 48 },
  { month: 'Feb', value: 42 },
  { month: 'Mar', value: 62 },
];

function HistoryBar({ month, value }) {
  const color = value >= 75
    ? '#22c55e'
    : value >= 60
      ? '#4ade80'
      : value >= 50
        ? '#eab308'
        : value >= 25
          ? '#f97316'
          : '#ef4444';

  return (
    <div className="flex min-w-[2.6rem] flex-1 flex-col items-center gap-2">
      <span className="text-[10px] font-semibold text-slate-500">{value}</span>
      <div className="flex h-44 w-full items-end rounded-2xl bg-slate-100 px-1 pb-1">
        <div
          className="w-full rounded-xl"
          style={{ height: `${Math.max(value, 8)}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-semibold text-slate-500">{month}</span>
    </div>
  );
}

const zones = [
  { label: 'Extreme Greed', range: '75-100', dot: '#22c55e', desc: 'The market is very excited. Prices can run ahead of reality.' },
  { label: 'Greed', range: '60-74', dot: '#4ade80', desc: 'Investors feel confident, so discipline matters more than hype.' },
  { label: 'Neutral', range: '50-59', dot: '#eab308', desc: 'The market is balanced and waiting for a stronger signal.' },
  { label: 'Fear', range: '25-49', dot: '#f97316', desc: 'Investors are nervous and quick to react to bad news.' },
  { label: 'Extreme Fear', range: '0-24', dot: '#ef4444', desc: 'Panic is high, which can create opportunities for patient buyers.' },
];

const drivers = [
  { label: 'Market Momentum', value: 68, icon: 'trending_up', weight: '25%', explain: 'Is the market moving up or down compared with recent weeks?' },
  { label: 'Put/Call Ratio', value: 71, icon: 'swap_vert', weight: '20%', explain: 'Are traders buying more downside protection than upside bets?' },
  { label: 'Volatility (VIX)', value: 55, icon: 'show_chart', weight: '20%', explain: 'How sharply are prices moving from day to day?' },
  { label: 'Social Sentiment', value: 62, icon: 'forum', weight: '15%', explain: 'What tone are investors using in public discussions?' },
  { label: 'Fund Flows', value: 70, icon: 'account_balance_wallet', weight: '10%', explain: 'Is money flowing into equities or leaving them?' },
  { label: 'Safe-Haven Demand', value: 48, icon: 'security', weight: '10%', explain: 'Are investors hiding in gold, bonds, or cash?' },
];

export default function FearAndGreed() {
  const [liveValue, setLiveValue] = useState(62);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    let baseValue = 62;

    const fetchLiveFNG = async () => {
      try {
        // Fetch from our internal proxy API instead of relying on the Vercel environment variable
        const response = await fetch("/api/fng");
        const data = await response.json();
        if (data?.data?.[0]?.value) {
          baseValue = Number(data.data[0].value);
          setLiveValue(baseValue);
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchLiveFNG();
    // Re-sync every 60 seconds just in case of hourly roll-overs
    const syncInterval = setInterval(fetchLiveFNG, 60000);

    const tickInterval = setInterval(() => {
      setLiveValue((current) => {
        // Create live jitter anchored to the real underlying API value
        const gravity = (baseValue - current) * 0.1;
        const nextValue = current + (Math.random() - 0.5) * 0.6 + gravity;
        return Math.min(100, Math.max(0, parseFloat(nextValue.toFixed(1))));
      });
    }, 2800);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.fg-card', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  const currentZone = liveValue >= 75
    ? zones[0]
    : liveValue >= 60
      ? zones[1]
      : liveValue >= 50
        ? zones[2]
        : liveValue >= 25
          ? zones[3]
          : zones[4];

  const activeColor = currentZone.dot;

  async function handleAIInsight() {
    setAiLoading(true);
    try {
      const insight = await generateSentimentInsight(liveValue.toFixed(1), drivers);
      setAiInsight(insight);
    } catch (error) {
      if (error?.message?.includes('429') || error?.message?.includes('fetch')) {
        setAiInsight('The AI is currently processing high traffic (Rate Limit). Please wait a few seconds and tap again.');
      } else {
        setAiInsight('Could not load AI analysis. If you haven\'t added your Gemini API key to Vercel, please add it. Otherwise, click again to retry.');
      }
    }
    setAiLoading(false);
  }

  function handlePDF() {
    downloadPDFReport({
      title: 'Fear and Greed Index Report',
      symbol: 'SENTIMENT',
      reportText: aiInsight || `Current Fear and Greed Index: ${liveValue.toFixed(1)} - ${currentZone.label}. ${currentZone.desc}`,
      metrics: {
        'Index Value': Math.round(liveValue),
        Zone: currentZone.label,
        Yesterday: 60,
        'Last Week': 55,
      },
      generatedAt: new Date().toLocaleString('en-IN'),
    });
  }

  return (
    <div className="min-h-screen bg-mesh" style={{ fontFamily: 'Inter, sans-serif' }}>
      <section className="bg-surface-container-low px-8 py-12">
        <div className="mx-auto max-w-screen-xl">
          <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#5140c8]">
            Sentiment Analysis
          </span>
          <h1 className="mb-4 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.9] tracking-[-0.03em] text-[#1c1c1e]">
            Fear and Greed <span className="text-[#5140c8]">Index</span>
          </h1>
          <p className="max-w-2xl text-lg leading-7 text-[#49454f]">
            This index measures how scared or excited investors are about the stock market right now.
            A score of 0 means extreme fear, while 100 means extreme greed.
          </p>
        </div>
      </section>

      <section className="px-8 py-12" ref={sectionRef}>
        <div className="mx-auto max-w-screen-xl space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="fg-card rounded-3xl bg-white p-8 shadow-sm lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#1c1c1e]">Live Reading</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-ping rounded-full bg-secondary"></span>
                  <span className="inline-block h-2 w-2 rounded-full bg-secondary"></span>
                  <span className="text-[10px] font-bold tracking-[0.14em] text-[#b6250d]">LIVE</span>
                </div>
              </div>

              <GaugeChart value={liveValue} />

              <div className="text-center">
                <span
                  className="inline-block rounded-full px-5 py-2 text-lg font-extrabold text-[#1c1c1e]"
                  style={{ background: activeColor }}
                >
                  {currentZone.label}
                </span>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  {currentZone.desc}
                </p>
              </div>

              <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
                {[{ label: 'YESTERDAY', value: 60 }, { label: 'LAST WEEK', value: 55 }].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[#f4f0ff] px-4 py-3 text-center">
                    <div className="text-[9px] font-bold tracking-[0.14em] text-slate-400">{item.label}</div>
                    <div className="text-2xl font-black text-[#1c1c1e]">{item.value}</div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-400">
                Last updated: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="fg-card flex flex-col rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="mb-5 text-lg font-extrabold text-[#1c1c1e]">12-Month History</h2>
              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-[32rem] items-end gap-3">
                  {HISTORICAL_DATA.map((item) => (
                    <HistoryBar key={item.month} month={item.month} value={item.value} />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  { color: '#ef4444', label: 'Extreme Fear' },
                  { color: '#f97316', label: 'Fear' },
                  { color: '#eab308', label: 'Neutral' },
                  { color: '#22c55e', label: 'Greed' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-[10px] font-semibold text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fg-card rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="mb-5 text-lg font-extrabold text-[#1c1c1e]">What Each Zone Means</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {zones.map((zone) => (
                <div
                  key={zone.label}
                  className="rounded-2xl p-4"
                  style={{
                    background: currentZone.label === zone.label ? `${zone.dot}18` : '#f9f9f9',
                    border: currentZone.label === zone.label ? `2px solid ${zone.dot}` : '2px solid transparent',
                  }}
                >
                  <div className="mb-3 h-2.5 w-2.5 rounded-full" style={{ background: zone.dot }} />
                  <div className="text-sm font-bold text-[#1c1c1e]">{zone.label}</div>
                  <div className="mt-1 text-xs font-bold" style={{ color: zone.dot }}>{zone.range}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{zone.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="fg-card rounded-3xl bg-white p-8 shadow-sm lg:col-span-2">
              <h3 className="mb-5 text-lg font-extrabold text-[#1c1c1e]">What Makes Up This Score</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {drivers.map((driver) => (
                  <div key={driver.label} className="rounded-2xl bg-[#f9f9f9] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f0ff]">
                        <span className="material-symbols-outlined text-xl text-[#5140c8]">{driver.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#1c1c1e]">{driver.label}</div>
                        <div className="text-[10px] text-slate-400">Weight: {driver.weight}</div>
                      </div>
                    </div>
                    <p className="mb-3 text-xs leading-5 text-slate-500">{driver.explain}</p>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[#5140c8]"
                        style={{ width: `${driver.value}%` }}
                      />
                    </div>
                    <div className="mt-2 text-right text-xs font-bold text-[#5140c8]">{driver.value}/100</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fg-card flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#1c1c1e]">AI Explanation</h3>
              <p className="text-sm leading-6 text-slate-500">
                Get a simple explanation of what this reading means for a beginner investor.
              </p>
              <button
                onClick={handleAIInsight}
                disabled={aiLoading}
                className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed"
                style={{ background: aiLoading ? '#c6bfff' : '#5140c8' }}
              >
                {aiLoading ? 'Thinking...' : 'Explain This to Me'}
              </button>
              {aiInsight && (
                <div className="rounded-2xl bg-[#f4f0ff] p-4">
                  <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#5140c8]">
                    AI EXPLANATION
                  </div>
                  <p className="text-sm leading-7 text-[#1c1c1e]">{aiInsight}</p>
                </div>
              )}
              <button
                onClick={handlePDF}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-[#1c1c1e] transition hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                Download Report
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
