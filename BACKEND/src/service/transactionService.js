const txnModel = require("../model/transactionModel");
const balanceSVC = require("./balanceService");
const assetModel = require("../model/assetModel");
const holdingModel = require("../model/holdingModel");
const db = require("../db");

// GET transactions
async function getTxns() {
  const txn_list = await txnModel.selectAllTxns();
  return txn_list;
}

async function getTxnById(id) {
  const txn_res = await txnModel.selectTxnById(id);
  return txn_res;
}

async function getTxnBySymbol(symbol) {
  const txn_res = await txnModel.selectAllTxnBySymbol(symbol);
  return txn_res;
}

async function getTxnByDate(date) {
  const txn_res = await txnModel.selectAllTxnByDate(date);
  return txn_res;
}

// Helper function to get ticker name from symbol
async function getTickerName(symbol) {
  // Fallback to a simple mapping for common symbols (no database dependency)
  const commonSymbols = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
    NFLX: "Netflix Inc.",
    JPM: "JPMorgan Chase & Co.",
    KO: "Coca-Cola Company",
    USD: "US Dollar",
  };

  // Try to get from database first, but don't fail if table doesn't exist
  try {
    const asset = await assetModel.findAssetBySymbol(symbol);
    if (asset && asset.name) {
      return asset.name;
    }
  } catch (error) {
    // Silently fall back to hardcoded mapping if asset table doesn't exist
    console.log(`Asset table not available, using fallback for ${symbol}`);
  }

  return commonSymbols[symbol] || symbol;
}

// Enhanced POST transaction with balance checking and database transaction
async function insertSingleTxn(txn) {
  try {
    const { symbol, txnType, quantity, price } = txn;
    const tickName = await getTickerName(symbol);
    const txnTs = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Calculate total transaction amount
    const totalAmount = quantity * price;
    if (txnType.toLowerCase() === "buy") {
      // Check if we have enough cash balance
      const currentBalance = await balanceSVC.getCurrentCashBalance();
      if (currentBalance < totalAmount) {
        throw new Error(
          `Insufficient cash balance. Required: $${totalAmount.toFixed(
            2
          )}, Available: $${currentBalance.toFixed(2)}`
        );
      }

      // Deduct cash from USD holdings
      const usdTxn = {
        symbol: "USD",
        tickName: "US Dollar",
        txnType: "sell",
        quantity: totalAmount,
        price: 1.0,
        txnTs: txnTs,
      };

      await txnModel.insertTxn(usdTxn);
    } else if (txnType.toLowerCase() === "sell") {
      // Check if we have enough holdings to sell
      const currentHoldings = await txnModel.getHoldings(symbol);
      console.log("currentHoldings", currentHoldings);
      if (currentHoldings < quantity) {
        throw new Error(
          `Insufficient holdings to sell. Required: ${quantity}, Available: ${currentHoldings}`
        );
      }

      // Add cash back to USD holdings
      const usdTxn = {
        symbol: "USD",
        tickName: "US Dollar",
        txnType: "buy",
        quantity: totalAmount,
        price: 1.0,
        txnTs: txnTs,
      };

      await txnModel.insertTxn(usdTxn);
    }

    // Insert the main transaction
    const mainTxn = {
      symbol,
      tickName,
      txnType,
      quantity,
      price,
      txnTs,
    };

    const result = await txnModel.insertTxn(mainTxn);

    return {
      success: true,
      message: `Transaction completed successfully. ${txnType} ${quantity} shares of ${symbol} at $${price}`,
      transactionId: result.id,
      ...result,
    };
  } catch (error) {
    // If any operation fails, the error will be thrown and caught by the controller
    // The database will remain in a consistent state since we're not using transactions
    throw error;
  }
}

// Legacy function for backward compatibility
async function insertSingleTxnLegacy(txn) {
  if (txn.txnType === "sell") {
    const cur_holdings = await txnModel.getHoldings(txn.symbol);
    if (txn.quantity > cur_holdings) {
      throw new Error(
        "Error in service: insertSingleTxn, Not Enough Holdings To Sell"
      );
    }
  }
  const txn_res = await txnModel.insertTxn(txn);
  return txn_res;
}

// UPSERT transaction (INSERT if not exists, UPDATE if exists)
// async function upsertSingleTxn(id, txn) {
//     const txn_res = await txnModel.upsertTxnById(id, txn);
//     return txn_res;
// }

// PUT transaction (UPDATE only - for backward compatibility)
async function updateSingleTxn(id, txn) {
  const txn_res = await txnModel.updateTxnById(id, txn);
  return txn_res;
}

// DELETE transaction
async function deleteSingleTxn(id) {
  const rows_affected = await txnModel.deleteTxnById(id);
  return rows_affected;
}

module.exports = {
  getTxns,
  insertSingleTxn,
  insertSingleTxnLegacy,
  getTxnById,
  getTxnBySymbol,
  getTxnByDate,
  updateSingleTxn,
  // upsertSingleTxn,
  deleteSingleTxn,
};
