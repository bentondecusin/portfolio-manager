"use client";

import StockList from "./components/StockList";
import PriceTrend from "./components/PriceTrend";
import PortfolioList from "./components/PortfolioList";
import { useState } from "react";
import TradeWindow from "./components/TradeWindow";
import Navbar from "./components/Navbar";
import AccountCard from "./components/AccountCard";
import ChatBot from "./components/ChatBot";
import TransactionList from "./components/TransactionHistory";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preTradeSymbol, setPreTradeSymbol] = useState("");
  const [trendSymbol, setTrendSymbol] = useState("NVDA");
  const [isTopUpDone, setIsTopUpDone] = useState(true);
  const [balance, setBalance] = useState(0);


  return (
    <div className="min-h-screen bg-gray-50">
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <TradeWindow
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            preTradeSymbol={preTradeSymbol}
                              balance={balance} setBalance={setBalance}

          />
        </div>
      )}
      
      <Navbar />
      
      {/* Main Dashboard Section */}
      <div className="container mx-auto px-6 py-8">
        {/* Account Overview */}
        <div className="mb-8">
          <AccountCard 
            isTopUpDone={isTopUpDone}
            setIsTopUpDone={setIsTopUpDone}
            setBalance={setBalance}
            balance={balance}
          />
        </div>

        {/* Market Data and Stock List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Price Trend */}
          <div className="space-y-6 h-fit">
            <div className="h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Analysis</h2>
              <div className="flex-1">
                <PriceTrend symbol={trendSymbol} />
              </div>
            </div>
          </div>
          
          {/* Right Column - Stock List */}
          <div className="space-y-6 h-fit">
            <div className="h-[600px] flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Watchlist</h2>
              <div className="flex-1">
                <StockList
                  setIsModalOpen={setIsModalOpen}
                  setTrendSymbol={setTrendSymbol}
                  setPreTradeSymbol={setPreTradeSymbol}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio and Transaction Sections */}
        <div className="space-y-12 mt-36">
          {/* Current Holdings */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Current Holdings</h2>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-transparent flex-1 ml-6 rounded-full"></div>
            </div>
            <PortfolioList />
          </section>

          {/* Transaction History */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
              <div className="h-1 bg-gradient-to-r from-green-500 to-transparent flex-1 ml-6 rounded-full"></div>
            </div>
            <TransactionList />
          </section>
        </div>

        {/* Chat Bot */}
        <div className="fixed bottom-6 right-6 z-40">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}
