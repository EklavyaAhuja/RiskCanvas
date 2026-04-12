"use client";

import ScrollReveal from '../components/ScrollReveal';
import { useState, useEffect } from 'react';
import { generateRiskInsight } from '../services/gemini';
import { downloadPDFReport } from '../services/pdfReport';

const insights = [
  {
    tag: 'MACRO', tagColor: 'text-primary bg-primary-fixed', icon: 'language',
    title: 'Federal Reserve Rate Decision Impact', score: 94, scoreColor: 'text-primary',
    desc: 'Analysis indicates a 73% probability of a 25bps rate hike based on CPI data, labor market statistics, and Fed commentary. High impact expected on growth equities.',
    sectors: ['Financials', 'Growth Tech', 'REITs'], since: '2 hours ago',
    metrics: { 'Impact Score': 94, 'Affected Sectors': 3, 'Prob. Hike': '73%', 'Confidence': 'High' },
  },
  {
    tag: 'EARNINGS', tagColor: 'text-emerald-700 bg-emerald-100', icon: 'trending_up',
    title: 'Q3 Tech Earnings Beat Consensus', score: 87, scoreColor: 'text-emerald-600',
    desc: 'Seven of the top ten technology companies exceeded EPS estimates. AI-driven revenue streams showing consistent 40%+ YoY growth.',
    sectors: ['Technology', 'Semiconductors', 'Cloud'], since: '5 hours ago',
    metrics: { 'Impact Score': 87, 'Companies': 7, 'EPS Beat': '+12%', 'YoY AI Revenue': '+40%' },
  },
  {
    tag: 'GEOPOLITICAL', tagColor: 'text-secondary bg-secondary-fixed/50', icon: 'warning',
    title: 'Supply Chain Disruption Risk', score: 78, scoreColor: 'text-secondary',
    desc: 'Ongoing geopolitical tensions in key semiconductor manufacturing regions are creating a 34% elevated risk premium on chip stocks.',
    sectors: ['Semiconductors', 'Consumer Electronics', 'Automotive'], since: '1 day ago',
    metrics: { 'Impact Score': 78, 'Risk Premium': '+34%', 'Regions At Risk': 2, 'Alert Level': 'High' },
  },
];

const initialSentiments = [
  {
    tag: 'RETAIL', tagColor: 'text-amber-700 bg-amber-100', icon: 'groups',
    title: 'Retail Investors Shifting to Safe Havens', score: 62, scoreColor: 'text-amber-600',
    desc: 'Forum chatter and retail broker flows indicate a net outflow from high-beta tech into dividend aristocrats and utilities.',
    sectors: ['Utilities', 'Consumer Staples'], since: 'Just now',
    metrics: { 'Fear Gauge': 62, 'Retail Flows': '-$1.2B', 'Safe Inflows': '+$800M', 'Trend': 'Bearish' },
  },
  {
    tag: 'DARK POOL', tagColor: 'text-sky-700 bg-sky-100', icon: 'account_balance',
    title: 'Smart Money Accumulating Infrastructure', score: 81, scoreColor: 'text-sky-600',
    desc: 'Dark pool volume analysis shows significant block purchases in data center REITs and cooling technology providers.',
    sectors: ['REITs', 'Industrials', 'Tech'], since: '10 mins ago',
    metrics: { 'Confidence': 81, 'Accumulation Ratio': '2.4x', 'Block Trades': '142', 'Trend': 'Bullish' },
  }
];

const initialPredictions = [
  {
    tag: 'FRACTAL', tagColor: 'text-rose-700 bg-rose-100', icon: 'timeline',
    title: 'S&P 500 Pullback Probability', score: 68, scoreColor: 'text-rose-600',
    desc: 'Historical pattern matching against pre-correction phases suggests a temporary 5-8% drawdown in the next 14 trading days.',
    sectors: ['Broad Market', 'Index Funds'], since: 'Live',
    metrics: { 'Probability': '68%', 'Expected Drop': '-6.5%', 'Timeframe': '14 Days', 'Signal': 'Sell' },
  },
  {
    tag: 'M&A FORECAST', tagColor: 'text-fuchsia-700 bg-fuchsia-100', icon: 'handshake',
    title: 'Cybersecurity Consolidation Wave', score: 91, scoreColor: 'text-fuchsia-600',
    desc: 'Predictive pricing anomalies in mid-cap security firms point toward an impending buyout wave from big tech players.',
    sectors: ['Cybersecurity', 'Software'], since: 'Live',
    metrics: { 'Probability': '91%', 'Target Sector': 'IdAM', 'Expected Prem.': '+25%', 'Signal': 'Strong Buy' },
  }
];

