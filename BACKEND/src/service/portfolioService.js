const txnModel   = require('../model/transactionModel');

function sign(txn) { return txn.txnType === 'BUY' ? 1 : -1; }

async function getLivePortfolio() {
  const txns = await txnModel.listAll();

  // 1. Aggregate qty & cost per symbol
  const map = new Map();           // symbol -> { qty, cost }
  txns.forEach(t => {
    const entry = map.get(t.symbol) || { qty: 0, cost: 0, name: t.tick_name };
    entry.qty  += sign(t) * Number(t.quantity);
    entry.cost += sign(t) * (Number(t.quantity) * Number(t.price));
    map.set(t.symbol, entry);
  });

  // remove closed positions (qty === 0)
  const positions = [...map.entries()]
    .filter(([, v]) => v.qty !== 0)
    .map(([symbol, v]) => ({ symbol, ...v }));

  if (positions.length === 0) return { asOf: new Date(), totalValue: 0, holdings: [] };

  // 2. Fetch live prices
  const quotes = await priceSvc.fetchQuotes(positions.map(p => p.symbol));

  // 3. Compute market values & metrics
  let totalValue = 0;
  positions.forEach(p => {
    p.marketPrice   = quotes[p.symbol] || 0;
    p.marketValue   = p.qty * p.marketPrice;
    p.avgCost       = p.cost / p.qty;
    p.unrealizedPL  = p.marketValue - p.cost;
    p.returnSinceOpenPct = (p.marketPrice - p.avgCost) / p.avgCost * 100;
    totalValue += p.marketValue;
  });
  positions.forEach(p => { p.diversityWeight = p.marketValue / totalValue * 100; });

  return { asOf: new Date(), totalValue, holdings: positions };
}

module.exports = { getLivePortfolio };
