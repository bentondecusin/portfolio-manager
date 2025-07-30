// src/controllers/assetController.js (Database Version)

const db = require('../db');
const { fetchAndStoreLiveQuote, fetchAndStoreDailyHistory } = require('../service/assetService');

/**
 * GET /assets/:symbol/live
 * Gets live quote from database, with fallback to API if data is stale
 */
async function getAssetLive(req, res, next) {
  try {
    const { symbol } = req.params;

    // Try to get from database first
    const [rows] = await db.execute(
      `SELECT * FROM asset_quotes_live 
       WHERE symbol = ? 
       ORDER BY last_updated DESC 
       LIMIT 1`,
      [symbol]
    );

    if (rows.length == 0) {
      res.status(404).json({ error: `No live quote found for ${symbol}` });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    next(err);
  }
}

async function getAllAssetsLive(req, res, next) {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM asset_quotes_live 
       ORDER BY last_updated DESC`
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'No live quotes found' });
    } else {
      res.json(rows);
    }
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
    const type = req.query.type || 'daily'; // intraday | daily
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

    let query;
    let params;
    let tableName;
    let dateColumn;

    if (type === 'intraday') {
      tableName = 'asset_prices_intraday';
      dateColumn = 'price_datetime';
      query = `
        SELECT 
          DATE_FORMAT(price_datetime, '%Y-%m-%d %H:%i:%s') as date,
          open_price as open,
          high_price as high,
          low_price as low,
          close_price as close,
          volume
        FROM ${tableName}
        WHERE symbol = ? 
        AND DATE(price_datetime) >= ? 
        AND DATE(price_datetime) <= ?
        ORDER BY price_datetime ASC
      `;
      params = [symbol, from, today];
    } else {
      tableName = 'asset_prices_daily';
      dateColumn = 'price_date';
      query = `
        SELECT 
          price_date as date,
          open_price as open,
          high_price as high,
          low_price as low,
          close_price as close,
          volume
        FROM ${tableName}
        WHERE symbol = ? 
        AND price_date >= ? 
        AND price_date <= ?
        ORDER BY price_date ASC
      `;
      params = [symbol, from, today];
    }

    const [rows] = await db.execute(query, params);

    const result = {
      symbol,
      type,
      range,
      from,
      to: today,
      data: rows
    };

    if (rows.length === 0) {
      res.status(404).json({ error: `No historical data found for ${symbol} (${type}, ${range})` });
    } else {
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /assets/:symbol/sync
 * Manual trigger to sync data for a specific symbol
 */
async function syncAssetData(req, res, next) {
  try {
    const { symbol } = req.params;
    const { type = 'all' } = req.query; // all, live, daily, intraday

    const results = {};

    if (type === 'all' || type === 'live') {
      console.log(`🔄 Manual sync: fetching live data for ${symbol}`);
      results.live = await fetchAndStoreLiveQuote(symbol);
    }

    if (type === 'all' || type === 'daily') {
      console.log(`🔄 Manual sync: fetching daily data for ${symbol}`);
      results.daily = await fetchAndStoreDailyHistory(symbol, 100);
    }

    const allSuccess = Object.values(results).every(r => r.success);
    const statusCode = allSuccess ? 200 : 207; // 207 = Multi-Status

    res.status(statusCode).json({
      symbol,
      sync_type: type,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (err) {
    next(err);
  }
}

/**
 * GET /assets/health
 * Check the health of asset data (freshness, coverage, etc.)
 */
async function getAssetsHealth(req, res, next) {
  try {
    // Get summary stats
    const [liveStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_symbols,
        COUNT(CASE WHEN last_updated >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) THEN 1 END) as fresh_quotes,
        COUNT(CASE WHEN last_updated < DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as stale_quotes,
        AVG(TIMESTAMPDIFF(MINUTE, last_updated, NOW())) as avg_age_minutes
      FROM asset_quotes_live
    `);

    const [dailyStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT symbol) as symbols_with_daily_data,
        COUNT(*) as total_daily_records,
        MAX(price_date) as latest_date,
        MIN(price_date) as earliest_date
      FROM asset_prices_daily
    `);

    const [recentErrors] = await db.execute(`
      SELECT 
        COUNT(*) as error_count,
        COUNT(CASE WHEN status = 'rate_limited' THEN 1 END) as rate_limited_count
      FROM api_fetch_log 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND status IN ('error', 'rate_limited')
    `);

    const health = {
      timestamp: new Date().toISOString(),
      live_quotes: liveStats[0],
      daily_data: dailyStats[0],
      recent_errors: recentErrors[0],
      status: (liveStats[0].fresh_quotes > 0 && recentErrors[0].error_count < 5) ? 'healthy' : 'degraded'
    };

    res.json(health);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAssetLive,
  getAllAssetsLive,
  getAssetHistory,
  syncAssetData,
  getAssetsHealth,
};
