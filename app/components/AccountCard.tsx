import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TopUp from "./TopUpButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AccountCardProps {
  isTopUpDone?: boolean;
  setIsTopUpDone?: (value: boolean) => void;
  setBalance?: (value: string) => void; // Optional prop to set balance
  balance?: string; // Optional prop to display balance
}

type Transaction = {
  id: string;
  symbol: string;
  tick_name: string;
  txn_type: string;
  quantity: string;
  price: string;
  txn_ts: string;
};

interface Payload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  holdings: Holding[];
}

type Holding = {
  symbol: string;
  tick_name: string;
  totalShares: number;
  lastPrice: number;
  totalValue: number;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const AccountCard: React.FC<AccountCardProps> = ({
  stage,
  isTopUpDone,
  setIsTopUpDone,
  setBalance,
  balance,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState<string>("0.00");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsRes = await fetch(
          "http://localhost:8080/transactions"
        );
        const transactionsData = await transactionsRes.json();
        console.log("MYDATA", transactionsData);
        setTransactions(transactionsData);

        // Fetch balance
        const balanceRes = await fetch("http://localhost:8080/balance");
        const balanceData = await balanceRes.json();
        console.log("Balance data:", balanceData);
        if (setBalance) {
          setBalance(balanceData.balance);
        }

        // Fetch Value
        try {
          const valueRes = await fetch("http://localhost:8080/holdings/value");
          if (!valueRes.ok) {
            throw new Error(`HTTP error! status: ${valueRes.status}`);
          }
          const valueData = await valueRes.json();
          console.log("Value data:", valueData);
          console.log("Value data type:", typeof valueData);
          console.log("total_value:", valueData.total_value);
          console.log("total_value type:", typeof valueData.total_value);
          setTotalValue(valueData.total_value || "0.00");
        } catch (error) {
          console.error("Error fetching value:", error);
          setTotalValue("0.00");
        }

        // Reset the topup done flag after fetching
        if (setIsTopUpDone && isTopUpDone) {
          setIsTopUpDone(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("Fetching data with stage:", stage);
    fetchData();
  }, [stage, isTopUpDone, setIsTopUpDone]); // Re-fetch when isTopUpDone changes

  useEffect(() => {
    const fetchHoldingsData = async () => {
      if (transactions.length > 0) {
        const holdingsMap = new Map<string, Holding>();

        // First, process transactions to get basic holding info
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
          holding.lastPrice = price; // always update to latest transaction price
          if (isBuy) {
            holding.totalShares += quantity;
          } else {
            holding.totalShares -= Math.min(holding.totalShares, quantity);
          }
        });

        // Filter holdings with positive shares
        const holdingsWithShares = Array.from(holdingsMap.values()).filter(
          (holding) => holding.totalShares > 0
        );

        // Fetch individual holding values from API
        const holdingsWithValues = await Promise.all(
          holdingsWithShares.map(async (holding) => {
            try {
              const response = await fetch(
                `http://localhost:8080/holdings/value/${holding.symbol}`
              );
              if (response.ok) {
                const data = await response.json();
                const value = parseFloat(data[0]?.value || "0");
                return {
                  ...holding,
                  totalValue: value,
                };
              }
            } catch (error) {
              console.error(
                `Error fetching value for ${holding.symbol}:`,
                error
              );
            }
            // Fallback to calculated value if API fails
            return {
              ...holding,
              totalValue: holding.totalShares * holding.lastPrice,
            };
          })
        );

        const finalHoldings = holdingsWithValues.sort(
          (a, b) => b.totalValue - a.totalValue
        );
        setHoldings(finalHoldings);
      }
    };

    fetchHoldingsData();
  }, [stage, transactions]);

  const pieData = holdings.filter((holding) => holding.symbol != "USD").map((holding, index) => ({
    name: holding.symbol,
    value: holding.totalValue,
    color: COLORS[index % COLORS.length],
  }));

  // Use the totalValue from /holdings/value API for consistency
  const totalPortfolioValue = parseFloat(totalValue) || 0;

  const CustomTooltip = ({ active, payload, holdings }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const holding = holdings.find((h) => h.symbol === payload[0].name);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm text-gray-600">{`Price: $${holding?.lastPrice.toFixed(
            2
          )}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex gap-8">
        {/* Left Section - Avatar and Name */}
        <div className="flex flex-col items-center justify-center gap-6 w-1/4">
          <div className="w-32 h-32 rounded-full overflow-hidden border border-border shadow-lg">
            <img
              src="/WechatIMG54.jpg"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <CardTitle className="font-bold text-3xl">
                Jhon Doe
              </CardTitle>
              <TopUp setIsTopUpDone={setIsTopUpDone} />
            </div>
          </div>
        </div>

        {/* Middle Section - Value and Balance */}
        <div className="flex flex-col justify-center gap-6 w-1/4">
          <div className="text-center">
            <p className="font-bold text-4xl mb-2">Portfolio Value</p>
            <CardDescription className="text-3xl font-semibold">
              ${parseFloat(totalValue - balance).toFixed(0)}
            </CardDescription>
          </div>
          <div className="text-center">
            <p className="font-bold text-4xl mb-2">Cash Balance</p>
            <CardDescription className="text-3xl font-semibold">
              ${balance}
            </CardDescription>
          </div>
        </div>

        {/* Right Section - Pie Chart */}
        <div className="flex-1">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold">
              Portfolio Distribution
            </h3>
          </div>
          {pieData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} holdings={holdings} />
                    )}
                  />
                  {/* Center text */}
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-semibold fill-foreground"
                  >
                    ${parseFloat(totalValue - balance).toFixed(0)}
                  </text>
                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    Portfolio Value
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-40 h-40 rounded-full border-4 border-gray-200 mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">No Holdings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AccountCard;
