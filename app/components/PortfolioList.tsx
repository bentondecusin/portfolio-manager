import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import TableWrapper from "../table_wrapper";

type Portfolio = {
  name: string;
  symbol: string;
  shares: number;
  price: string;
  totalReturn: string;
};

const portfolios_test = [
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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

  // 转换数据格式为饼图所需格式
  const pieData = portfolios.map((portfolio, index) => ({
    name: portfolio.symbol,
    value: portfolio.shares,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm text-gray-600">{`Shares: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  };

  return (
    <div className="flex gap-6">
      {/* Table */}
      <div className="w-1/2">
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
      </div>

      {/* Pie Chart */}
      <div className="w-1/2">
        <div className="w-full h-[300px]">
          <h3 className="text-lg font-semibold mb-4 text-center">Portfolio Shares Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioList;
