// Finnhub API service
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || '';

if (!API_KEY) {
  console.warn('Finnhub API key not found. Please set FINNHUB_API_KEY in your environment variables.');
}

class FinnhubAPI {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = FINNHUB_BASE_URL;
  }

  async request(endpoint, params = {}) {
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

/**
 * @typedef {Object} StockQuote
 * Represents a real-time stock quote from Finnhub.
 * @property {number} c - Current price
 * @property {number} d - Absolute price change since previous close
 * @property {number} dp - Percentage price change since previous close
 * @property {number} h - Highest price of the current day
 * @property {number} l - Lowest price of the current day
 * @property {number} o - Opening price of the current day
 * @property {number} pc - Previous closing price
 * @property {number} t - UNIX timestamp of the quote (in seconds)
 */
  async getQuote(symbol) {
    return this.request('/quote', { symbol });
  }

/**
 * @typedef {Object} SymbolInfo
 * Represents a stock symbol returned by Finnhub.
 * @property {string} currency - Trading currency (e.g., "USD")
 * @property {string} description - Company or instrument description
 * @property {string} displaySymbol - Display symbol (e.g., "PLSH")
 * @property {string} figi - Financial Instrument Global Identifier
 * @property {string|null} isin - International Securities Identification Number
 * @property {string} mic - Market Identifier Code
 * @property {string} shareClassFIGI - Share class FIGI
 * @property {string} symbol - Trading symbol (e.g., "PLSH")
 * @property {string} symbol2 - Secondary symbol (may be empty)
 * @property {string} type - Instrument type (e.g., "Common Stock")
 */
  async searchSymbols(query) {
    return this.request('/search', { q: query });
  }

  async getAllSymbols() {
    return this.request('/stock/symbol', { exchange: 'US' });
  }
}

const finnhubAPI = new FinnhubAPI();

module.exports = { finnhubAPI };