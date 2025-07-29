import { useState, useEffect } from 'react';
import { finnhubAPI, StockQuote } from '@/lib/finnhub';

export const useStockQuote = (symbol: string) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await finnhubAPI.getQuote(symbol);
        setQuote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();

    const interval = setInterval(fetchQuote, 1000); // Update every second

    return () => clearInterval(interval);
  }, [symbol]);

  return { quote, loading, error };
};

export const useMultipleStockQuotes = (symbols: string[]) => {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbols.length) return;

    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = symbols.map(async (symbol) => {
          const quote = await finnhubAPI.getQuote(symbol);
          console.log(`Fetched quote for ${symbol}:`, quote);
          return { symbol, quote };
        });

        const results = await Promise.all(promises);
        const quotesMap = results.reduce((acc, { symbol, quote }) => {
          acc[symbol] = quote;
          return acc;
        }, {} as Record<string, StockQuote>);

        setQuotes(quotesMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    
    const interval = setInterval(fetchQuotes, 30000); // Update every second

    return () => clearInterval(interval);
  }, [symbols]);

  return { quotes, loading, error };
};

export const useStockSymbols = (limit: number) => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSymbols = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await finnhubAPI.getAllSymbols();
        const stockSymbols = data.filter((symbol: any) => symbol.type === 'Common Stock').map((symbol: any) => symbol.symbol);
        console.log('Fetched symbols:', stockSymbols.slice(0, limit));
        setSymbols(stockSymbols.slice(0, limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch symbols');
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  return { symbols, loading, error };
}
