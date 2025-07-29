"use client"

import React from 'react'
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartDataTest = [
  { date: "2024-04-01", price: 222 },
  { date: "2024-04-02", price: 97 },
  { date: "2024-04-03", price: 167 },
  { date: "2024-04-04", price: 242 },
  { date: "2024-04-05", price: 373 },
  { date: "2024-04-06", price: 301 },
  { date: "2024-04-07", price: 245 },
  { date: "2024-04-08", price: 409 },
  { date: "2024-04-09", price: 59 },
  { date: "2024-04-10", price: 261 },
  { date: "2024-04-11", price: 327 },
  { date: "2024-04-12", price: 292 },
  { date: "2024-04-13", price: 342 },
  { date: "2024-04-14", price: 137 },
  { date: "2024-04-15", price: 120 },
  { date: "2024-04-16", price: 138 },
  { date: "2024-04-17", price: 446 },
  { date: "2024-04-18", price: 364 },
  { date: "2024-04-19", price: 243 },
  { date: "2024-04-20", price: 89 },
  { date: "2024-04-21", price: 137 },
  { date: "2024-04-22", price: 224 },
  { date: "2024-04-23", price: 138 },
  { date: "2024-04-24", price: 387 },
  { date: "2024-04-25", price: 215 },
  { date: "2024-04-26", price: 75 },
  { date: "2024-04-27", price: 383 },
  { date: "2024-04-28", price: 122 },
  { date: "2024-04-29", price: 315 },
  { date: "2024-04-30", price: 454 },
  { date: "2024-05-01", price: 165 },
  { date: "2024-05-02", price: 293 },
  { date: "2024-05-03", price: 247 },
  { date: "2024-05-04", price: 385 },
  { date: "2024-05-05", price: 481 },
  { date: "2024-05-06", price: 498 },
  { date: "2024-05-07", price: 388 },
  { date: "2024-05-08", price: 149 },
  { date: "2024-05-09", price: 227 },
  { date: "2024-05-10", price: 293 },
  { date: "2024-05-11", price: 335 },
  { date: "2024-05-12", price: 197 },
  { date: "2024-05-13", price: 197 },
  { date: "2024-05-14", price: 448 },
  { date: "2024-05-15", price: 473 },
  { date: "2024-05-16", price: 338 },
  { date: "2024-05-17", price: 499 },
  { date: "2024-05-18", price: 315 },
  { date: "2024-05-19", price: 235 },
  { date: "2024-05-20", price: 177 },
  { date: "2024-05-21", price: 82 },
  { date: "2024-05-22", price: 81 },
  { date: "2024-05-23", price: 252 },
  { date: "2024-05-24", price: 294 },
  { date: "2024-05-25", price: 201 },
  { date: "2024-05-26", price: 213 },
  { date: "2024-05-27", price: 420 },
  { date: "2024-05-28", price: 233 },
  { date: "2024-05-29", price: 78 },
  { date: "2024-05-30", price: 340 },
  { date: "2024-05-31", price: 178 },
  { date: "2024-06-01", price: 178 },
  { date: "2024-06-02", price: 470 },
  { date: "2024-06-03", price: 103 },
  { date: "2024-06-04", price: 439 },
  { date: "2024-06-05", price: 88 },
  { date: "2024-06-06", price: 294 },
  { date: "2024-06-07", price: 323 },
  { date: "2024-06-08", price: 385 },
  { date: "2024-06-09", price: 438 },
  { date: "2024-06-10", price: 155 },
  { date: "2024-06-11", price: 92 },
  { date: "2024-06-12", price: 492 },
  { date: "2024-06-13", price: 81 },
  { date: "2024-06-14", price: 426 },
  { date: "2024-06-15", price: 307 },
  { date: "2024-06-16", price: 371 },
  { date: "2024-06-17", price: 475 },
  { date: "2024-06-18", price: 107 },
  { date: "2024-06-19", price: 341 },
  { date: "2024-06-20", price: 408 },
  { date: "2024-06-21", price: 169 },
  { date: "2024-06-22", price: 317 },
  { date: "2024-06-23", price: 480 },
  { date: "2024-06-24", price: 132 },
  { date: "2024-06-25", price: 141 },
  { date: "2024-06-26", price: 434 },
  { date: "2024-06-27", price: 448 },
  { date: "2024-06-28", price: 149 },
  { date: "2024-06-29", price: 103 },
  { date: "2024-06-30", price: 446 },
]
const chartConfig = {
  intervals: {
    label: "Intervals",
  },
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type ChartData = { date: string; price: number }

interface PriceTrendProps {
  symbol?: string;
}

const PriceTrend: React.FC<PriceTrendProps> = ({ symbol }) => {
  const [days, setDays] = React.useState(0);
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  React.useEffect(() => {
    setChartData(chartDataTest);
    // const fetchData = async () => {
    //   fetch(`/api/stocks/chart?symbol=${symbol}&days=${days}`, {
    //     method: 'GET',
    //   })
    //   .then(response => response.json())
    //   .then(data => {
    //     setChartData(data);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching chart data:', error);
    //   });
    // };
    // fetchData();
  }, [symbol, days]);
  return (
    <>
      <Tabs defaultValue="live" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="live" onClick={() => setDays(0)}>Live</TabsTrigger>
          <TabsTrigger value="day" onClick={() => setDays(1)}>1D</TabsTrigger>
          <TabsTrigger value="week" onClick={() => setDays(7)}>1W</TabsTrigger>
          <TabsTrigger value="month" onClick={() => setDays(30)}>1M</TabsTrigger>
          <TabsTrigger value="year" onClick={() => setDays(365)}>1Y</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          View live data here.
        </TabsContent>
        <TabsContent value="day">
          View data for the last 24 hours.
        </TabsContent>
        <TabsContent value="week">
          View data for the last 7 days.
        </TabsContent>
        <TabsContent value="month">
          View data for the last 30 days.
        </TabsContent>
        <TabsContent value="year">
          View data for the last 12 months.
        </TabsContent>
      </Tabs>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full"
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="price"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
              />
            }
          />
          <Line
            dataKey="price"
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </>
  )
}

export default PriceTrend
