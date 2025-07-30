import React, { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import TopUp from './TopUpButton'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'

interface AccountCardProps {
    amount: string;
    setAmount: (value: string) => void;
}

type Transaction = {
    id: string,
    symbol: string,
    tick_name: string,
    txn_type: string,
    quantity: string,
    price: string,
    txn_ts: string
};

interface Payload {
    name: string;
    value: number;
}

interface CustomTooltipProps {
    active: boolean;
    payload: Payload[];
    holdings: Holding[];
}

type Holding = {
    symbol: string,
    tick_name: string,
    totalShares: number,
    lastPrice: number,
    totalValue: number
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AccountCard: React.FC<AccountCardProps> = ({ amount, setAmount }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch('/api/transactions');
                const data = await res.json();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
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
                const isBuy = transaction.txn_type === 'Buy';
                if (!holdingsMap.has(symbol)) {
                    holdingsMap.set(symbol, {
                        symbol,
                        tick_name: transaction.tick_name,
                        totalShares: 0,
                        lastPrice: price,
                        totalValue: 0
                    });
                }
                const holding = holdingsMap.get(symbol)!;
                holding.lastPrice = price; // always update to latest transaction price
                if (isBuy) {
                    holding.totalShares += quantity;
                } else {
                    holding.totalShares -= Math.min(holding.totalShares, quantity);
                }
                holding.totalValue = holding.totalShares * holding.lastPrice;
            });
            const finalHoldings = Array.from(holdingsMap.values())
                .filter(holding => holding.totalShares > 0)
                .sort((a, b) => b.totalValue - a.totalValue);
            setHoldings(finalHoldings);

            console.log(finalHoldings)
        }
    }, [transactions]);

    const pieData = holdings.map((holding, index) => ({
        symbol: holding.symbol,
        value: holding.totalValue,
        color: COLORS[index % COLORS.length]
    }));

    console.log('holdings:', holdings);
    console.log('pieData:', pieData);

    const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            console.log('payload[0]:', payload[0]);
            const symbol = payload[0].name;
            const holding = holdings.find(h => String(h.symbol) === String(symbol));
            console.log('symbol:', symbol, 'holding:', holding);
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">Symbol: {holding?.symbol || symbol}</p>
                    <p className="text-sm text-gray-600">Shares: {holding ? holding.totalShares.toFixed(0) : "-"}</p>
                    <p className="text-sm text-gray-600">Price: ${holding ? holding.lastPrice.toFixed(2) : "-"}</p>
                </div>
            );
        }
        return null;
    };

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        
        <Card className='p-2'>
            <div className='flex gap-4 min-h-[180px]'>
                <div className='flex-1 flex flex-col justify-end h-[180px]'>
                    <CardHeader className='pb-1'>
                        <div className='flex items-end justify-start mt-4 space-x-2'>
                            <CardTitle className='font-semi-bold text-5xl'>John Doe</CardTitle>
                            <TopUp amount={amount} setAmount={setAmount} />
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-3 py-2 justify-between items-end min-h-[90px]">
                        <div className="flex flex-col w-1/2 h-full justify-end">
                            <p className="font-semi-bold text-4xl">Return</p>
                            <CardDescription className="text-xl">$30000</CardDescription>
                        </div>
                        <div className="flex flex-col w-1/2 h-full justify-end">
                            <p className="font-semi-bold text-4xl">Balance</p>
                            <CardDescription className="text-xl">$10000</CardDescription>
                        </div>
                    </CardContent>
                </div>
                {/* Pie Chart */}
                <div className='flex-1 h-[180px]'>
                    <CardContent className="pt-4 flex-1">
                        {pieData.length > 0 ? (
                            <div className="relative h-[180px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="symbol"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            strokeWidth={5}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                            >
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={viewBox.cy}
                                                                    className="fill-foreground text-2xl font-bold"
                                                                >
                                                                    ${totalPortfolioValue.toLocaleString()}
                                                                </tspan>
                                                                <tspan
                                                                    x={viewBox.cx}
                                                                    y={(viewBox.cy || 0) + 20}
                                                                    className="fill-muted-foreground text-xxs"
                                                                >
                                                                    Value
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
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