const metrics = [
  { label: 'REPORTS ANALYZED', value: '2.4M', icon: 'article', color: 'bg-primary-fixed text-primary' },
  { label: 'NEWS SOURCES', value: '847', icon: 'rss_feed', color: 'bg-emerald-100 text-emerald-700' },
  { label: 'AVG ACCURACY', value: '91.2%', icon: 'verified', color: 'bg-amber-100 text-amber-700' },
  { label: 'UPDATE FREQ', value: '15min', icon: 'update', color: 'bg-rose-100 text-rose-700' },
];

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState('insights');
  const [aiInsights, setAiInsights] = useState({});
  const [loadingInsight, setLoadingInsight] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);

  // Live Simulation States
  const [liveInsights, setLiveInsights] = useState(insights);
  const [liveSentiments, setLiveSentiments] = useState(initialSentiments);
  const [livePredictions, setLivePredictions] = useState(initialPredictions);
  const [liveScore, setLiveScore] = useState(62.8);
  const [heatmap, setHeatmap] = useState([
    { sector: 'Technology', value: 87, color: 'bg-primary-container' },
    { sector: 'Financials', value: 72, color: 'bg-emerald-500' },
    { sector: 'Energy', value: 45, color: 'bg-amber-500' },
    { sector: 'Healthcare', value: 61, color: 'bg-sky-500' },
    { sector: 'Consumer', value: 34, color: 'bg-secondary' },
  ]);

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
      // Simulate real-time data stream variations
      const tickData = (arr) => arr.map(item => ({
        ...item,
        score: Math.min(100, Math.max(0, item.score + (Math.random() > 0.5 ? 1 : -1))),
        since: 'Live update...'
      }));

      setLiveInsights(tickData);
      setLiveSentiments(tickData);
      setLivePredictions(tickData);
      
      setLiveScore((current) => {
        const gravity = (baseScore - current) * 0.1;
        const nextValue = current + (Math.random() - 0.5) * 0.6 + gravity;
        return Math.min(100, Math.max(0, parseFloat(nextValue.toFixed(1))));
      });
      
      setHeatmap(prev => prev.map(s => ({
        ...s,
        value: Math.min(100, Math.max(0, s.value + Math.floor((Math.random() - 0.5) * 5)))
      })));
    }, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(syncInterval);
    };
  }, []);

  const getActiveData = () => {
    if (activeTab === 'sentiment') return liveSentiments;
    if (activeTab === 'predictions') return livePredictions;
    return liveInsights;
  };
  const activeDataList = getActiveData();

  async function handleGenerateInsight(item) {
    setLoadingInsight(item.tag);
    try {
      const insight = await generateRiskInsight({
        symbol: item.tag,
        price: item.score,
        change: `Impact: ${item.score}/100`,
        volatility: 30,
        position: 'macro analysis',
        leverage: 1,
        capital: 500000,
      });
      setAiInsights(prev => ({ ...prev, [item.tag]: insight }));
    } catch {
      setAiInsights(prev => ({
        ...prev,
        [item.tag]: 'AI analysis requires a valid Gemini API key. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.',
      }));
    }
    setLoadingInsight(null);
  }

  async function handlePDF(item) {
    setPdfLoading(item.tag);
    const reportText = aiInsights[item.tag] || item.desc;
    downloadPDFReport({
      title: item.title,
      symbol: item.tag,
      reportText: `${item.title}\n\n${reportText}`,
      metrics: item.metrics,
      generatedAt: new Date().toLocaleString('en-IN'),
    });
    setPdfLoading(null);
  }

  return (
    <div className="bg-mesh min-h-screen flex flex-col font-body">
      {/* Hero */}
      <section className="py-12 px-8 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary font-black tracking-widest uppercase mb-4 block">Intelligence Layer</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.9] mb-6">
              AI-Powered <br /><span className="text-primary">Market Analysis</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
              Our models process millions of data points to surface the signals that matter most to your portfolio strategy.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {metrics.map((m) => (
              <div key={m.label} className="bg-surface-container-lowest rounded-2xl p-5 cloud-shadow flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                  <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-on-surface">{m.value}</div>
                  <div className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase">{m.label}</div>
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky z-40 bg-white/80 backdrop-blur-md border-b border-surface-container" style={{ top: '116px' }}>
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex gap-8">
            {['insights', 'sentiment', 'predictions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold tracking-wide capitalize transition-colors ${activeTab === tab ? 'tab-active' : 'text-on-surface-variant hover:text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <section className="flex-1 py-10 px-8">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tab Content Rendering */}
          <div className="lg:col-span-2 space-y-6">
            {activeDataList.map((item, i) => (
              <ScrollReveal key={`${item.title}-${i}`} delay={i * 100}>
                <div className="bg-surface-container-lowest rounded-3xl p-8 cloud-shadow hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                      </div>
                      <div>
                        <span className={`font-mono text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${item.tagColor}`}>{item.tag}</span>
                        <h3 className="font-bold text-lg mt-1 text-on-surface">{item.title}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono text-2xl font-black ${item.scoreColor}`}>{item.score}</span>
                      <div className="font-mono text-[10px] text-on-surface-variant tracking-widest">IMPACT</div>
                    </div>
                  </div>

                  <p className="text-on-surface-variant leading-relaxed mb-4">{item.desc}</p>

                  {/* AI-generated insight */}
                  {aiInsights[item.tag] && (
                    <div className="bg-primary-fixed/30 rounded-xl p-4 mb-4">
                      <div className="font-mono text-[10px] text-primary tracking-widest font-black mb-1">🤖 GEMINI AI INSIGHT</div>
                      <p className="text-sm text-on-surface leading-relaxed">{aiInsights[item.tag]}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.sectors.map((s) => (
                      <span key={s} className="px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant">{s}</span>
                    ))}
                    <span className="ml-auto text-xs text-on-surface-variant font-mono">{item.since}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGenerateInsight(item)}
                      disabled={loadingInsight === item.tag}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-fixed text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      {loadingInsight === item.tag ? 'Analyzing...' : 'AI Insight'}
                    </button>
                    <button
                      onClick={() => handlePDF(item)}
                      disabled={pdfLoading === item.tag}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      {pdfLoading === item.tag ? 'Exporting...' : 'PDF Report'}
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ScrollReveal delay={200}>
              <div className="bg-surface-container-lowest rounded-3xl p-6 cloud-shadow">
                <h3 className="font-bold text-on-surface mb-4">Sector Heatmap</h3>
                <div className="space-y-3">
                  {heatmap.map((s) => (
                    <div key={s.sector}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-on-surface-variant">{s.sector}</span>
                        <span className="text-on-surface font-bold transition-all">{s.value}</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all duration-1000 ease-in-out`} style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-surface-container-lowest rounded-3xl p-6 cloud-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-on-surface">Live Sentiment</h3>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping inline-block"></span>
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                  </span>
                </div>
                <div className="text-6xl font-black font-mono text-on-surface mb-1 transition-all">
                  {liveScore.toFixed(1)}
                </div>
                <div className="text-secondary font-bold mb-4 flex items-center justify-between">
                  {liveScore > 60 ? 'Elevated Anxiety' : liveScore > 40 ? 'Cautious' : 'Risk-On Mode'}
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">LIVE</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Market participants are exhibiting clear signs of risk aversion with elevated put/call ratios.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="bg-[#0d0c18] text-white rounded-3xl p-6">
                <span className="font-mono text-[10px] text-primary tracking-widest font-black block mb-3">AI RECOMMENDATION</span>
                <h4 className="font-bold text-lg mb-2">Consider Hedging</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Based on current fear index levels and macro headwinds, consider 10–15% allocation to defensive positions.
                </p>
                <button
                  onClick={() => downloadPDFReport({
                    title: 'AI Market Recommendation Report',
                    symbol: 'MARKET',
                    reportText: 'Based on current market conditions including a Fear & Greed Index reading of 62.8 (Elevated Anxiety), elevated institutional risk aversion, and macroeconomic headwinds from Federal Reserve policy uncertainty, we recommend a defensive portfolio tilt. Consider reducing growth equity exposure by 10-15% and reallocating to defensive sectors such as Healthcare and Consumer Staples. Fixed income instruments with short duration offer additional protection against rate volatility.',
                    metrics: { 'Sentiment': '62.8', 'Signal': 'Hedge', 'Defensive Alloc.': '15%', 'Risk': 'Elevated' },
                    generatedAt: new Date().toLocaleString('en-IN'),
                  })}
                  className="mt-4 w-full primary-gradient text-white py-2.5 rounded-lg font-semibold text-sm btn-interactive"
                >
                  Download Full Report
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
