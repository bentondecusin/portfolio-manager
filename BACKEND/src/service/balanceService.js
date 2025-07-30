const txnModel = require('../model/transactionModel');

async function getCurrentCashBalance() {
  const [row] = await db.query(
    `SELECT quantity FROM holdings WHERE symbol = 'USD'`
  );
  return row ? row.quantity : 0;
}

async function topUpCash(amount) {
  if (amount <= 0) {
    throw new Error('Top-up amount must be positive.');
  }

  const txn = {
    symbol: 'USD',
    tickName: 'US Dollars',
    txnType: 'buy',
    quantity: amount,
    price: 1.0, // always $1
    txnTs: new Date(),
  };

  const result = await txnModel.insertTxn(txn);
  return result;
}

module.exports = {
  getCurrentCashBalance,
  topUpCash,
};
