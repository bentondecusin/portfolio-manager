# Portfolio Manager API Documentation

## Overview

This document provides a comprehensive guide to all available APIs in the Portfolio Manager system. The APIs are organized by feature modules and include detailed descriptions, parameters, and usage examples.

---

## 🏗️ **Asset Management**

_Base URL: `/assets`_

### Get Live Asset Quote

```http
GET /assets/:symbol/live
```

**Description:** Get live quote for a specific asset symbol (from database with API fallback)

**Parameters:**

- `symbol` (path): Asset symbol (e.g., AAPL, GOOGL)

**Response:**

```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "volume": 1234567,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### Get All Live Asset Quotes

```http
GET /assets/live
```

**Description:** Get live quotes for all assets in the system

**Response:**

```json
[
  {
    "symbol": "AAPL",
    "price": 150.25,
    "volume": 1234567,
    "last_updated": "2024-01-15T10:30:00Z"
  },
  {
    "symbol": "GOOGL",
    "price": 2750.5,
    "volume": 987654,
    "last_updated": "2024-01-15T10:30:00Z"
  }
]
```

### Get Asset Historical Data

```http
GET /assets/:symbol/history
```

**Description:** Get historical price data for a specific asset

**Parameters:**

- `symbol` (path): Asset symbol
- `type` (query): `intraday` | `daily` (default: `daily`)
- `range` (query): `week` | `month` (default: `month`)

**Examples:**

```http
GET /assets/AAPL/history?type=intraday
GET /assets/AAPL/history?type=daily&range=week
GET /assets/AAPL/history?type=daily&range=month
```

**Response:**

```json
[
  {
    "date": "2024-01-15",
    "open": 149.5,
    "high": 151.2,
    "low": 148.8,
    "close": 150.25,
    "volume": 1234567
  }
]
```

### Sync Asset Data

```http
GET /assets/:symbol/sync
```

**Description:** Manually sync asset data for a specific symbol

**Parameters:**

- `symbol` (path): Asset symbol
- `type` (query): `live` | `daily` (optional)

**Examples:**

```http
GET /assets/AAPL/sync
GET /assets/AAPL/sync?type=live
GET /assets/AAPL/sync?type=daily
```

### Asset Health Check

```http
GET /assets/health
```

**Description:** Health check endpoint for asset service

---

## 💰 **Transaction Management**

_Base URL: `/transactions`_

### Get All Transactions

```http
GET /transactions
```

**Description:** Get all transactions in the system

**Response:**

```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "txnType": "buy",
    "quantity": 10,
    "price": 150.25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

### Get Transaction by ID

```http
GET /transactions/:id
```

**Description:** Get a specific transaction by its ID

**Parameters:**

- `id` (path): Transaction ID

### Get Transactions by Symbol

```http
GET /transactions/symbol/:symbol
```

**Description:** Get all transactions for a specific asset symbol

**Parameters:**

- `symbol` (path): Asset symbol

### Get Transactions by Date

```http
GET /transactions/date/:date
```

**Description:** Get all transactions for a specific date

**Parameters:**

- `date` (path): Date in YYYY-MM-DD format

### Create Transaction

```http
POST /transactions
```

**Description:** Create a new transaction

**Request Body:**

```json
{
  "symbol": "AAPL",
  "txnType": "buy",
  "quantity": 10,
  "price": 150.25
}
```

**Parameters:**

- `symbol` (required): Asset symbol
- `txnType` (required): `buy` | `sell`
- `quantity` (required): Positive number
- `price` (required): Positive number

