const db = require('../db');

// GET methods
async function selectAllTxns() {
  let sql = 'SELECT * FROM transactions';
  const [rows] = await db.query(sql);
  return rows;
}

async function selectTxnById(id) {
  let sql = `SELECT * FROM transactions WHERE id = ?`;
  const [row] = await db.query(sql, [id]);
  return row;
}

async function selectAllTxnBySymbol(symbol) {
  let sql = `SELECT * FROM transactions WHERE symbol = ?`;
  const [rows] = await db.query(sql, [symbol]);
  return rows;
}

async function selectAllTxnByDate(date) {
  let sql = `SELECT * FROM transactions WHERE txn_ts = ?`;
  const [rows] = await db.query(sql, [date]);
  return rows;
}

// POST methods
async function insertTxn(txn) {
  const { symbol, tickName, quantity, price, txnTs } = txn;
  const txnType = txn.txnType ? txn.txnType.toLowerCase() : undefined;
  const [res] = await db.query(
    `INSERT INTO transactions
       (symbol, tick_name, txn_type, quantity, price, txn_ts)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [symbol, tickName, txnType, quantity, price, txnTs]
  );
  return { id: res.insertId, ...txn };
}

// UPSERT methods
async function upsertTxnById(id, txn) {
  const { symbol, tickName, txnType, quantity, price, txnTs } = txn;
  
  const sql = `
    INSERT INTO transactions (id, symbol, tick_name, txn_type, quantity, price, txn_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      symbol = VALUES(symbol),
      tick_name = VALUES(tick_name),
      txn_type = VALUES(txn_type),
      quantity = VALUES(quantity),
      price = VALUES(price),
      txn_ts = VALUES(txn_ts)
  `;
  
  const [res] = await db.query(sql, [id, symbol, tickName, txnType, quantity, price, txnTs]);
  return res;
}

// Keep the original update method for backward compatibility
async function updateTxnById(id, txn) {
  const { symbol, tickName, txnType, quantity, price, txnTs } = txn;
  let sql = `UPDATE transactions SET symbol = ?, tick_name = ?, txn_type = ?, quantity = ?, price = ?, txn_ts = ? WHERE id = ?`;
  const [res] = await db.query(sql, [symbol, tickName, txnType, quantity, price, txnTs, id]);
  return res;
}

// DELETE methods
async function deleteTxnById(id) {
  let sql = `DELETE FROM transactions WHERE id = ?`;
  const [res] = await db.query(sql, [id]);
  return res.affectedRows;
}

// transaction model functions for services logic
async function getHoldings(symbol) {
  const [rows] = await db.query(
    `SELECT
       SUM(CASE WHEN txn_type = 'buy' THEN quantity ELSE -quantity END) AS holdings
     FROM transactions
     WHERE symbol = ?`,
    [symbol]
  );
  return rows[0].holdings || 0;
}

module.exports = {
  insertTxn,
  selectAllTxns,
  selectTxnById,
  selectAllTxnBySymbol,
  selectAllTxnByDate,
  updateTxnById,
  // upsertTxnById,
  deleteTxnById,
  getHoldings,
};
