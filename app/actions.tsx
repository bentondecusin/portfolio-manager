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

  if (operationType == "BUY" && preTradePrice * quantity > preTradeBalance)
    return {
      success: false,
      message: `Not enough cash. \$${preTradePrice * quantity} needed`,
    };
  else if (operationType == "SELL" && quantity > preTradeHolding)
    return {
      success: false,
      message: `Attempted to sell ${quantity} shares. Only hold ${preTradeHolding} shares`,
    };

  try {
    console.log("Executing");

    fetch(process.env.URL + "/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        symbol: symbol,
        txnType: operationType.toLowerCase(),
        quantity: quantity,
        price: preTradePrice,
      }),
    });

    return {
      success: true,
      message: `Transaction complete!`,
    };
  } catch (err) {
    console.error(err);
  }
}
