const express = require('express');
const ctrl = require('../controller/holdingController');

const router = express.Router();

// GET /holdings - returns all holdings
router.get('/', ctrl.getAllHoldings);

// GET /holdings/symbol/:symbol - returns a holding on a single symbol
router.get('/symbol/:symbol', ctrl.getHoldingBySymbol);

// GET /holdings/value/:symbol - returns the return of a single holding
router.get('/value/:symbol', ctrl.getHoldingValueBySymbol);

// GET /holdings/value - returns total return of the portfolio
router.get('/value', ctrl.getTotalHoldingValue);

module.exports = router;
