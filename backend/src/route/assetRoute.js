// src/route/assetRoute.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/assetController');

// Live quote
router.get('/:symbol/live',    ctrl.getAssetLive);

// Historical data
// E.g. /assets/AAPL/history?period1=2025-01-01&period2=2025-07-29&outputsize=compact
router.get('/:symbol/history', ctrl.getAssetHistory);

module.exports = router;
