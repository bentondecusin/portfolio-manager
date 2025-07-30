const balanceService = require('../service/balanceService');

async function getCashBalance(req, res, next) {
  try {
    const cash = await balanceService.getCurrentCashBalance();
    res.json({ symbol: 'USD', balance: parseFloat(cash) });
  } catch (err) {
    next(err);
  }
}

async function putCashBalance(req, res, next) {
  console.log('putCashBalance called, request body:', req.body);
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid `amount`' });
    }

    const result = await balanceService.topUpCash(amount);
    res.status(201).json({ message: 'Cash topped up', txn: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCashBalance,
  putCashBalance,
};
