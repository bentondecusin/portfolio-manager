const express = require('express');
const ctrl = require('../controller/transactionController');

const router = express.Router();

// /transacrtions
router.get('/', ctrl.getAllTxn);
router.get('/:id', ctrl.getTxnById);
router.get('/symbol/:symbol', ctrl.getTxnBySymbol);
router.get('/date/:date', ctrl.getTxnByDate);
router.post('/', ctrl.postSingleTxn);
router.put('/:id', ctrl.putSingleTxn);
router.delete('/:id', ctrl.delSingleTxn);

// router.get('/portfolio/live', ctrl.getPortfolioLive);

module.exports = router;
