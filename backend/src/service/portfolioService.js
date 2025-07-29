const assetModel = require('../model/assetModel');
const txnModel   = require('../model/transactionModel');
const holdingModel = require('../model/holdingModel');

async function recordTransaction(body) {
  // 1) ensure asset exists
  let asset = await assetModel.findAssetBySymbol(body.symbol);
  if (!asset) {
    asset = await assetModel.create({
      symbol: body.symbol,
      name:   body.symbol,        // placeholder – replace with real lookup
      type:   'STOCK',
      currency: 'USD'
    });
  }

  // 2) write txn
  const txn = await txnModel.createTransaction({
    assetId: asset.id,
    txnType: body.txnType,
    quantity: body.quantity,
    price: body.price,
    txnTs: body.txnTs
  });

  // 3) recalc holding (for BUY/SELL only)
  if (['BUY','SELL'].includes(body.txnType)) {
    // naive cost-basis math; improve later
    const sign = body.txnType === 'BUY' ? 1 : -1;
    const qtyChange = sign * body.quantity;
    const avgCost   = body.price;               // simplistic
    await holdingModel.upsert({
      assetId: asset.id,
      quantity: body.quantity * sign,
      avgCost,
      openedTs: body.txnTs
    });
  }

  return txn;
}

async function getLivePortfolio() {
  const holdings = await holdingModel.listLive();
  const totalValue = holdings.reduce((sum, h) => sum + Number(h.market_value), 0);
  return { asOf: new Date().toISOString(), totalValue, holdings };
}

module.exports = { recordTransaction, getLivePortfolio };
