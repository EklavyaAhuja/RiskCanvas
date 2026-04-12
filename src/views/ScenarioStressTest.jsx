"use client";

import { useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';

const scenarios = [
  {
    id: 'covid',
    label: '2020 COVID Crash',
    icon: 'coronavirus',
    drop: -34,
    duration: '33 days',
    recovery: '148 days',
    description: 'The S&P 500 dropped 34% in 33 days during the early pandemic shock.',
    sectors: { tech: -28, finance: -45, energy: -62, healthcare: 8 },
  },
  {
    id: 'gfc',
    label: '2008 Financial Crisis',
    icon: 'account_balance',
    drop: -57,
    duration: '517 days',
    recovery: '1,506 days',
    description: 'A banking and credit crisis pushed markets into a prolonged drawdown.',
    sectors: { tech: -52, finance: -73, energy: -68, healthcare: -23 },
  },
  {
    id: 'dotcom',
    label: '2000 Dot-com Bubble',
    icon: 'computer',
    drop: -49,
    duration: '929 days',
    recovery: '2,520 days',
    description: 'Technology speculation unwound and crushed richly valued internet stocks.',
    sectors: { tech: -78, finance: -35, energy: -10, healthcare: -21 },
  },
  {
    id: 'custom',
    label: 'Custom Black Swan',
    icon: 'build',
    drop: -25,
    duration: '90 days',
    recovery: '200 days',
    description: 'A synthetic stress event to see how your allocation behaves in a shock.',
    sectors: { tech: -20, finance: -30, energy: -15, healthcare: -10 },
  },
];

export default function ScenarioStressTest() {
  const [selected, setSelected] = useState(scenarios[0]);
  const [portfolio, setPortfolio] = useState(500000);
  const [techAlloc, setTechAlloc] = useState(40);
  const [financeAlloc, setFinanceAlloc] = useState(30);
  const [energyAlloc, setEnergyAlloc] = useState(20);

  const healthcareAllocation = Math.max(0, 100 - techAlloc - financeAlloc - energyAlloc);
  const totalImpact =
    (portfolio * techAlloc / 100) * (selected.sectors.tech / 100) +
    (portfolio * financeAlloc / 100) * (selected.sectors.finance / 100) +
    (portfolio * energyAlloc / 100) * (selected.sectors.energy / 100) +
    (portfolio * healthcareAllocation / 100) * (selected.sectors.healthcare / 100);
  const survivingCapital = portfolio + totalImpact;

  return (
    <div className="min-h-screen bg-mesh font-body">
      <section className="bg-surface-container-low px-8 pb-12 pt-24">
        <div className="mx-auto max-w-screen-2xl">
          <ScrollReveal>
            <span className="mb-4 block font-mono text-xs font-black uppercase tracking-widest text-secondary">
              Portfolio Resilience
            </span>
            <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tighter text-on-surface md:text-7xl">
              Scenario <br />
              <span className="text-secondary">Stress Test</span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-on-surface-variant">
              Move the portfolio sliders to see how historical shocks would affect different sector allocations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="mx-auto max-w-screen-2xl space-y-8">
          <ScrollReveal>
            <h2 className="mb-4 text-xl font-black text-on-surface">Select Scenario</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelected(scenario)}
                  className={`rounded-2xl p-5 text-left transition-all hover-lift ${
                    selected.id === scenario.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'cloud-shadow bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined mb-2 block text-2xl">{scenario.icon}</span>
                  <div className="text-sm font-bold">{scenario.label}</div>
                  <div className={`mt-1 font-mono text-lg font-black ${selected.id === scenario.id ? 'text-white/80' : 'text-secondary'}`}>
                    {scenario.drop}%
                  </div>
                </button>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ScrollReveal className="space-y-6 lg:col-span-1">
              <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
                <h2 className="mb-6 text-xl font-black text-on-surface">Portfolio Allocation</h2>

                <div className="mb-5">
                  <div className="mb-2 flex justify-between">
                    <label className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                      Total Value (Rs.)
                    </label>
                    <span className="font-mono text-sm font-black text-primary">
                      Rs.{portfolio.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={5000000}
                    step={50000}
                    value={portfolio}
                    onChange={(event) => setPortfolio(Number(event.target.value))}
                    className="range-input"
                  />
                </div>

                {[
                  { label: 'Technology', value: techAlloc, setter: setTechAlloc },
                  { label: 'Financials', value: financeAlloc, setter: setFinanceAlloc },
                  { label: 'Energy', value: energyAlloc, setter: setEnergyAlloc },
                ].map((item) => (
                  <div key={item.label} className="mb-5">
                    <div className="mb-2 flex justify-between">
                      <label className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                        {item.label}
                      </label>
                      <span className="font-mono text-sm font-black text-primary">{item.value}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={5}
                      value={item.value}
                      onChange={(event) => item.setter(Number(event.target.value))}
                      className="range-input"
                    />
                  </div>
                ))}

                <div className="rounded-xl bg-surface-container p-4">
                  <div className="font-mono text-xs text-on-surface-variant">Healthcare / Other</div>
                  <div className="font-mono text-xl font-black text-primary">{healthcareAllocation}%</div>
                </div>
              </div>
            </ScrollReveal>

            <div className="space-y-6 lg:col-span-2">
              <ScrollReveal>
                <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        Scenario
                      </span>
                      <h2 className="mt-1 text-2xl font-black text-on-surface">{selected.label}</h2>
                      <p className="mt-2 max-w-lg leading-relaxed text-on-surface-variant">
                        {selected.description}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="font-mono text-5xl font-black text-secondary">{selected.drop}%</div>
                      <div className="font-mono text-xs tracking-widest text-on-surface-variant">PEAK DRAWDOWN</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      { label: 'Duration', value: selected.duration, icon: 'timer' },
                      { label: 'Recovery Time', value: selected.recovery, icon: 'autorenew' },
                      { label: 'Portfolio Impact', value: `Rs.${Math.abs(totalImpact).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'trending_down' },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-2xl bg-surface-container p-4 text-center">
                        <span className="material-symbols-outlined mb-1 block text-xl text-on-surface-variant">
                          {metric.icon}
                        </span>
                        <div className="font-mono text-xl font-black text-on-surface">{metric.value}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <div className="cloud-shadow rounded-3xl bg-surface-container-lowest p-8">
                  <h3 className="mb-5 font-bold text-on-surface">Sector Impact Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(selected.sectors).map(([sector, impact]) => (
                      <div key={sector}>
                        <div className="mb-1 flex justify-between">
                          <span className="capitalize text-on-surface-variant">{sector}</span>
                          <span className={`font-mono text-sm font-black ${impact < 0 ? 'text-secondary' : 'text-emerald-600'}`}>
                            {impact > 0 ? '+' : ''}{impact}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                          <div
                            className={`h-full rounded-full ${impact < 0 ? 'bg-secondary' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.abs(impact)}%`, marginLeft: impact < 0 ? `${100 - Math.abs(impact)}%` : '0' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={160}>
                <div className="rounded-3xl bg-[#0d0c18] p-8 text-white">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-widest text-primary">
                        Surviving Capital
                      </span>
                      <div className="font-mono text-5xl font-black">
                        Rs.{Math.max(0, survivingCapital).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                      <div className={`mt-2 font-mono text-sm font-bold ${survivingCapital < portfolio ? 'text-secondary' : 'text-emerald-400'}`}>
                        {((survivingCapital / portfolio - 1) * 100).toFixed(1)}% scenario impact
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="font-mono text-sm text-slate-400">Initial Portfolio</div>
                      <div className="font-mono text-2xl font-black text-slate-300">
                        Rs.{portfolio.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
