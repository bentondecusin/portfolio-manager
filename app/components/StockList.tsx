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
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import TableWrapper from "../table_wrapper";
import TradeButton from "./TradeButton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type StockListProps = {
  setIsModalOpen: (open: boolean) => void;
  setTrendSymbol: (symbol: string) => void;
  setPreTradeSymbol: (symbol: string) => void;
};

const StockList: React.FC<StockListProps> = ({
  setIsModalOpen,
  setTrendSymbol,
  setPreTradeSymbol,
}) => {
  const { data, error, isLoading } = useSWR(
    `http://localhost:8080/assets/live`,
    fetcher
  );
  let mkt_prix = data;
  console.log("mkt_prix", mkt_prix);
  if (error) console.error(error);

  return (
    <div>
      <h2>Market Watchlist</h2>
      {isLoading && <div>Loading</div>}
      {error && (
        <div className="text-red-500">
          Error loading market data. Please try again later.
        </div>
      )}
      {data && Array.isArray(mkt_prix) && (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Market Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Change Pct</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mkt_prix.map((stock, idx) => (
                <TableRow
                  key={idx + stock.symbol}
                  onClick={() => {
                    setTrendSymbol(stock.symbol);
                  }}
                >
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>
                    ${parseFloat(stock.current_price).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={
                      parseFloat(stock.change_amount) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stock.change_amount}
                  </TableCell>
                  <TableCell
                    className={
                      parseFloat(stock.change_percent) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stock.change_percent}
                  </TableCell>
                  <TableCell className="text-right">
                    <TradeButton
                      symbol={stock.symbol}
                      setIsModalOpen={setIsModalOpen}
                      setPreTradeSymbol={setPreTradeSymbol}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}
      {data && !Array.isArray(mkt_prix) && (
        <div className="text-yellow-600">
          Unexpected data format. Expected array, got: {typeof mkt_prix}
        </div>
      )}
    </div>
  );
};

export default StockList;
