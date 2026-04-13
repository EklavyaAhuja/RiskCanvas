"use client";

import { useMemo, useState } from 'react';
import { generateMarketChatReply } from '../services/gemini';
import { STOCK_LIST } from '../services/stockData';

const QUICK_QUESTIONS = [
  'What does the market mood look like right now?',
  'Is it smarter to average in slowly or wait?',
  'What should I watch before buying a tech stock?',
];

function buildMarketSnapshot() {
  const featured = STOCK_LIST.slice(0, 5)
    .map((stock) => stock.symbol.replace('.NS', '').replace('%26', '&'))
    .join(', ');

  return `Featured symbols in this app: ${featured}. Fear and Greed is around the low 60s, which suggests investors are leaning optimistic but not euphoric.`;
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask about market mood, stocks in the simulator, or what a beginner should watch before buying.',
    },
  ]);

  const marketSnapshot = useMemo(() => buildMarketSnapshot(), []);

  async function askChatbot(nextQuestion) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || loading) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setQuestion('');
    setLoading(true);

    try {
      const reply = await generateMarketChatReply({
        question: trimmed,
        marketSnapshot,
      });

      setMessages((current) => [...current, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'I could not reach the AI service just now. Please try again in a moment.',
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[95] w-[min(24rem,calc(100vw-2rem))] rounded-[1.75rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl md:right-6">
          <div className="flex items-center justify-between rounded-t-[1.75rem] bg-[#111827] px-5 py-4 text-white">
            <div>
              <div className="text-sm font-black tracking-wide">StockAI</div>
              <div className="text-xs text-slate-300">Guidance for beginners</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close chatbot"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div data-lenis-prevent="true" className="max-h-96 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user'
                    ? 'ml-10 bg-[#5140c8] text-white'
                    : 'mr-6 bg-slate-100 text-slate-700'
                  }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="mr-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((item) => (
                <button
                  key={item}
                  onClick={() => askChatbot(item)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                data-lenis-prevent="true"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={2}
                placeholder="Ask about the market or a stock..."
                className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-[#1c1c1e] outline-none transition focus:border-[#5140c8]"
              />
              <button
                onClick={() => askChatbot(question)}
                disabled={loading || !question.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5140c8] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send question"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-4 right-4 z-[96] flex h-16 w-16 items-center justify-center rounded-full bg-[#5140c8] text-white shadow-2xl transition hover:scale-105 md:bottom-6 md:right-6"
        aria-label="Open market chatbot"
      >
        <span className="material-symbols-outlined text-3xl">forum</span>
      </button>
    </>
  );
}
