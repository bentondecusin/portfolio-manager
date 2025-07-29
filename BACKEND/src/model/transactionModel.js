const db = require('../db');

async function getAllTransactions() {
  const [rows] = await db.query("SELECT * FROM transaction");
  return rows;
}

async function createTransaction(txn) {
  const { assetId, txnType, quantity, price, txnTs } = txn;
  const [res] = await db.query(
    `INSERT INTO transaction (asset_id, txn_type, quantity, price, txn_ts)
     VALUES (?, ?, ?, ?, ?)`,
    [assetId, txnType, quantity, price, txnTs]
  );
  return { id: res.insertId, ...txn };
}

module.exports = { getAllTransactions, createTransaction };