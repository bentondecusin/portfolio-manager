"use client";

import StockList from "./components/StockList";
import PriceTrend from "./components/PriceTrend";
import PortfolioList from "./components/PortfolioList";
import { useState } from "react";
import TradeWindow from "./components/TradeWindow";
import Navbar from "./components/Navbar";
import AccountCard from "./components/AccountCard";

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
        <div className="w-1/2 pl-2">
          <StockList
            setIsModalOpen={setIsModalOpen}
            setTrendSymbol={setTrendSymbol}
            setPreTradeSymbol={setPreTradeSymbol}
          />
        </div>
      </div>
      <div className="container mx-auto p-4">
        <PortfolioList />
      </div>
    </div>
  );
}
