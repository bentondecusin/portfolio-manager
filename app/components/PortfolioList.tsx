<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Portfolio = {
    name: string,
    symbol: string,
    shares: number,
    price: string,
    totalReturn: string
}

const portfolios_test = [
    { name: 'Apple Inc.', symbol: 'AAPL', shares: 10, price: '$150.00', totalReturn: '$1500.00' },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', shares: 5, price: '$2800.00', totalReturn: '$14000.00' },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', shares: 2, price: '$3400.00', totalReturn: '$6800.00' },
    { name: 'Microsoft Corporation', symbol: 'MSFT', shares: 8, price: '$299.00', totalReturn: '$2392.00' }
];

const PortfolioList = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

    useEffect(() => {
        // const fetchPortfolios = async () => {
        //     try {
        //         const res = await fetch('/api/portfolios');
        //         const data = await res.json();
        //         setPortfolios(data);
        //     } catch (error) {
        //         console.error('Failed to fetch portfolios:', error);
        //     } 
        // };

        // fetchPortfolios();

        setPortfolios(portfolios_test);
    }, []); 

    // if (loading) return <div>Loading...</div>;

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Name</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total Return</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {portfolios.map((portfolio) => (
                        <TableRow key={portfolio.name}>
                            <TableCell className="font-medium">{portfolio.name}</TableCell>
                            <TableCell>{portfolio.symbol}</TableCell>
                            <TableCell>{portfolio.shares}</TableCell>
                            <TableCell>{portfolio.price}</TableCell>
                            <TableCell className="text-right">{portfolio.totalReturn}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
=======
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
import TableWrapper from "../table_wrapper";

const portfolios = [
  {
    name: "Apple Inc.",
    symbol: "AAPL",
    shares: 10,
    price: "$150.00",
    totalReturn: "$1500.00",
  },
  {
    name: "Alphabet Inc.",
    symbol: "GOOGL",
    shares: 5,
    price: "$2800.00",
    totalReturn: "$14000.00",
  },
  {
    name: "Amazon.com Inc.",
    symbol: "AMZN",
    shares: 2,
    price: "$3400.00",
    totalReturn: "$6800.00",
  },
  {
    name: "Microsoft Corporation",
    symbol: "MSFT",
    shares: 8,
    price: "$299.00",
    totalReturn: "$2392.00",
  },
];

const PortfolioList = () => {
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Total Return</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolios.map((portfolio) => (
            <TableRow key={portfolio.name}>
              <TableCell className="font-medium">{portfolio.name}</TableCell>
              <TableCell>{portfolio.symbol}</TableCell>
              <TableCell>{portfolio.shares}</TableCell>
              <TableCell>{portfolio.price}</TableCell>
              <TableCell className="text-right">
                {portfolio.totalReturn}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};
>>>>>>> Stashed changes

export default PortfolioList;
