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
            <div className="flex flex-col">
              {/* <p>Your current holding</p>
              <div>
                <Button>Buy</Button>
                <Button>Sell</Button>
              </div> */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
}
