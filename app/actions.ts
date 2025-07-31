"use server";
export async function trade(
  operationType: "BUY" | "SELL",
  symbol,
  quantity,
  preTradeBalance,
  preTradeHolding,
  preTradePrice
) {
  // Pre Trade
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
  // On Trade

  try {
    console.log("Executing");
    
    let res = await fetch("http://localhost:8080/transactions/", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol: symbol,
        txnType: operationType.toLowerCase(),
        quantity: quantity,
        price: preTradePrice,
      }),
    });
    // Post Trade
    let data = await res.json();
    if (!data.success) {
      return {
        success: false,
        message: data.message,
      };
    }
    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (err) {
    console.error(err);
  }
}