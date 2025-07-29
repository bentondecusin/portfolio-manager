const express = require('express');
const ctrl = require('../controller/transactionController');

const router = express.Router();

router.get('/', ctrl.getAllTxn);
// router.post('/transactions', ctrl.postTransaction);
// router.get('/portfolio/live', ctrl.getPortfolioLive);

module.exports = router;
