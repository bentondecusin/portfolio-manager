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
  id: string,
  symbol: string,
  tick_name: string,
  txn_type: string,
  quantity: string,
  price: string,
  txn_ts: string
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('http://localhost:8080/transactions');
        let data = await res.json();

        data = data.sort((a, b) => new Date(b.txn_ts).getTime() - new Date(a.txn_ts).getTime());
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Transaction History</h2>
      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/7">Symbol</TableHead>
              <TableHead className="w-1/7">Name</TableHead>
              <TableHead className="w-1/7">Type</TableHead>
              <TableHead className="w-1/7">Shares</TableHead>
              <TableHead className="w-1/7">Price</TableHead>
              <TableHead className="w-1/7">Total Value</TableHead>
              <TableHead className="w-1/7">Date</TableHead>
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
                <TableCell>{parseFloat(transaction.quantity).toFixed(0)}</TableCell>
                <TableCell>${parseFloat(transaction.price).toFixed(2)}</TableCell>
                <TableCell>${(parseFloat(transaction.price) * parseFloat(transaction.quantity)).toFixed(2)}</TableCell>
                <TableCell>{new Date(transaction.txn_ts).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </div>
  );
};

export default TransactionHistory;