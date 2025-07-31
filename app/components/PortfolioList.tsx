import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import TableWrapper from "../table_wrapper";

type Transaction = {
  id: string;
  symbol: string;
  tick_name: string;
  txn_type: string;
  quantity: string;
  price: string;
  txn_ts: string;
};

type Holding = {
  symbol: string;
  tick_name: string;
  totalShares: number;
  lastPrice: number;
  totalValue: number;
};

const PortfolioList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("api/transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const holdingsMap = new Map<string, Holding>();

      transactions.forEach((transaction) => {
        const symbol = transaction.symbol;
        const quantity = parseFloat(transaction.quantity);
        const price = parseFloat(transaction.price);
        const isBuy = transaction.txn_type === "buy";

        if (!holdingsMap.has(symbol)) {
          holdingsMap.set(symbol, {
            symbol,
            tick_name: transaction.tick_name,
            totalShares: 0,
            lastPrice: price,
            totalValue: 0,
          });
        }

        const holding = holdingsMap.get(symbol)!;
        // Always update lastPrice to the latest transaction's price
        holding.lastPrice = price;

        if (isBuy) {
          holding.totalShares += quantity;
        } else {
          holding.totalShares -= Math.min(holding.totalShares, quantity);
        }
        holding.totalValue = holding.totalShares * holding.lastPrice;
      });

      const finalHoldings = Array.from(holdingsMap.values())
        .filter((holding) => holding.totalShares > 0)
        .sort((a, b) => b.totalValue - a.totalValue);

      setHoldings(finalHoldings);
    }
  }, [transactions]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Symbol</TableHead>
            <TableHead className="w-1/5">Name</TableHead>
            <TableHead className="w-1/5">Shares</TableHead>
            <TableHead className="w-1/5">Price</TableHead>
            <TableHead className="w-1/5">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.symbol}>
              <TableCell className="font-medium">{holding.symbol}</TableCell>
              <TableCell>{holding.tick_name}</TableCell>
              <TableCell>{holding.totalShares.toFixed(0)}</TableCell>
              <TableCell>${holding.lastPrice.toFixed(2)}</TableCell>
              <TableCell>${holding.totalValue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default PortfolioList;
