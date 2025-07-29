import React, { useState, useEffect } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type Portfolio = {
    name: string;
    symbol: string;
    shares: number;
    price: string;
    totalReturn: string;
};

const portfolios_test: Portfolio[] = [
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

const AccountCard = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

    useEffect(() => {
        setPortfolios(portfolios_test);
    }, []);

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
        <Card className='p-2'>
            <div className='flex gap-4'>
                <div className='flex-1'>
                    <CardHeader className='pb-1'>
                        <CardTitle className='font-semi-bold text-5xl mt-4'>Jhon Doe</CardTitle>
                    </CardHeader>
                    <CardContent className='flex gap-3 py-2'>
                        <div className='flex flex-col w-1/2'>
                            <p className='font-semi-bold text-4xl'>Value</p>
                            <CardDescription className='text-xl'>$1000</CardDescription>
                        </div>
                        <div className='flex flex-col w-1/2'>
                            <p className='font-semi-bold text-4xl'>Balance</p>
                            <CardDescription className='text-xl'>$200</CardDescription>
                        </div>
                    </CardContent>
                </div>
        
            
            {/* Pie Chart */}
                <div className='flex-1'>
                    <CardContent className='pt-4'>
                        <h3 className="text-lg font-semibold mb-2 text-center">Portfolio Shares Distribution</h3>
                        {pieData.length > 0 ? (
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={60}
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
                        ) : (
                            <div className="h-[180px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 mx-auto mb-4"></div>
                                    <p className="text-gray-500 text-lg">Empty</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </div>
        </Card>
    )
}

export default AccountCard