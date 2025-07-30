const txnModel = require('../model/transactionModel');

// GET transactions
async function getTxns() {
    const txn_list = await txnModel.selectAllTxns();
    return txn_list;
}

module.exports = { getTxnHistory };
