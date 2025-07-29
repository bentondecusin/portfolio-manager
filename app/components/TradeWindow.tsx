"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function TradeWindow({ isOpen, onClose, preTradeSymbol }) {
  const [isBuy, setBuy] = useState("fal");
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
            <h2 className="text-xl font-semibold mb-4">
              Trade <a className="bg-red-900"></a>
              {preTradeSymbol} at 0 commission fee
            </h2>
            <TradingWindow ticker="AAPL" availableCash={12000} holdings={50} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type TradeMode = "BUY" | "SELL";

interface TradingWindowProps {
  ticker: string;
  availableCash: number;
  holdings: number;
}

const TradingWindow: React.FC<TradingWindowProps> = ({
  ticker,
  availableCash,
  holdings,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [buy_or_sell, set_buy_or_sell] = useState<"BUY" | "SELL">("BUY");

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) ? 0 : val);
  };

  const handleExecute = () => {
    console.log("Execute trade:", { buy_or_sell, ticker, quantity });
  };

  return (
    <div className="max-w-md mx-auto flex flex-col align-center p-6 space-y-4 bg-white">
      <h2 className="text-xl font-bold text-center">Trade {ticker}</h2>

      <div className="flex justify-between text-sm text-gray-600">
        <div>Available Cash: ${availableCash.toFixed(2)}</div>
        <div>Holdings: {holdings} shares</div>
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg font-semibold"
      >
        Execute
      </button>
    </div>
  );
};
