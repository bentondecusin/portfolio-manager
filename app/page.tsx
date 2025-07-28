"use client";

import React from "react";
import StockList from "./components/StockList";
import PriceTrend from "./components/PriceTrend";
import PortfolioList from "./components/PortfolioList";
import Navbar from "./components/Navbar";

export default function Home() {
  const [trendSymbol, setTrendSymbol] = React.useState('AAPL');
  return (
    <div>
      <Navbar/>
      <div className="container mx-auto p-4 flex">
        <div className="w-1/2 pr-2">
          <PriceTrend symbol={trendSymbol} />
        </div>
        <div className="w-1/2 pl-2">
          <StockList />
        </div>
      </div>
      <div className="container mx-auto p-4">
        <PortfolioList />
      </div>
    </div>
  );
}
