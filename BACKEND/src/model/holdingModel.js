const db = require('../db');

// GET holdings methods
async function selectAllHoldings() {
  let sql = 'SELECT * FROM holdings';
  const [rows] = await db.query(sql);
  return rows;
}

async function selectHoldingBySymbol(symbol) {
  let sql = `SELECT * FROM holdings WHERE symbol = ?`;
  const [row] = await db.query(sql, [symbol]);
  return row;
}

async function selectValueBySymbol(symbol) {
  let sql = `SELECT (quantity * average_cost) AS value FROM holdings WHERE symbol = ?`;
  const [row] = await db.query(sql, [symbol]);
  return row;
}

async function selectTotalValue() {
  let sql = `SELECT SUM(quantity * average_cost) AS total_value FROM holdings`;
  const [row] = await db.query(sql);
  return row;
}

module.exports = {
  selectAllHoldings,
  selectHoldingBySymbol,
  selectValueBySymbol,
  selectTotalValue,
};
