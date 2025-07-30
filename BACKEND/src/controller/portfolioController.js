const { default: next } = require('next');
const portfolioSVC = require('../service/portfolioService');
const txnSVC = require('../service/transactionService')

async function getAllTxn(req, res, next) {
  try {
    res.json(await txnSVC.getTxnHistory());
  } catch (e) {
    console.log('Error in getAllTxn(Controller)', e);
  }
}

async function getPortfolioLive(req, res, next) {
  try {
    res.json(await portfolioSVC.getLivePortfolio());
  } catch (e) { 
    console.log('Error in getPortfolioLive(Controller)', e);
  }
}
module.exports = { getAllTxn, getPortfolioLive };
