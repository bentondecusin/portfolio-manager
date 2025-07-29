const db = require('../db');

async function listAll() {
  const [rows] = await db.query('SELECT * FROM transactions');
  return rows;
}

async function create(txn) {
  const { symbol, tickName, txnType, quantity, price, txnTs } = txn;

  const [res] = await db.query(
    `INSERT INTO transactions
       (symbol, tick_name, txn_type, quantity, price, txn_ts)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [symbol, tickName, txnType, quantity, price, txnTs]
  );
  return { id: res.insertId, ...txn };
}

module.exports = { create, listAll };
