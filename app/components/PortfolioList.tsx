import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableWrapper from "../table_wrapper";

type Holding = {
  holding_id: number;
  symbol: string;
  quantity: string;
  avg_cost: string;
  market_price: string;
  market_value: string;
  return_pct: string;
};

type PortfolioData = {
  asOf: string;
  totalValue: number;
  holdings: Holding[];
};

const PortfolioList = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch('http://localhost:8080/portfolio/live');
        const data = await res.json();
        setPortfolioData(data);
      } catch (error) {
        console.error('Failed to fetch portfolios:', error);
      }
    };

    fetchPortfolios();
  }, []);

//   if (!portfolioData) {
//     return <div>Loading...</div>;
//   }

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Symbol</TableHead>
            <TableHead className="w-1/4">Quantity</TableHead>
            <TableHead className="w-1/4">Avg Cost</TableHead>
            <TableHead className="w-1/4">Market Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioData?.holdings?.map((holding) => (
            <TableRow key={holding.holding_id}>
              <TableCell className="font-medium">{holding.symbol}</TableCell>
              <TableCell>{parseFloat(holding.quantity).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(holding.avg_cost).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(holding.market_price).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default PortfolioList;
