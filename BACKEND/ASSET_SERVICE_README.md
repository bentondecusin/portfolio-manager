# Asset Service - Database Integration

This update transforms the portfolio manager to use a database-first approach for asset price data, with periodic fetching from Alpha Vantage API.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  assetController │───▶│    Database     │
│  (PriceTrend)   │    │   (v2 - DB)      │    │   Price Tables  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▲                        ▲
                                │                        │
                       ┌────────┴────────┐               │
                       │  assetService   │───────────────┘
                       │ (Periodic Sync) │
                       └─────────────────┘
                                ▲
                                │
                       ┌────────┴────────┐
                       │ Alpha Vantage   │
                       │     API         │
                       └─────────────────┘
```

## 📊 Database Tables

### Core Data Tables
- **`asset_quotes_live`** - Real-time stock quotes (one row per symbol)
- **`asset_prices_daily`** - Daily OHLCV data (historical)
- **`asset_prices_intraday`** - 5-minute interval data
- **`asset_metadata`** - Symbol information cache
- **`api_fetch_log`** - API usage tracking & rate limiting

## 🚀 Setup Instructions

### 1. Database Setup
```bash
cd BACKEND
./setup_db.sh
```
*This will create all necessary tables*

### 2. Environment Variables
Make sure your `.env` includes:
```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
```

### 3. Start the Server
```bash
npm start
```
*The asset service will start automatically and sync data every 5 minutes*

## 📡 API Endpoints

### Updated Endpoints (Database-First)
- `GET /assets/:symbol/live` - Live quote (from DB + API fallback)
- `GET /assets/:symbol/history` - Historical data (from DB + API fallback)

### New Management Endpoints
- `GET /assets/:symbol/sync` - Manual sync for specific symbol
- `GET /assets/:symbol/sync?type=live` - Sync only live data
- `GET /assets/:symbol/sync?type=daily` - Sync only daily data
- `GET /assets/health` - Service health check

## 🔄 How It Works

### 1. Periodic Sync (Automatic)
- **Frequency**: Every 5 minutes
- **Symbols**: All symbols from `transactions` table
- **Rate Limiting**: 15-second delays between API calls
- **Daily History**: Fetched once per day (00:00-00:30)

### 2. Smart Caching
- **Live Quotes**: Fresh for 5 minutes
- **Historical Data**: Cached indefinitely
- **Fallback**: Stale data served if API fails

### 3. Rate Limit Protection
- **Daily Limit**: 20 calls per symbol per type
- **Monitoring**: All API calls logged
- **Status Tracking**: Success/error/rate-limited

## 🧪 Testing

### Test the Service
```bash
node test_asset_service.js
```

### Full Sync (Manual)
```bash
node test_asset_service.js --full-sync
```

### Check Service Health
```bash
curl http://localhost:8080/assets/health
```

## 📈 Benefits

✅ **Faster Response Times** - Data served from database  
✅ **Reduced API Costs** - Periodic fetching vs real-time calls  
✅ **Better Reliability** - Fallback to cached data if API fails  
✅ **Rate Limit Protection** - Intelligent API usage tracking  
✅ **Data Persistence** - Historical data preserved  
✅ **Monitoring** - Full audit trail of API calls  

## 🔧 Configuration

### Sync Frequency
Edit `assetService.js` line 340:
```javascript
setInterval(syncAllSymbolsData, 300000); // 5 minutes = 300000ms
```

### Data Freshness
Edit `assetController_v2.js` line 25:
```javascript
const maxAge = 5 * 60 * 1000; // 5 minutes
```

### Rate Limits
Edit `assetService.js` line 49:
```javascript
if (dailyCount >= 20) { // 20 calls per day per symbol
```

## 🚨 Migration Notes

### Old vs New Controller
- **Old**: `assetController.js` - Direct API calls
- **New**: `assetController_v2.js` - Database-first approach

### Route Changes
Updated `assetRoute.js` to use the new controller and added management endpoints.

### Frontend Compatibility
The frontend `PriceTrend.tsx` component works unchanged - same API response format.

## 📝 Monitoring & Troubleshooting

### Check Recent API Calls
```sql
SELECT * FROM api_fetch_log 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;
```

### Check Data Coverage
```sql
SELECT symbol, 
       COUNT(*) as daily_records,
       MIN(price_date) as earliest,
       MAX(price_date) as latest
FROM asset_prices_daily 
GROUP BY symbol;
```

### View Live Quote Status
```sql
SELECT symbol, 
       current_price,
       TIMESTAMPDIFF(MINUTE, last_updated, NOW()) as age_minutes
FROM asset_quotes_live
ORDER BY age_minutes DESC;
```
