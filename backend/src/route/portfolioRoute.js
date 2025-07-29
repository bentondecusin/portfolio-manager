const express = require('express');
const ctrl = require('../controller/portfolioController');

const router = express.Router();

router.get('/transactions', ctrl.getAllTxn);
// router.post('/transactions', ctrl.postTransaction);
router.get('/portfolio/live', ctrl.getPortfolioLive);

module.exports = router;
