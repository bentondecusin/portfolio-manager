const express = require('express');
const router = express.Router();
const ctrl = require('../controller/balanceController');

router.get('/', ctrl.getCashBalance); // GET /balance
router.put('/', ctrl.putCashBalance); // PUT /balance

module.exports = router;
