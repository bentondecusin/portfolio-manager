"use server";

export async function trade(
  operationType: "BUY" | "SELL",
  symbol,
  quantity,
  preTradeBalance,
  preTradeHolding,
  preTradePrice
) {
  // Sell spec: holding > toSell => execute sell
  // Buy spec: holding cash > toBuy * price  => execute buy
  // Atomic action: materializes transaction and update holding table

  if (operationType == "BUY") {
    if (preTradePrice * quantity > preTradeBalance)
      return {
        success: false,
        message: `Not enough cash. \$${preTradePrice * quantity} needed`,
      };
    // TODO trade logic
    else
      return {
        success: true,
        message: `Transaction complete!`,
      };
  }
  if (operationType == "SELL") {
    if (quantity > preTradeHolding)
      return {
        success: false,
        message: `Attempted to sell ${quantity} shares. Only hold ${preTradeHolding} shares`,
      };
    // TODO trade logic
    else
      return {
        success: true,
        message: `Transaction complete!`,
      };
  }
}
