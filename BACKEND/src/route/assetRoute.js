const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/assetController');

// Live quote
router.get('/:symbol/live', ctrl.getAssetLive);

// Historical data (Alpha Vantage)
// Examples:
// - Intraday (5min): /assets/AAPL/history?type=intraday
// - Daily (last week): /assets/AAPL/history?type=daily&range=week
// - Daily (last month): /assets/AAPL/history?type=daily&range=month
router.get('/:symbol/history', ctrl.getAssetHistory);

module.exports = router;
