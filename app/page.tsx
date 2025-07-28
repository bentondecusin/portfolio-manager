import StockList from "./components/StockList";
import PriceTrend from "./components/PriceTrend";
import PortfolioList from "./components/PortfolioList";


export default function Home() {
  return (
    <div>
      <div className="container mx-auto p-4 flex">
        <div className="w-1/2 pr-2">
          <PriceTrend />
        </div>
        <div className="w-1/2 pl-2">
          <StockList />
        </div>
      </div>
      <div className="container mx-auto p-4">
        <PortfolioList />
      </div>
    </div>
  );
}
