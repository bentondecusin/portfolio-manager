const service = require('../service/portfolioService');
const txnService = require('../service/transactionService')

async function getTransactions(req, res, next) {
    try {
        const txn_list = await txnService.getTxnHistory();
        res.status(201).json(txn_list);
    } catch (err) {
        next(err);
    }
}

async function postTransaction(req, res, next) {
  try {
    const txn = await service.recordTransaction(req.body);
    res.status(201).json(txn);
  } catch (err) { next(err); }
}

async function getPortfolioLive(_req, res, next) {
  try {
    const portfolio = await service.getLivePortfolio();
    res.json(portfolio);
  } catch (err) { next(err); }
}

module.exports = { getTransactions, postTransaction, getPortfolioLive };
