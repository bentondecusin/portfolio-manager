// const { default: next } = require('next');
const holdingSVC = require('../service/holdingService')

async function getAllHoldings(req, res) {
  try {
    const holdings = await holdingSVC.getHoldings();
    res.json(holdings);
  } catch (e) {
    console.log('Error in controller: getAllHoldings', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHoldingBySymbol(req, res) {
  try {
    const { symbol } = req.params;
    const holding = await holdingSVC.getHoldingBySymbol(symbol);
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.json(holding);
  } catch (e) {
    console.log('Error in controller: getHoldingBySymbol', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHoldingValueBySymbol(req, res) {
  try {
    const { symbol } = req.params;
    const holdingValue = await holdingSVC.getHoldingValueBySymbol(symbol);
    if (!holdingValue) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.json(holdingValue);
  } catch (e) {
    console.log('Error in controller: getHoldingValueBySymbol', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTotalHoldingValue(req, res) {
  try {
    const totalValue = await holdingSVC.getTotalHoldingValue();
    res.json(totalValue);
  } catch (e) {
    console.log('Error in controller: getTotalHoldingValue', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { 
  getAllHoldings,
  getHoldingBySymbol,
  getHoldingValueBySymbol,
  getTotalHoldingValue
};
