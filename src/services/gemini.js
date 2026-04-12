import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

// Primary and Fallback models
const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-2.5-flash';

const API_KEY_HINT = 'Please add your Gemini API key to the .env file as NEXT_PUBLIC_GEMINI_API_KEY.';

const BEGINNER_RULE = `You are a patient, friendly guide helping first-time investors in India understand the stock market.
Follow these rules strictly:
- Write like you are explaining to a friend over chai, not writing a report.
- Always use the user's actual rupee amounts in your explanation — never speak in vague percentages alone.
- If a situation is risky, name one real-world consequence (e.g., "you could lose the cost of a new phone").
- If you use any finance word (like volatility, leverage, VaR), immediately explain it in plain words in brackets.
- Never give "consult a financial advisor" as your main advice — give a real, simple suggestion first.
- End every response with: "Next step: [one clear, simple action the user can take today]."
- Maximum 5 sentences. Plain text only. No bullet points, no markdown, no asterisks.`;

/**
 * Robust wrapper to call Gemini with a fallback if the primary model fails (e.g., 429 Rate Limit).
 */
async function callGemini(prompt) {
  if (!API_KEY) return API_KEY_HINT;

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(`[Gemini] Primary model (${PRIMARY_MODEL}) failed:`, error);

    // If it's a 429 (Rate Limit) or other connection error, try the fallback
    if (error.message?.includes('429') || error.message?.includes('fetch')) {
      console.log(`[Gemini] Attempting fallback to ${FALLBACK_MODEL}...`);
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
        const result = await fallbackModel.generateContent(prompt);
        return result.response.text();
      } catch (fallbackError) {
        console.error(`[Gemini] Fallback model (${FALLBACK_MODEL}) also failed:`, fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
}

export async function generateRiskInsight({ symbol, price, change, volatility, position, leverage, capital }) {
  const potentialLoss = (capital * leverage * 0.1).toFixed(0);
  const potentialGain = (capital * leverage * 0.1).toFixed(0);

  const prompt = `${BEGINNER_RULE}

A first-time investor is looking at this stock:
- Stock: ${symbol}
- Current price: Rs. ${price}
- Today's price change: ${change}% (positive = went up, negative = went down)
- Volatility (how wildly the price swings): ${volatility}% — note that anything above 25% is considered high risk; the average stock is around 15%
- They want to ${position} this stock
- They are using ${leverage}x leverage (meaning: they are borrowing money to invest ${leverage} times their actual capital — this multiplies both gains AND losses)
- Their own money at stake: Rs. ${capital}
- Important: with ${leverage}x leverage, if the stock moves just 10% against them, they lose Rs. ${potentialLoss} — not just Rs. ${(capital * 0.1).toFixed(0)}

Answer these in your 5 sentences:
(1) Is this stock risky right now, and why in one plain sentence?
(2) What is the worst realistic thing that could happen to their Rs. ${capital} this week?
(3) Does the leverage make this safer or more dangerous — and why does it matter for a beginner?
(4) One honest, simple suggestion for what they should do or be careful about.
Then end with the Next step.`;

  return callGemini(prompt);
}

export async function generateFullReport({ symbol, metrics, scenarioName }) {
  const prompt = `${BEGINNER_RULE}

Write a plain-language risk summary for a beginner investor about:
- Stock or asset: ${symbol}
- Scenario: ${scenarioName || 'General analysis'}
- Key numbers from the analysis: ${JSON.stringify(metrics)}

In your 5 sentences, explain:
(1) What is the main risk this person is facing — in one sentence a 10-year-old could understand?
(2) What do these numbers actually mean for their money — use a rupee example?
(3) What is the most likely good outcome and the most likely bad outcome?
(4) One simple action they can take to protect themselves or improve their position.
Then end with the Next step.`;

  return callGemini(prompt);
}

export async function generateSentimentInsight(fearGreedValue, drivers) {
  let mood, historicalNote;

  if (fearGreedValue < 25) {
    mood = 'extreme fear — most investors are panicking and selling';
    historicalNote = 'Historically, extreme fear is often when experienced investors quietly start buying, because prices are very low.';
  } else if (fearGreedValue < 50) {
    mood = 'fear — investors are nervous and cautious';
    historicalNote = 'Markets in the fear zone often recover slowly, but sudden drops are still possible.';
  } else if (fearGreedValue < 65) {
    mood = 'neutral — the market is balanced, neither too excited nor too scared';
    historicalNote = 'Neutral markets are generally stable, but can shift quickly based on news.';
  } else if (fearGreedValue < 80) {
    mood = 'greed — investors are confident and buying aggressively';
    historicalNote = 'When greed is high, prices are often inflated and a correction (sudden price fall) becomes more likely.';
  } else {
    mood = 'extreme greed — almost everyone is overexcited and overbuying';
    historicalNote = 'Extreme greed has historically been followed by sharp market drops. This is when experienced investors get cautious.';
  }

  const prompt = `${BEGINNER_RULE}

The Fear and Greed Index is at ${fearGreedValue} out of 100. This means the market mood right now is: ${mood}.
${historicalNote}

Key market signals right now: ${drivers.map(d => `${d.label} is at ${d.value}/100`).join(', ')}.

In your 5 sentences:
(1) Explain what a Fear and Greed index score of ${fearGreedValue} means — as if explaining to someone who has never heard of it.
(2) What does history tell us usually happens after the market hits this level?
(3) Which of the key signals above is most important for a beginner to pay attention to, and why?
(4) What should a beginner specifically do — or avoid doing — in this market mood?
Then end with the Next step.`;

  return callGemini(prompt);
}

export async function generateLossInsight({ prob, var95, volatility, period, investment }) {
  const var95Rounded = Number(var95).toLocaleString();
  const safeProb = Number(prob).toFixed(1);

  const prompt = `${BEGINNER_RULE}

A beginner has run a loss probability simulation for their investment:
- Money invested: Rs. ${investment.toLocaleString()}
- Risk level (volatility — how much price swings): ${volatility}% (above 25% is high risk)
- Time period being analysed: ${period} days
- Probability of losing more than the threshold: ${safeProb}% — meaning roughly ${safeProb} out of 100 similar investments would lose more than expected
- 95% VaR (Value at Risk — the worst loss expected on a bad day, 19 out of 20 times): Rs. ${var95Rounded}
  In other words: on a really bad day, this investment could lose Rs. ${var95Rounded} — that is like losing [compare this to something relatable like a month's grocery bill or a mid-range phone]

In your 5 sentences:
(1) Explain what a ${safeProb}% loss probability actually means in plain, everyday terms.
(2) Is Rs. ${var95Rounded} a big or small loss for someone investing Rs. ${investment.toLocaleString()} — put it in perspective.
(3) Is this a high-risk or low-risk situation overall, and what is the single biggest reason?
(4) One concrete thing they can do right now to reduce this risk.
Then end with the Next step.`;

  return callGemini(prompt);
}

export async function generatePortfolioAdvice({ holdings, balance, transactions, marketSnapshot }) {
  const prompt = `${BEGINNER_RULE}

A beginner investor wants advice on their virtual portfolio:
- Cash available: Rs. ${balance}
- Stocks they currently hold: ${holdings}
- Their recent buy/sell activity: ${transactions}
- Current market conditions: ${marketSnapshot}

Analyse this like a wise friend who knows finance, and in your 5 sentences:
(1) What does their portfolio tell you — are they too concentrated in one stock or sector, or well spread out?
(2) Given today's market conditions, what is the biggest risk their current portfolio faces right now?
(3) Is there one stock or position that looks worrying or one that looks good — and why in plain words?
(4) One specific action they should consider this week — either to protect what they have or to improve their position.
Then end with the Next step.`;

  return callGemini(prompt);
}

export async function generateMarketChatReply({ question, marketSnapshot }) {
  const prompt = `${BEGINNER_RULE}

You are a friendly, knowledgeable in-app chatbot helping a beginner investor understand markets.
Current market snapshot: ${marketSnapshot}
The user's question: "${question}"

Answer guidelines:
- Give a direct, honest answer to their specific question first — do not dodge it.
- Use a simple real-world analogy or rupee example if it helps explain the concept.
- If the question is about what to buy or sell, give a cautious educational perspective (explain the factors to consider), and gently remind them that real investment decisions should be their own informed choice.
- If the question contains a finance term they might not know, define it simply in brackets.
In your 5 sentences, answer their question clearly, helpfully, and honestly.
Then end with the Next step.`;

  return callGemini(prompt);
}