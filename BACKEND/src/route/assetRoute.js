const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/assetController'); // Updated to use database version

// Live quote (from database with API fallback)
router.get('/:symbol/live', ctrl.getAssetLive);
router.get('/live', ctrl.getAllAssetsLive);

// Historical data (from database with API fallback)
// Examples:
// - Intraday (5min): /assets/AAPL/history?type=intraday
// - Daily (last week): /assets/AAPL/history?type=daily&range=week
// - Daily (last month): /assets/AAPL/history?type=daily&range=month
router.get('/:symbol/history', ctrl.getAssetHistory);

// Manual sync endpoint for specific symbol
// Examples:
// - Sync all data: /assets/AAPL/sync
// - Sync only live: /assets/AAPL/sync?type=live
// - Sync only daily: /assets/AAPL/sync?type=daily
router.get('/:symbol/sync', ctrl.syncAssetData);

// Health check endpoint
router.get('/health', ctrl.getAssetsHealth);

module.exports = router;
