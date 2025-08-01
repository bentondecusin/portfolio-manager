import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { symbol } from "framer-motion/client";
import TableWrapper from "../table_wrapper";

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$150.00" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "$2800.00" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: "$3400.00" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: "$299.00" },
  { symbol: "AAPL", name: "Apple Inc.", price: "$150.00" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "$2800.00" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: "$3400.00" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: "$299.00" },
];
const TradeButton = ({ setIsModalOpen, setPreTradeSymbol, symbol }) => {
  return (
    <Button
      onClick={() => {
        setIsModalOpen(true);
        setPreTradeSymbol(symbol);
      }}
      name="close"
      className="px-4 py-2 text-white rounded-xl cursor-pointer hover:bg-blue-950"
    >
      Trade
    </Button>
  );
};
const StockList = ({ setIsModalOpen, setTrendSymbol, setPreTradeSymbol }) => {
  return (
    <div>
      <h2>Market Watchlist</h2>

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, idx) => (
              <TableRow key={idx + stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell>{stock.price}</TableCell>
                <TableCell className="text-right">
                  <TradeButton
                    symbol={stock.symbol}
                    setIsModalOpen={setIsModalOpen}
                    setPreTradeSymbol={setPreTradeSymbol}
                  ></TradeButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </div>
  );
};

export default StockList;
