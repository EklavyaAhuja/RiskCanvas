/**
 * Real-time stock data service.
 * - NSE stocks: fetched directly in INR
 * - US stocks (NVDA, TSLA, AAPL, MSFT): USD converted to INR using live exchange rate
 * - CORS proxy: allorigins.win (no key required)
 * - Refreshed every 5 minutes; mock fallback if API fails
 */

// USD → INR conversion rate (fetched live, fallback 83.5)
let USD_TO_INR = 83.5;

async function fetchUsdRate() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_EXCHANGE_RATE_API, { signal: AbortSignal.timeout(4000) });
    const data = JSON.parse((await res.json()).contents);
    if (data?.rates?.INR) {
      USD_TO_INR = data.rates.INR;
    }
  } catch {
    // keep fallback
  }
}
fetchUsdRate(); // run once on load

export const STOCK_LIST = [
  // NSE Blue Chips
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries',        exchange: 'NSE', usd: false },
  { symbol: 'TCS.NS',      name: 'Tata Consultancy',           exchange: 'NSE', usd: false },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank',                  exchange: 'NSE', usd: false },
  { symbol: 'ICICIBANK.NS',name: 'ICICI Bank',                 exchange: 'NSE', usd: false },
  { symbol: 'INFY.NS',     name: 'Infosys',                    exchange: 'NSE', usd: false },
  { symbol: 'SBIN.NS',     name: 'State Bank of India',        exchange: 'NSE', usd: false },
  { symbol: 'BHARTIARTL.NS',name: 'Bharti Airtel',             exchange: 'NSE', usd: false },
  { symbol: 'ITC.NS',      name: 'ITC Ltd',                    exchange: 'NSE', usd: false },
  { symbol: 'LT.NS',       name: 'Larsen & Toubro',            exchange: 'NSE', usd: false },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank',                  exchange: 'NSE', usd: false },
  { symbol: 'TATAMOTORS.NS',name:'Tata Motors',                exchange: 'NSE', usd: false },
  { symbol: 'M%26M.NS',    name: 'Mahindra & Mahindra',        exchange: 'NSE', usd: false },
  { symbol: 'INDIGO.NS',   name: 'IndiGo Airlines',            exchange: 'NSE', usd: false },
  { symbol: 'WIPRO.NS',    name: 'Wipro Ltd',                  exchange: 'NSE', usd: false },
  { symbol: 'ZOMATO.NS',   name: 'Zomato Ltd',                 exchange: 'NSE', usd: false },
  { symbol: 'PAYTM.NS',    name: 'Paytm',                      exchange: 'NSE', usd: false },

  // US Tech (NASDAQ)
  { symbol: 'NVDA',        name: 'NVIDIA (in Rs.)',            exchange: 'NASDAQ', usd: true },
  { symbol: 'TSLA',        name: 'Tesla (in Rs.)',             exchange: 'NASDAQ', usd: true },
  { symbol: 'AAPL',        name: 'Apple (in Rs.)',             exchange: 'NASDAQ', usd: true },
  { symbol: 'MSFT',        name: 'Microsoft (in Rs.)',         exchange: 'NASDAQ', usd: true },
  { symbol: 'AMZN',        name: 'Amazon (in Rs.)',            exchange: 'NASDAQ', usd: true },
  { symbol: 'GOOGL',       name: 'Alphabet (in Rs.)',          exchange: 'NASDAQ', usd: true },
  { symbol: 'META',        name: 'Meta (in Rs.)',              exchange: 'NASDAQ', usd: true },
  { symbol: 'NFLX',        name: 'Netflix (in Rs.)',           exchange: 'NASDAQ', usd: true },
  { symbol: 'AMD',         name: 'AMD (in Rs.)',               exchange: 'NASDAQ', usd: true },
  { symbol: 'INTC',        name: 'Intel (in Rs.)',             exchange: 'NASDAQ', usd: true },

  // Cryptocurrencies
  { symbol: 'BTC-USD',     name: 'Bitcoin (in Rs.)',           exchange: 'CRYPTO', usd: true },
  { symbol: 'ETH-USD',     name: 'Ethereum (in Rs.)',          exchange: 'CRYPTO', usd: true },
  { symbol: 'SOL-USD',     name: 'Solana (in Rs.)',            exchange: 'CRYPTO', usd: true },
  { symbol: 'BNB-USD',     name: 'BNB (in Rs.)',               exchange: 'CRYPTO', usd: true },
  { symbol: 'XRP-USD',     name: 'XRP (in Rs.)',               exchange: 'CRYPTO', usd: true },
  { symbol: 'DOGE-USD',    name: 'Dogecoin (in Rs.)',          exchange: 'CRYPTO', usd: true },
];

