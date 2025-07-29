"use client";

import StockList from "./components/StockList";
import PriceTrend from "./components/PriceTrend";
import PortfolioList from "./components/PortfolioList";
import TransactionList from './components/TransactionList'
import { useState } from "react";
import TradeWindow from "./components/TradeWindow";
import Navbar from "./components/Navbar";
import AccountCard from "./components/AccountCard";
import TransactionHistory from "./components/TransactionHistory";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({});
  const [preTradeSymbol, setPreTradeSymbol] = useState("");
  const [trendSymbol, setTrendSymbol] = useState("AAPL");

  return (
    <div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  z-50">
          <TradeWindow
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            preTradeSymbol={preTradeSymbol}
          ></TradeWindow>
        </div>
      )}
      <Navbar />
      <div className="container mx-auto p-4 flex">
        <div className="w-1/2 pr-2 flex flex-col gap-4">
          <AccountCard />
          <PriceTrend symbol={trendSymbol} />
        </div>
        <div className="w-1/2 h-1/3 pl-2">
          <StockList
            setIsModalOpen={setIsModalOpen}
            setTrendSymbol={setTrendSymbol}
            setPreTradeSymbol={setPreTradeSymbol}
          />
        </div>
      </div>
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Current Holding</h2>
        <PortfolioList />
        <div className="my-12" />
        <h2 className="text-3xl font-bold mb-6">Transaction History</h2>
        <TransactionList />
      </div>
    </div>
  );
}
