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
import TopUp from './TopUpButton'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface AccountCardProps {
    isTopUpDone?: boolean;
    setIsTopUpDone?: (value: boolean) => void;
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

type Holding = {
    symbol: string,
    tick_name: string,
    totalShares: number,
    lastPrice: number,
    totalValue: number
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AccountCard: React.FC<AccountCardProps> = ({ isTopUpDone, setIsTopUpDone }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [balance, setBalance] = useState<string>('0.00');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch transactions
                const transactionsRes = await fetch('http://localhost:8080/transactions');
                const transactionsData = await transactionsRes.json();
                console.log('MYDATA', transactionsData);
                setTransactions(transactionsData);

                // Fetch balance
                const balanceRes = await fetch('http://localhost:8080/balance');
                const balanceData = await balanceRes.json();
                console.log('Balance data:', balanceData);
                setBalance(balanceData.balance);
                
                // Reset the topup done flag after fetching
                if (setIsTopUpDone && isTopUpDone) {
                    setIsTopUpDone(false);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [isTopUpDone, setIsTopUpDone]); // Re-fetch when isTopUpDone changes

    useEffect(() => {
        if (transactions.length > 0) {
            const holdingsMap = new Map<string, Holding>();
            transactions.forEach((transaction) => {
                const symbol = transaction.symbol;
                const quantity = parseFloat(transaction.quantity);
                const price = parseFloat(transaction.price);
                const isBuy = transaction.txn_type === 'buy';
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
        }
    }, [transactions]);

    const pieData = holdings.map((holding, index) => ({
        name: holding.symbol,
        value: holding.totalValue,
        color: COLORS[index % COLORS.length]
    }));

    const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const holding = holdings.find(h => h.symbol === payload[0].name);
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{`${payload[0].name}`}</p>
                    <p className="text-sm text-gray-600">{`Shares: ${holding?.totalShares.toFixed(0)}`}</p>
                    <p className="text-sm text-gray-600">{`Price: $${holding?.lastPrice.toFixed(2)}`}</p>
                    <p className="text-sm text-gray-600">{`Value: $${payload[0].value.toFixed(2)}`}</p>
                </div>
            )
        }
        return null
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Card className='p-2'>
            <div className='flex gap-4'>
                <div className='flex-1'>
                    <CardHeader className='pb-1'>
                    <div className='flex items-end justify-start mt-4  space-x-2'>
                        <CardTitle className='font-semi-bold text-5xl'>Jhon Doe</CardTitle>
                        <TopUp setIsTopUpDone={setIsTopUpDone} />
                    </div>
                </CardHeader>
                    <CardContent className='flex gap-3 py-2'>
                        <div className='flex flex-col w-1/2'>
                            <p className='font-semi-bold text-4xl'>Value</p>
                            <CardDescription className='text-xl'>${totalPortfolioValue.toFixed(2)}</CardDescription>
                        </div>
                        <div className='flex flex-col w-1/2'>
                            <p className='font-semi-bold text-4xl'>Balance</p>
                            <CardDescription className='text-xl'>${balance}</CardDescription>
                        </div>
                    </CardContent>
                </div>
                {/* Pie Chart */}
                <div className='flex-1'>
                    <CardContent className='pt-4'>
                        <h3 className="text-lg font-semibold mb-2 text-center">Portfolio Distribution</h3>
                        {pieData.length > 0 ? (
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 mx-auto mb-4"></div>
                                    <p className="text-gray-500 text-lg">No Holdings</p>
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