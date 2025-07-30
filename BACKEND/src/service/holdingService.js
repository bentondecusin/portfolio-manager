const holdingModel = require('../model/holdingModel');
const txnModel = require('../model/transactionModel');

// GET holdings
async function getHoldings() {
  const holding_list = await holdingModel.selectAllHoldings();
  return holding_list;
}

async function getHoldingBySymbol(symbol) {
  const holding = await holdingModel.selectHoldingBySymbol(symbol);
  return holding;
}

async function getHoldingValueBySymbol(symbol) {
  const value = await holdingModel.selectValueBySymbol(symbol);
  return value;
}

async function getTotalHoldingValue() {
  const total_value = await holdingModel.selectTotalValue();
  return total_value;
}


module.exports = {
  getHoldings,
  getHoldingBySymbol,
  getHoldingValueBySymbol,
  getTotalHoldingValue,
};