"use client";

import { useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { generateLossInsight } from '../services/gemini';
import { downloadPDFReport } from '../services/pdfReport';

export default function LossProbability() {
  const [investment, setInvestment] = useState(500000);
  const [threshold, setThreshold] = useState(20);
  const [period, setPeriod] = useState(252);
  const [volatility, setVolatility] = useState(25);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const probability = Math.min(
    95,
    Math.round((volatility / 100) * (threshold / 30) * Math.sqrt(period / 252) * 140),
  );
  const var95 = (investment * volatility / 100 * 1.645 * Math.sqrt(period / 252)).toFixed(0);
  const cvar = (Number(var95) * 1.35).toFixed(0);
  const expectedLoss = (investment * probability / 100 * threshold / 100).toFixed(0);

  async function handleAIInsight() {
    setAiLoading(true);
    try {
      const insight = await generateLossInsight({
        prob: probability,
        var95,
        volatility,
        period,
        investment,
      });
      setAiInsight(insight);
    } catch {
      setAiInsight('AI analysis unavailable. Please try again in a moment.');
    }
    setAiLoading(false);
  }

  function handlePDF() {
    setPdfLoading(true);
    downloadPDFReport({
      title: 'Loss Probability Analysis Report',
      symbol: 'PORTFOLIO',
      reportText: aiInsight || `Loss probability analysis: ${probability}% chance of exceeding ${threshold}% loss over ${period} days at ${volatility}% volatility.`,
      metrics: {
        'Loss Probability': `${probability}%`,
        'VaR (95%)': `Rs.${Number(var95).toLocaleString('en-IN')}`,
        CVaR: `Rs.${Number(cvar).toLocaleString('en-IN')}`,
        'Expected Loss': `Rs.${Number(expectedLoss).toLocaleString('en-IN')}`,
      },
      generatedAt: new Date().toLocaleString('en-IN'),
    });
    setPdfLoading(false);
  }

  return (
    <div className="min-h-screen bg-mesh font-body">
      <section className="bg-surface-container-low px-8 py-12">
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <span className="mb-4 block font-mono text-xs font-black uppercase tracking-widest text-secondary">
              Risk Quantification
            </span>
            <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-7xl">
              Loss Probability <br />
              <span className="text-secondary">Calculator</span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-on-surface-variant">
              Tune a few core parameters and see how potential downside changes under different volatility assumptions.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 lg:grid-cols-3">
          <ScrollReveal className="space-y-5 lg:col-span-1">
            <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
              <h2 className="mb-6 text-xl font-black text-on-surface">Parameters</h2>

              {[
                { label: 'Portfolio Value (Rs.)', value: investment, setter: setInvestment, min: 10000, max: 10000000, step: 10000, format: (value) => `Rs.${Number(value).toLocaleString('en-IN')}` },
                { label: 'Loss Threshold (%)', value: threshold, setter: setThreshold, min: 5, max: 90, step: 5, format: (value) => `${value}%` },
                { label: 'Time Horizon (days)', value: period, setter: setPeriod, min: 1, max: 504, step: 1, format: (value) => `${value}d` },
                { label: 'Volatility (%)', value: volatility, setter: setVolatility, min: 5, max: 100, step: 1, format: (value) => `${value}%` },
              ].map((param) => (
                <div key={param.label} className="mb-6">
                  <div className="mb-2 flex justify-between">
                    <label className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                      {param.label}
                    </label>
                    <span className="font-mono text-sm font-black text-primary">
                      {param.format(param.value)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={param.value}
                    onChange={(event) => param.setter(Number(event.target.value))}
                    className="range-input"
                  />
                </div>
              ))}

              <button
                onClick={handleAIInsight}
                disabled={aiLoading}
                className="mt-2 w-full rounded-xl primary-gradient py-4 text-base font-semibold tracking-wide text-white btn-interactive disabled:opacity-60"
              >
                {aiLoading ? 'Analyzing...' : 'Run AI Risk Analysis'}
              </button>

              <button
                onClick={handlePDF}
                disabled={pdfLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container py-3 text-sm font-semibold tracking-wide text-on-surface btn-interactive transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                {pdfLoading ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
            </div>

            <div className="rounded-3xl bg-primary-fixed/40 p-6">
              <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                Methodology
              </span>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                This educational view uses a simple volatility-based approximation to show how loss probability can expand as time horizon and uncertainty rise.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6 lg:col-span-2">
            <ScrollReveal>
              <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface">Loss Probability</h2>
                    <p className="mt-1 text-on-surface-variant">
                      Probability of losing more than {threshold}% over {period} days.
                    </p>
                  </div>
                  <div className={`font-mono text-6xl font-black ${probability > 50 ? 'text-secondary' : probability > 30 ? 'text-amber-500' : 'text-primary'}`}>
                    {probability}%
                  </div>
                </div>

                <div className="relative mb-4 h-12 overflow-hidden rounded-full risk-gauge-bar">
                  <div className="absolute left-0 top-0 h-full rounded-r-full bg-black/10" style={{ width: `${probability}%` }} />
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-on-surface bg-white cloud-shadow transition-all duration-500"
                    style={{ left: `${probability}%` }}
                  />
                </div>

                <div className="flex justify-between font-mono text-xs text-on-surface-variant">
                  <span>Very Low Risk</span>
                  <span>Moderate</span>
                  <span>High Risk</span>
                </div>

                {aiInsight && (
                  <div className="mt-6 rounded-2xl bg-primary-fixed/30 p-5">
                    <div className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                      AI Risk Analysis
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface">{aiInsight}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: 'VaR (95%)', value: `Rs.${Number(var95).toLocaleString('en-IN')}`, sub: 'Value at Risk', color: 'text-primary' },
                  { label: 'CVaR', value: `Rs.${Number(cvar).toLocaleString('en-IN')}`, sub: 'Conditional VaR', color: 'text-amber-600' },
                  { label: 'Expected Loss', value: `Rs.${Number(expectedLoss).toLocaleString('en-IN')}`, sub: 'Probability-weighted', color: 'text-secondary' },
                  { label: 'Safe Capital', value: `Rs.${(investment - Number(var95)).toLocaleString('en-IN')}`, sub: 'After VaR adjustment', color: 'text-emerald-600' },
                ].map((metric) => (
                  <div key={metric.label} className="cloud-shadow rounded-2xl bg-surface-container-lowest p-5 text-center">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{metric.label}</div>
                    <div className={`mb-1 font-mono text-xl font-black ${metric.color}`}>{metric.value}</div>
                    <div className="font-mono text-[9px] text-on-surface-variant">{metric.sub}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
                <h3 className="mb-5 font-bold text-on-surface">Loss Distribution Scenarios</h3>
                <div className="space-y-3">
                  {[
                    { scenario: 'Bull Case (5th percentile)', loss: -2.3, returnValue: '+18.4%' },
                    { scenario: 'Base Case (50th percentile)', loss: -8.7, returnValue: '+9.2%' },
                    { scenario: 'Bear Case (95th percentile)', loss: -Number((volatility * 1.645 * Math.sqrt(period / 252) / 10).toFixed(1)), returnValue: '-12.1%' },
                    { scenario: 'Black Swan (99th percentile)', loss: -Number((volatility * 2.326 * Math.sqrt(period / 252) / 10).toFixed(1)), returnValue: '-31.5%' },
                  ].map((scenario) => (
                    <div key={scenario.scenario} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-surface-container">
                      <div className="text-sm font-medium text-on-surface-variant">{scenario.scenario}</div>
                      <div className="flex gap-8 font-mono text-sm font-bold">
                        <span className={scenario.loss < -15 ? 'text-secondary' : scenario.loss < -5 ? 'text-amber-500' : 'text-emerald-600'}>
                          {scenario.loss}%
                        </span>
                        <span className={scenario.returnValue.startsWith('+') ? 'text-emerald-600' : 'text-secondary'}>
                          {scenario.returnValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
