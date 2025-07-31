const db = require('../db');
const txnModel = require('../model/transactionModel');

async function getCurrentCashBalance() {
  const result = await db.query(
    `SELECT quantity FROM holdings WHERE symbol = 'USD'`
  );

  // 兼容 mysql2/promise 返回 [rows, fields]
  const rows = Array.isArray(result) ? result[0] : result;
  const row = Array.isArray(rows) ? rows[0] : rows;

  const balance = row && row.quantity ? parseFloat(row.quantity) : 0;
  return balance;
}

async function topUpCash(amount) {
  if (amount <= 0) {
    throw new Error('Top-up amount must be positive.');
  }

  const txn = {
    symbol: 'USD',
    tickName: 'US Dollar',
    txnType: 'buy',
    quantity: amount,
    price: 1.0, // always $1
    txnTs: new Date()
  };
  
  const result = await txnModel.insertTxn(txn); // insertTxn is a model function
  return result;
}

module.exports = {
  getCurrentCashBalance,
  topUpCash,
};
