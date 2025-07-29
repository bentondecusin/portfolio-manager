import { Button } from "@/components/ui/button";
const TradeButton = ({ setIsModalOpen, setPreTradeSymbol, symbol }) => {
  return (
    <Button
      onClick={() => {
        setIsModalOpen(true);
        setPreTradeSymbol(symbol);
      }}
      name="close"
      className="px-4 py-2 text-white rounded-xl cursor-pointer hover:bg-blue-950"
    >
      Trade
    </Button>
  );
};
export default TradeButton;
