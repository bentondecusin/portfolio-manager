const txnModel = require('../model/transactionModel');

async function getTxnHistory() {
    const txn_list = await txnModel.getAllTransactions();
    return txn_list;
}

module.exports = { getTxnHistory };
