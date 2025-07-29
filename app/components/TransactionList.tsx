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

type Transaction = {
  id: number;
  symbol: string;
  tick_name: string;
  txn_type: string;
  quantity: string;
  price: string;
  txn_ts: string;
};

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('http://localhost:8080/transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Symbol</TableHead>
            <TableHead className="w-1/4">Company</TableHead>
            <TableHead className="w-1/6">Type</TableHead>
            <TableHead className="w-1/6">Quantity</TableHead>
            <TableHead className="w-1/6">Price</TableHead>
            <TableHead className="w-1/4">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.symbol}</TableCell>
              <TableCell>{transaction.tick_name}</TableCell>
              <TableCell className={transaction.txn_type === 'Buy' ? 'text-green-600' : 'text-red-600'}>
                {transaction.txn_type}
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>${transaction.price}</TableCell>
              <TableCell>{formatDate(transaction.txn_ts)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default TransactionList; 