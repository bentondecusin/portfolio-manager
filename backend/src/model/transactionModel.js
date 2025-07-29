const db = require('../db');

async function listAll() {
<<<<<<< HEAD
  let sql = 'SELECT * FROM transactions';
  const [rows] = await db.query(sql);
=======
  const [rows] = await db.query('SELECT * FROM transactions');
>>>>>>> 0d05c5efb9c8d70edf9fbc650b2a745282d24645
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