**Response:**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transactionId": 123,
  "data": {
    "id": 123,
    "symbol": "AAPL",
    "txnType": "buy",
    "quantity": 10,
    "price": 150.25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Update Transaction

```http
PUT /transactions/:id
```

**Description:** Update an existing transaction by ID

**Parameters:**

- `id` (path): Transaction ID

### Delete Transaction

```http
DELETE /transactions/:id
```

**Description:** Delete a transaction by ID

**Parameters:**

- `id` (path): Transaction ID

---

## 📊 **Portfolio Holdings**

_Base URL: `/holdings`_

### Get All Holdings

```http
GET /holdings
```

**Description:** Get all current holdings in the portfolio

**Response:**

```json
[
  {
    "symbol": "AAPL",
    "quantity": 50,
    "averagePrice": 145.3,
    "currentPrice": 150.25,
    "totalValue": 7512.5,
    "unrealizedGainLoss": 247.5
  }
]
```

### Get Holding by Symbol

```http
GET /holdings/symbol/:symbol
```

**Description:** Get holding information for a specific asset symbol

**Parameters:**

- `symbol` (path): Asset symbol

### Get Holding Value by Symbol

```http
GET /holdings/value/:symbol
```

**Description:** Get the current value and return of a specific holding

**Parameters:**

- `symbol` (path): Asset symbol

**Response:**

```json
{
  "symbol": "AAPL",
  "quantity": 50,
  "currentValue": 7512.5,
  "unrealizedGainLoss": 247.5,
  "returnPercentage": 3.4
}
```

### Get Total Portfolio Value

```http
GET /holdings/value
```

**Description:** Get the total portfolio value and overall return

**Response:**

```json
{
  "totalValue": 25000.0,
  "totalUnrealizedGainLoss": 1250.0,
  "totalReturnPercentage": 5.3,
  "cashBalance": 5000.0
}
```

---

## 💵 **Cash Balance Management**

_Base URL: `/balance`_

### Get Cash Balance

```http
GET /balance
```

**Description:** Get current cash balance in the account

**Response:**

```json
{
  "symbol": "USD",
  "balance": 5000.0
}
```

### Top Up Cash Balance

```http
PUT /balance
```

**Description:** Top up cash balance

**Request Body:**

```json
{
  "amount": 1000.0
}
```

**Parameters:**

- `amount` (required): Positive number

**Response:**

```json
{
  "message": "Cash topped up",
  "txn": {
    "id": 456,
    "type": "topup",
    "amount": 1000.0,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🤖 **AI Assistant**

_Base URL: `/ai`_

### AI Chat

```http
POST /ai/chat
```

**Description:** Send a natural language query to the AI assistant

**Features:**

- Natural language queries about stocks/assets
- Automatic function calling for live and historical data
- Integration with Google Gemini AI

**Request Body:**

```json
{
  "message": "What's the current price of AAPL?"
}
```

**Parameters:**

- `message` (required): Natural language query

**Response:**

```json
{
  "response": "The current price of AAPL is $150.25, which is up 2.3% from yesterday's close.",
  "data": {
    "symbol": "AAPL",
    "price": 150.25,
    "change": 3.45,
    "changePercent": 2.3
  }
}
```

### AI Health Check

```http
GET /ai/health
```

**Description:** Health check endpoint for AI service

---

## 🔧 **Error Handling**

### Common Error Responses

**400 Bad Request:**

```json
{
  "error": "Missing required fields. Please provide symbol, txnType, quantity, and price"
}
```

**404 Not Found:**

```json
{
  "error": "No live quote found for AAPL"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal Server Error"
}
```

### Transaction-Specific Errors

**Insufficient Balance:**

```json
{
  "error": "Insufficient cash balance for this transaction",
  "type": "INSUFFICIENT_BALANCE"
}
```

**Insufficient Holdings:**

```json
{
  "error": "Insufficient holdings to sell 100 shares of AAPL",
  "type": "INSUFFICIENT_HOLDINGS"
}
```

---

## 📋 **API Features Summary**

### **Core Features:**

1. **Real-time Asset Data**: Live quotes and historical price data with database caching
2. **Portfolio Management**: Complete transaction tracking and holding calculations
3. **Cash Management**: Balance tracking and top-up functionality
4. **AI Integration**: Natural language queries with automatic data fetching
5. **Data Synchronization**: Manual sync capabilities for asset data

### **Data Sources:**

- **Live Quotes**: Database with API fallback (Alpha Vantage)
- **Historical Data**: Intraday (5-minute) and daily price data
- **Portfolio Data**: Local database with real-time calculations

### **Authentication & Security:**

- CORS enabled for cross-origin requests
- Input validation for all endpoints
- Graceful error handling with appropriate HTTP status codes

---

## 🚀 **Getting Started**

### Base URL

```
http://localhost:3000
```

### Example Usage

```bash
# Get live quote for AAPL
curl http://localhost:3000/assets/AAPL/live

# Create a buy transaction
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","txnType":"buy","quantity":10,"price":150.25}'

# Get portfolio holdings
curl http://localhost:3000/holdings

# Ask AI about a stock
curl -X POST http://localhost:3000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the current price of AAPL?"}'
```

---

_Last updated: January 2024_
