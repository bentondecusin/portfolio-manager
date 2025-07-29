// Finnhub API service
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';

if (!API_KEY) {
  console.warn('Finnhub API key not found. Please set FINNHUB_API_KEY in your environment variables.');
}

class FinnhubAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = FINNHUB_BASE_URL;
  }

  private async request(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key as token parameter
    url.searchParams.append('token', this.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
        console.log('Finnhub API request URL:', url.toString());
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Finnhub API request failed:', error);
      throw error;
    }
  }

  // Get real-time quote for a symbol
  async getQuote(symbol: string) {
    return this.request('/quote', { symbol });
  }

  // Get stock candles (OHLC data)
  async getStockCandles(symbol: string, resolution: string, from: number, to: number) {
    return this.request('/stock/candle', {
      symbol,
      resolution,
      from: from.toString(),
      to: to.toString(),
    });
  }

  // Search for stocks
  async searchSymbols(query: string) {
    return this.request('/search', { q: query });
  }

  async getAllSymbols() {
    return this.request('/stock/symbol', { exchange: 'US' });
  }
}

export const finnhubAPI = new FinnhubAPI();

// Type definitions for common responses
export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp of the quote
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface StockCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volume
}
