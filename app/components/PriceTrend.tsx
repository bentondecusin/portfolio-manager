"use client"

import React from 'react'
import useSWR from 'swr'
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, ComposedChart, Bar } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const chartConfig = {
  intervals: {
    label: "Intervals",
  },
  candle: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type CandleData = { 
  date: string; 
  open: number; 
  high: number; 
  low: number; 
  close: number; 
  volume: number;
  color: string; // For candle color (green/red)
}

interface ApiDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ApiResponse {
  symbol: string;
  type: string;
  range: string;
  from: string;
  to: string;
  data: ApiDataPoint[];
}

interface PriceTrendProps {
  symbol?: string;
}

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isPositive = close >= open;
  
  // Calculate positions
  const candleWidth = Math.max(width * 0.6, 2);
  const candleX = x + (width - candleWidth) / 2;
  
  // Wick (high-low line)
  const wickX = x + width / 2;
  
  // Body height and position
  const bodyHeight = Math.abs(close - open) * height / (high - low);
  const bodyY = y + ((high - Math.max(open, close)) * height / (high - low));
  
  // Wick positions
  const highY = y;
  const lowY = y + height;
  const topWickY = y + ((high - Math.max(open, close)) * height / (high - low));
  const bottomWickY = y + ((high - Math.min(open, close)) * height / (high - low));
  
  return (
    <g>
      {/* High-Low wick */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth={1}
      />
      
      {/* Open-Close body */}
      <rect
        x={candleX}
        y={bodyY}
        width={candleWidth}
        height={Math.max(bodyHeight, 1)}
        fill={isPositive ? "#10b981" : "#ef4444"}
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth={1}
      />
    </g>
  );
};

/**
 * Generate mock candlestick chart data for testing.
 * @param count Number of data points
 * @param startDate ISO string or Date object for the first date
 */
export function generateMockChartData(count: number = 30, startDate: string | Date = new Date()): CandleData[] {
  const data: CandleData[] = [];
  let baseDate = typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
  let lastClose = 100 + Math.random() * 20;

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const open = lastClose;
    const change = (Math.random() - 0.5) * 4;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(1000 + Math.random() * 5000);

    data.push({
      date: date.toISOString().split("T")[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      color: close >= open ? "#10b981" : "#ef4444",
    });

    lastClose = close;
  }

  return data;
}

// SWR fetcher function
const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch data (${response.status})`;
    
    switch (response.status) {
      case 404:
        errorMessage = `Data not found`;
        break;
      case 429:
        errorMessage = 'Rate limit exceeded. Please try again later';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later';
        break;
      case 503:
        errorMessage = 'Service temporarily unavailable';
        break;
      default:
        errorMessage = `HTTP error! status: ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }

  const apiData: ApiResponse = await response.json();
  
  if (!apiData.data || apiData.data.length === 0) {
    throw new Error(`No data available`);
  }
  
  return apiData;
};

const PriceTrend: React.FC<PriceTrendProps> = ({ symbol }) => {
  const [days, setDays] = React.useState(1);

  // Build API URL
  let apiUrl = null;
  if (symbol) {
    let url = `http://localhost:8080/assets/${symbol}/history`;
    let params = new URLSearchParams();
    
    if (days === 7) {
      params.append('type', 'daily');
      params.append('range', 'week');
    } else if (days === 30) {
      params.append('type', 'daily');
      params.append('range', 'month');
    } else {
      params.append('type', 'intraday');
    }
    
    const queryString = params.toString();
    apiUrl = queryString ? `${url}?${queryString}` : url;
  }

  // SWR hook for data fetching
  const { data: rawData, error, isLoading, mutate } = useSWR(
    apiUrl && symbol ? apiUrl : null,
    fetcher
  );

  // Transform API data to candlestick format
  let chartData: CandleData[] = [];
  if (rawData?.data) {
    chartData = rawData.data.map((item: ApiDataPoint) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      color: item.close >= item.open ? "#10b981" : "#ef4444"
    }));
  }

  // Manual refresh function (only for error cases)
  const handleRefresh = () => {
    if (error) {
      mutate();
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatVolume = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle className="text-3xl">
              {symbol}
            </CardTitle>
            <CardDescription>
              Realtime trading data
            </CardDescription>
          </div>
          <div className="flex w-[50%] items-center mr-5">
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="day" 
                  onClick={() => setDays(1)}
                  className="text-xs"
                >
                  1D
                </TabsTrigger>
                <TabsTrigger 
                  value="week" 
                  onClick={() => setDays(7)}
                  className="text-xs"
                >
                  1W
                </TabsTrigger>
                <TabsTrigger 
                  value="month" 
                  onClick={() => setDays(30)}
                  className="text-xs"
                >
                  1M
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 pt-6 pb-2">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-[350px] w-full">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading candlestick data...</p>
              <p className="text-xs text-muted-foreground">Data will be cached for future use</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-[473px] w-full">
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">Error loading chart data</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <button 
                onClick={handleRefresh}
                className="text-sm text-primary hover:underline mt-2 px-3 py-1 border rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Candlestick Chart */}
        {!isLoading && !error && chartData.length > 0 && (
          <>
            {/* Cache indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {rawData?.data && rawData.data.length > 0 && (
                <span className="flex items-center">
                {rawData.data.length} points • {new Date(rawData.from).toLocaleDateString()} to {new Date(rawData.to).toLocaleDateString()}
                </span>
              )}
              </div>
            </div>
            
            <div className="w-full h-[350px] mb-2 rounded-xl bg-muted/40 border shadow-inner flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{
                    top: 32,
                    right: 24,
                    left: 0,
                    bottom: 16,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--muted)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      if (days === 1) {
                        // For intraday data, show time in HH:MM format
                        return date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        })
                      } else {
                        // For daily/weekly/monthly data, show date
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    }}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <ChartTooltip
                    wrapperStyle={{ outline: "none" }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background p-3 border rounded-lg shadow-lg min-w-[180px]">
                            <p className="font-semibold text-base mb-2">
                              {new Date(label).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Open:</span>
                                <span className="font-medium">{formatPrice(data.open)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">High:</span>
                                <span className="font-medium text-green-600">{formatPrice(data.high)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Low:</span>
                                <span className="font-medium text-red-600">{formatPrice(data.low)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Close:</span>
                                <span className="font-medium">{formatPrice(data.close)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Volume:</span>
                                <span className="font-medium">{formatVolume(data.volume)}</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t">
                                <span className="text-muted-foreground">Change:</span>
                                <span className={`font-medium ${data.close >= data.open ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatPrice(data.close - data.open)} ({((data.close - data.open) / data.open * 100).toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="high"
                    shape={<Candlestick />}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Market Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              <div className="text-center p-3 rounded-lg border bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Open</p>
                <p className="font-semibold text-lg">{formatPrice(chartData[chartData.length - 1].open)}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">High</p>
                <p className="font-semibold text-lg text-green-600">{formatPrice(Math.max(...chartData.map(d => d.high)))}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Low</p>
                <p className="font-semibold text-lg text-red-600">{formatPrice(Math.min(...chartData.map(d => d.low)))}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-background shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Close</p>
                <p className="font-semibold text-lg">{formatPrice(chartData[chartData.length - 1].close)}</p>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!isLoading && !error && chartData.length === 0 && (
          <div className="flex items-center justify-center h-[350px] w-full">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No candlestick data available</p>
              <p className="text-sm text-muted-foreground">
                {symbol ? `No data found for ${symbol}` : 'Please select a symbol'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PriceTrend