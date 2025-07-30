// src/controllers/assetController.js

// If you’re on Node <18, uncomment:
// const fetch = require('node-fetch');

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
 * GET /assets/:symbol/live
 * Uses the GLOBAL_QUOTE endpoint.
 */
async function getAssetLive(req, res, next) {
  try {
    const { symbol } = req.params;
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'GLOBAL_QUOTE');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', API_KEY);

    const data = await fetchJSON(url.toString());
    const q = data['Global Quote'];
    if (!q) {
      return res.status(502).json({ error: `No quote data for ${symbol}`, raw: data });
    }
    console.log(`Fetched live quote for ${symbol}:`, q);

    const result = {
      symbol:           q['01. symbol'],
      open:             parseFloat(q['02. open']),
      high:             parseFloat(q['03. high']),
      low:              parseFloat(q['04. low']),
      price:            parseFloat(q['05. price']),
      volume:           parseInt(q['06. volume'], 10),
      latestTradingDay: q['07. latest trading day'],
      previousClose:    parseFloat(q['08. previous close']),
      change:           parseFloat(q['09. change']),
      changePercent:    q['10. change percent'],
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /assets/:symbol/history
 * Query params:
 *  - type=intraday|daily (default: daily)
 *  - range=week|month (default: month)
 */
async function getAssetHistory(req, res, next) {
  try {
    const { symbol } = req.params;
    const type  = req.query.type  || 'daily'; // intraday | daily
    const range = req.query.range || 'month'; // week | month

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const fromDate = new Date();
    if (range === 'week') {
      fromDate.setDate(now.getDate() - 7);
    } else {
      fromDate.setDate(now.getDate() - 30);
    }
    const from = fromDate.toISOString().slice(0, 10);

    let url;
    let dataKey;
    let rawData;

    if (type === 'intraday') {
      // Use TIME_SERIES_INTRADAY with 5-minute intervals
      url = new URL('https://www.alphavantage.co/query');
      url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
      url.searchParams.set('symbol', symbol);
      url.searchParams.set('interval', '5min');
      url.searchParams.set('apikey', API_KEY);
      url.searchParams.set('outputsize', 'compact'); // last ~100 points
      rawData = await fetchJSON(url.toString());
      dataKey = Object.keys(rawData).find(k => k.includes('Time Series'));
    } else {
      // Use TIME_SERIES_DAILY for week/month
      url = new URL('https://www.alphavantage.co/query');
      url.searchParams.set('function', 'TIME_SERIES_DAILY');
      url.searchParams.set('symbol', symbol);
      url.searchParams.set('apikey', API_KEY);
      url.searchParams.set('outputsize', 'compact');
      rawData = await fetchJSON(url.toString());
      dataKey = 'Time Series (Daily)';
    }

    const series = rawData[dataKey];
    if (!series) {
      return res.status(502).json({ error: `No time series returned`, raw: rawData });
    }

    // Filter & format
    const result = Object.entries(series)
      .filter(([date]) => date >= from && date <= today)
      .map(([date, v]) => ({
        date,
        open:   parseFloat(v['1. open']),
        high:   parseFloat(v['2. high']),
        low:    parseFloat(v['3. low']),
        close:  parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`Fetched ${result.length} data points for ${symbol} (${type}, ${range}) from ${from} to ${today}, data: ${JSON.stringify(result)}`);
    res.json({
      symbol,
      type,
      range,
      from,
      to: today,
      data: result,
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAssetLive,
  getAssetHistory,
};
