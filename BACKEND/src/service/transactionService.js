const txnModel = require('../model/transactionModel');

// GET transactions
async function getTxns() {
    const txn_list = await txnModel.selectAllTxns();
    return txn_list;
}

async function getTxnById(id) {
    const txn_res = await txnModel.selectTxnById(id);
    return txn_res;
}

async function getTxnBySymbol(symbol) {
    const txn_res = await txnModel.selectAllTxnBySymbol(symbol);
    return txn_res;
}

async function getTxnByDate(date) {
    const txn_res = await txnModel.selectAllTxnByDate(date);
    return txn_res;
}

// POST transaction
async function insertSingleTxn(txn) {
    if (txn.txnType === 'sell') {
        const cur_holdings = await txnModel.getHoldings(txn.symbol);
        if (txn.quantity > cur_holdings) {
            throw new Error('Error in service: insertSingleTxn, Not Enough Holdings To Sell');
        }
    }
    const txn_res = await txnModel.insertTxn(txn);
    return txn_res;
}

// UPSERT transaction (INSERT if not exists, UPDATE if exists)
async function upsertSingleTxn(id, txn) {
    const txn_res = await txnModel.upsertTxnById(id, txn);
    return txn_res;
}

// PUT transaction (UPDATE only - for backward compatibility)
async function updateSingleTxn(id, txn) {
    const txn_res = await txnModel.updateTxnById(id, txn);
    return txn_res;
}

// DELETE transaction
async function deleteSingleTxn(id) {
    const rows_affected = await txnModel.deleteTxnById(id);
    return rows_affected;
}


module.exports = {
  getTxns,
  insertSingleTxn,
  getTxnById,
  getTxnBySymbol,
  getTxnByDate,
  updateSingleTxn,
  upsertSingleTxn,
  deleteSingleTxn,
};
