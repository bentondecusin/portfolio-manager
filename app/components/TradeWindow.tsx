"use client";
import React, { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trade } from "../actions";

export default function TradeWindow({
  isOpen,
  onClose,
  preTradeSymbol,
  holdings,
  setHoldings,
  balance,
  setBalance,
  stage,
  setStage,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-0 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
            >
              <a className="cursor-pointer hover:bg-gray-100 active:scale-95 transition duration-150 rounded-md px-4 py-2">
                &times;
              </a>
            </button>
            <TradingWindow
              ticker={preTradeSymbol}
              balance={balance}
              setBalance={setBalance}
              stage={stage}
              setStage={setStage}
            ></TradingWindow>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type TradeMode = "BUY" | "SELL";

interface TradingWindowProps {
  ticker: string;
}

const TradingWindow: React.FC<TradingWindowProps> = ({
  ticker,
  balance,
  setBalance,
  stage,
  setStage
}) => {
  const [quantity, setQuantity] = useState(0);
  const [buy_or_sell, set_buy_or_sell] = useState<"BUY" | "SELL">("BUY");
  const [showWarning, setShowWarning] = useState(false);
  const [isWaitExc, setWaitExec] = useState(false);
  const [message, setMessage] = useState("");
  const [showHold, setShowHold] = useState(true);
  const [isInitLoad, setInitLoad] = useState(true);
  const [isInitFailed, setInitFailed] = useState(false);
  const [preTradePrice, setPreTradePrice] = useState(0);
  const [preTradeHolding, setPreTradeHolding] = useState(0);
  const [preTradeBalance, setPreTradeBalance] = useState(0);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) ? 0 : val);
  };

  const handleExecute = () => {
    if (quantity <= 0) {
      setShowWarning(true);
      return;
    }

    setWaitExec(true);
    trade(
      buy_or_sell,
      ticker,
      quantity,
      preTradeBalance,
      preTradeHolding,
      preTradePrice
    ).then((res) => {
      if (res?.success) {
        setMessage(res.message);
        console.log("Trade executed successfully", res.data);
        setStage(stage + 1); // Increment stage to trigger re-fetch
        setShowHold(false);
      } else {res && setMessage(res.message); }
      setShowWarning(false); // reset warning
      setWaitExec(false);
    });
  };

  // Load live cash balance and market price
  useEffect(() => {
    let cash_fetcher = fetch("http://localhost:8080/holdings/symbol/USD")
      .then((res) => res.json())
      .then((data) => setPreTradeBalance(data[0].quantity)).catch((err) => console.error(err));
    let holding_fetcher = fetch(`http://localhost:8080/holdings/symbol/${ticker}`)
      .then((res) => res.json())
      .then((data) => setPreTradeHolding(data.length != 0 ? data[0].quantity : 0)).catch((err) => console.error(err));
    let quote_fetcher = fetch(`http://localhost:8080/assets/${ticker}/live`)
      .then((res) => res.json())
      .then((data) => setPreTradePrice(data.current_price)).catch((err) => console.error(err));
    Promise.all([ quote_fetcher, cash_fetcher, holding_fetcher])
      .then(() => {
        setInitLoad(false);
      })
      .catch(() => setInitFailed(true));
  }, []);

  if (isInitLoad) return <p>Loading...</p>;
  if (isInitFailed) return <p>No pre trade data</p>;
  return (
    <div className="max-w-md mx-auto flex flex-col align-center p-6 space-y-4 bg-white">
      <h2 className="text-xl font-bold text-center">Market Order: {ticker}</h2>
{showHold && <div className="flex flex-col justify-between text-sm text-gray-600 space-y-4">
      <div className="flex flex-col justify-between text-sm text-gray-600">
        <div>Available Cash: ${preTradeBalance} </div>
        <div>
          Holdings: {preTradeHolding} shares (Market value:$
          {preTradePrice * preTradeHolding}){" "}
        </div>
        <div>
          Spot price:{" "}
          <span className="text-red-600 animate-pulse">${preTradePrice}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={decrement}
          className="px-3 py-1 text-xl border rounded hover:bg-gray-100"
        >
          –
        </button>

        <input
          type="number"
          min={0}
          className="w-20 text-xl text-center border rounded px-2 py-1"
          value={quantity}
          onChange={handleChange}
        />

        <button
          onClick={increment}
          className="px-3 py-1 text-xl border rounded hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => set_buy_or_sell("BUY")}
          className={`px-4 py-2 rounded font-bold transition ${
            buy_or_sell === "BUY"
              ? "cursor-pointer bg-green-600 text-white"
              : "cursor-pointer bg-green-200 text-green-500 opacity-50"
          }`}
        >
          Buy
        </button>

        <button
          onClick={() => set_buy_or_sell("SELL")}
          className={`px-4 py-2 rounded font-bold transition ${
            buy_or_sell === "SELL"
              ? "cursor-pointer bg-red-600 text-white"
              : "cursor-pointer bg-red-200 text-red-500 opacity-50"
          }`}
        >
          Sell
        </button>
      </div>

      <button
        onClick={handleExecute}
        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg font-semibold"
      >
        Execute
      </button></div>
}
      {showWarning && (
        <p className="text-red-600 text-sm font-medium">
          ⚠️ Invalid trade amount. Please enter a positive number.
        </p>
      )}
      {isWaitExc && (
        <p className="text-sm font-medium animate-pulse">
          Submitted to broker... Hang on for a sec
        </p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};