# Portfolio Manager - Simplified Architecture

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React + TypeScript + Tailwind CSS)          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ StockList   │ │ PriceTrend  │ │PortfolioList│ │TradeWindow  │ │
│  │ (Watchlist) │ │ (Charts)    │ │ (Holdings)  │ │ (Buy/Sell)  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │AccountCard  │ │Transaction  │ │   ChatBot   │ │   Navbar    │ │
│  │ (Balance)   │ │  History    │ │   (AI)      │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes                    Express Backend (8080)  │
│  ┌─────────────┐ ┌─────────────┐      ┌─────────────────────┐  │
│  │ /api/assets │ │/api/trans   │ ────▶ │ /assets             │  │
│  │ (Neon DB)   │ │  actions    │      │ /transactions       │  │
│  └─────────────┘ └─────────────┘      │ /holdings           │  │
│                                       │ /balance            │  │
│                                       │ /ai                 │  │
│                                       └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                    ┌─────────────────┐    │
│  │ Alpha Vantage   │                    │   Google GenAI  │    │
│  │   API           │                    │   (Chat AI)     │    │
│  │ • Live Quotes   │                    │ • Investment    │    │
│  │ • Historical    │                    │   Advice        │    │
│  │   Data          │                    │ • Portfolio     │    │
│  │ • Time Series   │                    │   Analysis      │    │
│  └─────────────────┘                    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐ ┌─────────────────────┐   │
│  │        MySQL Database           │ │   Neon PostgreSQL   │   │
│  │      (DB_portfolio)             │ │                     │   │
│  │  ┌─────────────────────────┐    │ │  ┌─────────────┐    │   │
│  │  │ transactions            │    │ │  │ assets      │    │   │
│  │  │ holdings                │    │ │  │ (metadata)  │    │   │
│  │  │ asset_quotes_live       │    │ │  │ (history)   │    │   │
│  │  │ asset_prices_daily      │    │ │  └─────────────┘    │   │
│  │  │ asset_prices_intraday   │    │ │                     │   │
│  │  └─────────────────────────┘    │ │                     │   │
│  └─────────────────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Data Flows

### 1. Stock Data Flow

```
Alpha Vantage API → Asset Service → MySQL Database → Frontend Components
```

### 2. Transaction Flow

```
User Input → TradeWindow → Backend Validation → Database Triggers → Holdings Update
```

### 3. AI Chat Flow

```
User Query → ChatBot → Google GenAI → Investment Advice → User Interface
```

## Technology Stack Summary

| Layer                | Technology                               | Purpose                                 |
| -------------------- | ---------------------------------------- | --------------------------------------- |
| **Frontend**         | Next.js 15.4.4, React 19.1.0, TypeScript | User interface and interactions         |
| **Styling**          | Tailwind CSS, Radix UI                   | Modern, responsive design               |
| **Backend**          | Node.js, Express.js                      | API server and business logic           |
| **Primary DB**       | MySQL                                    | Transaction data, holdings, live quotes |
| **Secondary DB**     | Neon PostgreSQL                          | Asset metadata and historical data      |
| **External APIs**    | Alpha Vantage, Google GenAI              | Stock data and AI assistance            |
| **Charts**           | Recharts                                 | Interactive price visualization         |
| **State Management** | SWR, React hooks                         | Data fetching and caching               |

## System Features

✅ **Real-time Stock Data** - Live quotes and historical prices  
✅ **Portfolio Management** - Buy/sell transactions with validation  
✅ **Interactive Charts** - Price trends and analysis  
✅ **AI Chat Assistant** - Investment advice and portfolio insights  
✅ **Transaction History** - Complete audit trail  
✅ **Account Balance** - Real-time balance tracking  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Data Validation** - Prevents overselling and maintains integrity
