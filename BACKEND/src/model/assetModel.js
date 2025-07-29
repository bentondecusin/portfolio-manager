const db = require('../db');

async function findAllAssets() {
    const [rows] = await db.query('SELECT * FROM asset');
    return rows;
}

async function findAssetBySymbol(symbol) {
  const [rows] = await db.query('SELECT * FROM asset WHERE symbol = ?', [symbol]);
  return rows[0] || null;
}

async function findAssetsByFilter(filters = {}) {
  let sql = 'SELECT * FROM asset WHERE 1=1';
  const params = [];

  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.symbol) {
    // starts-with match; change to = ? for exact
    sql += ' AND symbol LIKE ?';
    params.push(`${filters.symbol}%`);
  }

  sql += ' ORDER BY symbol';
  const [rows] = await db.query(sql, params);

  return rows;
}

async function createAsset(asset) {
  const { symbol, name, type, currency } = asset;
  const [res] = await db.query(
    'INSERT INTO asset (symbol, name, type, currency) VALUES (?, ?, ?, ?)',
    [symbol, name, type, currency]
  );
  return { id: res.insertId, ...asset };
}

module.exports = { findAllAssets, findAssetBySymbol, findAssetsByFilter, createAsset };