// Fallback prices in INR (approximate)
const MOCK = {
  // NSE
  'RELIANCE.NS': { price: 2847, change: 1.12 },
  'TCS.NS':      { price: 3612, change: -0.78 },
  'HDFCBANK.NS': { price: 1694, change: 0.81 },
  'ICICIBANK.NS':{ price: 1050, change: 1.25 },
  'INFY.NS':     { price: 1432, change: 0.55 },
  'SBIN.NS':     { price: 780,  change: 2.10 },
  'BHARTIARTL.NS':{price: 1140, change: 0.40 },
  'ITC.NS':      { price: 420,  change: -0.15 },
  'LT.NS':       { price: 3450, change: 1.80 },
  'AXISBANK.NS': { price: 1350, change: 2.45 },
  'TATAMOTORS.NS':{price: 935,  change: -1.24 },
  'M%26M.NS':    { price: 3260, change: 2.94 },
  'INDIGO.NS':   { price: 4554, change: 2.36 },
  'WIPRO.NS':    { price: 462,  change: -0.43 },
  'ZOMATO.NS':   { price: 175,  change: 4.50 },
  'PAYTM.NS':    { price: 410,  change: -2.30 },

  // US
  'NVDA':        { price: 11000,change: 2.40 },
  'TSLA':        { price: 20800,change: -1.10 },
  'AAPL':        { price: 19100,change: 0.83 },
  'MSFT':        { price: 35200,change: 1.22 },
  'AMZN':        { price: 15400,change: 1.05 },
  'GOOGL':       { price: 13200,change: 0.90 },
  'META':        { price: 38500,change: -0.45 },
  'NFLX':        { price: 54100,change: 3.12 },
  'AMD':         { price: 14200,change: 1.40 },
  'INTC':        { price: 3100, change: -1.80 },

  // SEC
  'BTC-USD':     { price: 5500000,change: 5.40 },
  'ETH-USD':     { price: 295000, change: 4.10 },
  'SOL-USD':     { price: 12500,  change: 8.20 },
  'BNB-USD':     { price: 49000,  change: 1.50 },
  'XRP-USD':     { price: 54,     change: -0.20 },
  'DOGE-USD':    { price: 13,     change: 12.40 },
};

function makeMockHistory(basePrice) {
  const pts = [];
  let p = basePrice * 0.88;
  for (let i = 30; i >= 0; i--) {
    p = p * (1 + (Math.random() - 0.48) * 0.025);
    const d = new Date();
    d.setDate(d.getDate() - i);
    pts.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      close: parseFloat(p.toFixed(2)),
    });
  }
  return pts;
}

async function fetchFromYahoo(symbol, isUsd) {
  try {
    const res = await fetch(`/api/yahoo?symbol=${encodeURIComponent(symbol)}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error('No data');

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;

    let price = meta.regularMarketPrice || meta.chartPreviousClose;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    // Convert USD → INR for US stocks
    if (isUsd) price = price * USD_TO_INR;

    const history = timestamps
      .map((t, i) => ({
        date: new Date(t * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        close: quotes.close[i] != null ? (isUsd ? quotes.close[i] * USD_TO_INR : quotes.close[i]) : null,
      }))
      .filter(p => p.close !== null);

    return {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(changePct.toFixed(2)),
      currency: 'Rs.',
      history,
      live: true,
    };
  } catch {
    const mock = MOCK[symbol] || { price: 500, change: 0 };
    return {
      symbol,
      price: mock.price,
      change: mock.change,
      currency: 'Rs.',
      history: makeMockHistory(mock.price),
      live: false,
    };
  }
}

// 5-minute cache
const _cache = {};

export async function getStockData(symbol) {
  const now = Date.now();
  if (_cache[symbol] && now - _cache[symbol].at < 5 * 60 * 1000) {
    return _cache[symbol].data;
  }
  const stock = STOCK_LIST.find(s => s.symbol === symbol);
  const data = await fetchFromYahoo(symbol, stock?.usd ?? false);
  _cache[symbol] = { data, at: now };
  return data;
}

export async function getAllTickerData() {
  return Promise.all(STOCK_LIST.slice(0, 8).map(s => getStockData(s.symbol)));
}
