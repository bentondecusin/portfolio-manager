// src/service/assetService.js

const db = require('../db');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
if (!API_KEY) {
  console.error('Missing ALPHA_VANTAGE_API_KEY; set it in your env');
  process.exit(1);
}

/**
 * Helper to fetch JSON and throw on HTTP errors.
 */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch and store live quote data for a symbol
 */
async function fetchAndStoreLiveQuote(symbol) {
  const startTime = Date.now();

  try {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'GLOBAL_QUOTE');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', API_KEY);

    const data = await fetchJSON(url.toString());
    const q = data['Global Quote'];
    
    if (!q) {
      throw new Error(`No quote data for ${symbol}`);
    }

    // Parse and validate data
    const quoteData = {
      symbol: q['01. symbol'],
      open_price: parseFloat(q['02. open']),
      high_price: parseFloat(q['03. high']),
      low_price: parseFloat(q['04. low']),
      current_price: parseFloat(q['05. price']),
      volume: parseInt(q['06. volume'], 10),
      latest_trading_day: q['07. latest trading day'],
      previous_close: parseFloat(q['08. previous close']),
      change_amount: parseFloat(q['09. change']),
      change_percent: q['10. change percent'],
    };

    // Store in database using INSERT ... ON DUPLICATE KEY UPDATE
    await db.execute(
      `INSERT INTO asset_quotes_live 
       (symbol, open_price, high_price, low_price, current_price, volume, 
        latest_trading_day, previous_close, change_amount, change_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       open_price = VALUES(open_price),
       high_price = VALUES(high_price),
       low_price = VALUES(low_price),
       current_price = VALUES(current_price),
       volume = VALUES(volume),
       latest_trading_day = VALUES(latest_trading_day),
       previous_close = VALUES(previous_close),
       change_amount = VALUES(change_amount),
       change_percent = VALUES(change_percent),
       last_updated = CURRENT_TIMESTAMP`,
      [
        quoteData.symbol,
        quoteData.open_price,
        quoteData.high_price,
        quoteData.low_price,
        quoteData.current_price,
        quoteData.volume,
        quoteData.latest_trading_day,
        quoteData.previous_close,
        quoteData.change_amount,
        quoteData.change_percent
      ]
    );

    console.log(`✅ Stored live quote for ${symbol}: $${quoteData.current_price}`);
    
    return { success: true, data: quoteData };

  } catch (err) {
    console.error(`❌ Failed to fetch live quote for ${symbol}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch and store daily price history for a symbol
 */
async function fetchAndStoreDailyHistory(symbol, days = 100) {
  try {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'TIME_SERIES_DAILY');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', API_KEY);
    url.searchParams.set('outputsize', days > 100 ? 'full' : 'compact');

    const rawData = await fetchJSON(url.toString());
    const series = rawData['Time Series (Daily)'];
    
    if (!series) {
      throw new Error(`No daily data for ${symbol}`);
    }

    // Convert to array and limit by days
    const entries = Object.entries(series)
      .slice(0, days)
      .map(([date, v]) => ({
        symbol,
        price_date: date,
        open_price: parseFloat(v['1. open']),
        high_price: parseFloat(v['2. high']),
        low_price: parseFloat(v['3. low']),
        close_price: parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      }));

    // Batch insert with ON DUPLICATE KEY UPDATE
    if (entries.length > 0) {
      const values = entries.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const params = entries.flatMap(entry => [
        entry.symbol,
        entry.price_date,
        entry.open_price,
        entry.high_price,
        entry.low_price,
        entry.close_price,
        entry.volume
      ]);

      await db.execute(
        `INSERT INTO asset_prices_daily 
         (symbol, price_date, open_price, high_price, low_price, close_price, volume)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE
         open_price = VALUES(open_price),
         high_price = VALUES(high_price),
         low_price = VALUES(low_price),
         close_price = VALUES(close_price),
         volume = VALUES(volume),
         updated_at = CURRENT_TIMESTAMP`,
        params
      );

      console.log(`✅ Stored ${entries.length} daily records for ${symbol}`);
    }

    return { success: true, recordsCount: entries.length };

  } catch (err) {
    console.error(`❌ Failed to fetch daily history for ${symbol}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch and store intraday price data for a symbol
 */
async function fetchAndStoreIntradayHistory(symbol) {
  try {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', '5min');
    url.searchParams.set('apikey', API_KEY);
    url.searchParams.set('outputsize', 'compact'); // last ~100 points

    const rawData = await fetchJSON(url.toString());
    const dataKey = Object.keys(rawData).find(k => k.includes('Time Series'));
    const series = rawData[dataKey];
    
    if (!series) {
      throw new Error(`No intraday data for ${symbol}`);
    }

    // Convert to array
    const entries = Object.entries(series)
      .map(([datetime, v]) => ({
        symbol,
        price_datetime: datetime,
        open_price: parseFloat(v['1. open']),
        high_price: parseFloat(v['2. high']),
        low_price: parseFloat(v['3. low']),
        close_price: parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      }));

    // Batch insert with ON DUPLICATE KEY UPDATE
    if (entries.length > 0) {
      const values = entries.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const params = entries.flatMap(entry => [
        entry.symbol,
        entry.price_datetime,
        entry.open_price,
        entry.high_price,
        entry.low_price,
        entry.close_price,
        entry.volume
      ]);

      await db.execute(
        `INSERT INTO asset_prices_intraday 
         (symbol, price_datetime, open_price, high_price, low_price, close_price, volume)
         VALUES ${values}
         ON DUPLICATE KEY UPDATE
         open_price = VALUES(open_price),
         high_price = VALUES(high_price),
         low_price = VALUES(low_price),
         close_price = VALUES(close_price),
         volume = VALUES(volume),
         updated_at = CURRENT_TIMESTAMP`,
        params
      );

      console.log(`✅ Stored ${entries.length} intraday records for ${symbol}`);
    }

    return { success: true, recordsCount: entries.length };

  } catch (err) {
    console.error(`❌ Failed to fetch intraday history for ${symbol}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Get list of trending/popular symbols to track (hardcoded)
 */
async function getActiveSymbols() {
  // Hardcoded list of popular/trending stocks to track
  const trendingSymbols = [
    'TSLA',   // Tesla Inc.
    'NVDA',   // NVIDIA Corporation
    'AMZN',   // Amazon.com Inc.
    'CRM',    // Salesforce Inc.
    'AAPL',   // Apple Inc.
    'MSFT',   // Microsoft Corporation
    'GOOGL',  // Alphabet Inc. Class A
    'AMZN',   // Amazon.com Inc.
    'META',   // Meta Platforms Inc.
    'NFLX',   // Netflix Inc.
    'AMD',    // Advanced Micro Devices
    'CRM',    // Salesforce Inc.
    'ADBE',   // Adobe Inc.
    'PYPL',   // PayPal Holdings Inc.
    'INTC',   // Intel Corporation
    'CSCO',   // Cisco Systems Inc.
    'PEP',    // PepsiCo Inc.
    'COST',   // Costco Wholesale Corporation
    'AVGO',   // Broadcom Inc.
    'TXN',    // Texas Instruments Incorporated
    'QCOM',   // QUALCOMM Incorporated
    'HON'     // Honeywell International Inc.
  ];

  console.log(`Using hardcoded trending symbols: ${trendingSymbols.length} symbols`);
  return trendingSymbols;
}

async function waitRateLimter() {
    console.log('⏳ Waiting 15 seconds before next API call...');
    await new Promise(resolve => setTimeout(resolve, 15000));
}

/**
 * Periodic job to fetch all data for all active symbols
 */
async function syncAllSymbolsData() {
  console.log('🔄 Starting periodic data sync...');
  const symbols = await getActiveSymbols();
  
  if (symbols.length === 0) {
    console.log('No active symbols found in transactions');
    return;
  }

  console.log(`Found ${symbols.length} active symbols: ${symbols.join(', ')}`);

  const results = {
    live: { success: 0, failed: 0 },
    daily: { success: 0, failed: 0 },
    intraday: { success: 0, failed: 0 }
  };

  // Process each symbol with delay to respect rate limits
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    console.log(`\n📊 Processing ${symbol} (${i + 1}/${symbols.length})`);

    // // Fetch live quote
    // const liveResult = await fetchAndStoreLiveQuote(symbol);
    // if (liveResult.success) {
    //   results.live.success++;
    // } else {
    //   results.live.failed++;
    // }

    await waitRateLimter();

    // Fetch daily history if today's data is missing, or once per day between 00:00-00:30
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Check if today's data exists for this symbol
    const [rows] = await db.execute(
      'SELECT 1 FROM asset_prices_daily WHERE symbol = ? AND price_date = ? LIMIT 1',
      [symbol, todayStr]
    );
    const hasTodayData = rows.length > 0;

    if (!hasTodayData || (now.getHours() === 0 && now.getMinutes() < 30)) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Small delay
      const dailyResult = await fetchAndStoreDailyHistory(symbol, 30);
      if (dailyResult.success) {
        results.daily.success++;
      } else {
        results.daily.failed++;
      }
    }

    await waitRateLimter();

    // Fetch intraday history (more frequent - every 5 minutes)
    if (now.getMinutes() % 5 === 0) { // Every 5 minutes
      await new Promise(resolve => setTimeout(resolve, 2000)); // Small delay
      const intradayResult = await fetchAndStoreIntradayHistory(symbol);
      if (intradayResult.success) {
        results.intraday.success++;
      }
      else {
        results.intraday.failed++;
      }
    }

    await waitRateLimter();
  }

  console.log('\n📈 Data sync completed:');
  console.log(`Live quotes: ${results.live.success} success, ${results.live.failed} failed`);
  console.log(`Daily data: ${results.daily.success} success, ${results.daily.failed} failed`);
  console.log(`Intraday data: ${results.intraday.success} success, ${results.intraday.failed} failed`);
}

/**
 * Start periodic data fetching (call this from server.js)
 */
function startPeriodicSync() {
  // Initial sync after 30 seconds
  setTimeout(syncAllSymbolsData, 30000);
  
  // Then sync every 5 minutes (300000ms)
  setInterval(syncAllSymbolsData, 300000);
  
  console.log('🚀 Asset data sync service started - will run every 5 minutes');
}

module.exports = {
  fetchAndStoreLiveQuote,
  fetchAndStoreDailyHistory,
  fetchAndStoreIntradayHistory,
  getActiveSymbols,
  syncAllSymbolsData,
  startPeriodicSync
};
