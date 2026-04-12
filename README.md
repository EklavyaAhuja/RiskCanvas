
# 🎯 RiskCanvas
### AI-Powered Financial Simulator

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)

> **Practice without risk. Analyze with AI. Trade with confidence.**

RiskCanvas distills the complexity of global finance into crystalline clarity. Simulate real equity trading with live market data, get AI-powered risk analysis from Google Gemini, and build market intuition — without risking a single rupee.

---

![RiskCanvas Dashboard](./public/videos/image.png)

---

## ✨ Features

- 📈 **Stock Simulation** — Live intraday prices via Yahoo Finance, auto-converted to INR in real time. Full P&L tracking, leverage controls, and position sizing — behaves like a real brokerage.
- 💼 **Live Portfolio Viewer** — Real-time dashboard tracking all simulated positions, gains, losses, and sector exposure as prices move.
- 🤖 **AI Portfolio Analysis** — One-click Google Gemini analysis reads your leverage, volatility exposure, and sector concentration — outputs a plain-English risk report with specific recommendations.
- 😨 **Fear & Greed Index** — Live global sentiment score from Alternative.me, translated by Gemini into actionable trading guidance. No jargon.
- 💸 **Loss Probability Calculator** — Input your position and leverage, see your exact loss at 10%, 20%, and 40% drawdown levels before you trade.
- 🔥 **Stress Test** — Run your current portfolio through historical Black Swan scenarios: 2008 Financial Crisis, COVID March 2020 crash, and a 40% market wipeout.
- 💬 **StockAI Chatbot** — Gemini-powered floating assistant that reads the live state of your portfolio and market data to answer questions without hallucinating external market information.
- 📄 **PDF Risk Reports** — Export your portfolio analysis as a downloadable PDF report, generated entirely client-side via jsPDF.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15, React |
| **Styling** | Tailwind CSS v4, Framer Motion, GSAP + ScrollTrigger |
| **Scrolling** | Lenis (@studio-freight/lenis) |
| **3D / Canvas** | Three.js, @react-three/fiber, @react-three/drei |
| **AI** | Google Gemini API (`gemini-pro`) via `@google/generative-ai` |
| **Data APIs** | Yahoo Finance (proxied), Alternative.me, ExchangeRate API |
| **UI Components** | Shadcn UI, MagicUI, Lucide React |
| **Export** | jsPDF (client-side PDF generation) |
| **Language** | TypeScript |

---

## 📡 APIs Used

| API | Purpose | Auth |
|-----|---------|------|
| [Yahoo Finance](https://query1.finance.yahoo.com) | Live intraday stock prices + 30-day historical data | None (proxied via AllOrigins) |
| [Alternative.me Fear & Greed](https://api.alternative.me/fng/) | Live global market sentiment index | None |
| [ExchangeRate API](https://api.exchangerate-api.com/v4/latest/USD) | Live USD → INR conversion | None |
| [Google Gemini](https://aistudio.google.com/) | AI risk analysis, sentiment translation, chatbot | API Key required |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- A free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/riskcanvas.git
cd riskcanvas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your free API key at [aistudio.google.com](https://aistudio.google.com/) → Create API Key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
riskcanvas/
├── app/                  # Next.js app router pages
├── components/           # React components
│   ├── ui/               # Shadcn + MagicUI base components
│   ├── StockSimulator/   # Simulation engine
│   ├── Portfolio/        # Portfolio dashboard
│   ├── FearGreed/        # Fear & Greed index
│   ├── StressTest/       # Stress test + loss calculator
│   └── ChatBot/          # StockAI chatbot
├── public/               # Static assets + demo screenshot
├── .env.example          # Environment variable template
├── .env                  # Your local keys (gitignored)
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |
| `NEXT_PUBLIC_EXCHANGE_RATE_API` | ExchangeRate API endpoint (pre-filled in .env.example) | ✅ Yes |
| `NEXT_PUBLIC_FNG_API` | Fear & Greed API endpoint (pre-filled in .env.example) | ✅ Yes |

---

## 🎥 Demo

▶️ [Watch the demo video](https://your-demo-link-here.com)

> If Gemini API quota is exceeded during judging, the demo video shows all AI features working live.

---

## 👥 Team

Built for the **Finvasia Innovation Hackathon 2026** — *Leveraging Emerging Trends and Technologies for Financial Innovation*

| Role | Responsibility |
|------|---------------|
| **Team Lead + Frontend** | Architecture, 3D visualizations, animations, Three.js globe |
| **AI Integration** | Gemini API — risk engine, sentiment analyzer, StockAI chatbot |
| **Data & APIs** | Yahoo Finance proxy, ExchangeRate, simulation engine, INR conversion |
| **UI/UX Design** | Design system, glassmorphism aesthetic, component library |

---

## 📄 License

MIT License — feel free to fork, learn from, and build on this project.

---

<p align="center">
  <strong>RiskCanvas</strong> — Master your market fear. 🎯
</p>
