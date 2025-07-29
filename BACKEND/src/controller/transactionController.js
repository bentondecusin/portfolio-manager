// const { default: next } = require('next');
const txnSVC = require('../service/transactionService')

async function getAllTxn(req, res, next) {
  try {
    res.json(await txnSVC.getTxnHistory());
  } catch (e) {
    console.log('Error in getAllTxn(Controller)', e);
  }
}

module.exports = { getAllTxn };
