-- Price data tables for Alpha Vantage integration
USE DB_portfolio;
-- USE neueda;

-- House-keeping --
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist --
DROP TABLE IF EXISTS asset_prices_intraday;
DROP TABLE IF EXISTS asset_prices_daily;
DROP TABLE IF EXISTS asset_quotes_live;

-- =====================================================================
-- Live Quotes Table (Real-time/current data)
-- =====================================================================
CREATE TABLE IF NOT EXISTS asset_quotes_live (
  id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol             VARCHAR(16) NOT NULL,
  open_price         DECIMAL(12,4) NOT NULL,
  high_price         DECIMAL(12,4) NOT NULL,
  low_price          DECIMAL(12,4) NOT NULL,
  current_price      DECIMAL(12,4) NOT NULL,
  volume             BIGINT NOT NULL,
  latest_trading_day DATE NOT NULL,
  previous_close     DECIMAL(12,4) NOT NULL,
  change_amount      DECIMAL(12,4) NOT NULL,
  change_percent     VARCHAR(16) NOT NULL,
  last_updated       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_symbol (symbol),
  INDEX idx_symbol_updated (symbol, last_updated),
  INDEX idx_trading_day (latest_trading_day)
) ENGINE=InnoDB;

-- =====================================================================
-- Daily Price History Table
-- =====================================================================
CREATE TABLE IF NOT EXISTS asset_prices_daily (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol        VARCHAR(16) NOT NULL,
  price_date    DATE NOT NULL,
  open_price    DECIMAL(12,4) NOT NULL,
  high_price    DECIMAL(12,4) NOT NULL,
  low_price     DECIMAL(12,4) NOT NULL,
  close_price   DECIMAL(12,4) NOT NULL,
  volume        BIGINT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_symbol_date (symbol, price_date),
  INDEX idx_symbol_date_range (symbol, price_date),
  INDEX idx_date (price_date)
) ENGINE=InnoDB;

-- =====================================================================
-- Intraday Price History Table (5-minute intervals)
-- =====================================================================
CREATE TABLE IF NOT EXISTS asset_prices_intraday (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol        VARCHAR(16) NOT NULL,
  price_datetime DATETIME NOT NULL,
  open_price    DECIMAL(12,4) NOT NULL,
  high_price    DECIMAL(12,4) NOT NULL,
  low_price     DECIMAL(12,4) NOT NULL,
  close_price   DECIMAL(12,4) NOT NULL,
  volume        BIGINT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_symbol_datetime (symbol, price_datetime),
  INDEX idx_symbol_datetime_range (symbol, price_datetime),
  INDEX idx_datetime (price_datetime)
) ENGINE=InnoDB;

-- -- =====================================================================
-- -- Asset Metadata Table (Optional - for caching symbol info)
-- -- =====================================================================
-- CREATE TABLE IF NOT EXISTS asset_metadata (
--   id            BIGINT PRIMARY KEY AUTO_INCREMENT,
--   symbol        VARCHAR(16) NOT NULL,
--   company_name  VARCHAR(255),
--   exchange      VARCHAR(64),
--   currency      VARCHAR(8) DEFAULT 'USD',
--   sector        VARCHAR(128),
--   industry      VARCHAR(128),
--   market_cap    BIGINT,
--   is_active     BOOLEAN DEFAULT TRUE,
--   last_fetched  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
--   UNIQUE KEY uk_symbol (symbol),
--   INDEX idx_active (is_active),
--   INDEX idx_sector (sector),
--   INDEX idx_industry (industry)
-- ) ENGINE=InnoDB;

-- -- =====================================================================
-- -- Data Fetch Log Table (Track API calls and prevent rate limiting)
-- -- =====================================================================
-- CREATE TABLE IF NOT EXISTS api_fetch_log (
--   id            BIGINT PRIMARY KEY AUTO_INCREMENT,
--   symbol        VARCHAR(16) NOT NULL,
--   fetch_type    ENUM('live', 'daily', 'intraday') NOT NULL,
--   api_function  VARCHAR(64) NOT NULL,  -- e.g., 'GLOBAL_QUOTE', 'TIME_SERIES_DAILY'
--   status        ENUM('success', 'error', 'rate_limited') NOT NULL,
--   records_count INT DEFAULT 0,
--   error_message TEXT,
--   fetch_time_ms INT,  -- Track API response time
--   created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
--   INDEX idx_symbol_type_date (symbol, fetch_type, created_at),
--   INDEX idx_status_date (status, created_at),
--   INDEX idx_api_function (api_function)
-- ) ENGINE=InnoDB;

-- Restore FK checks --
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- =====================================================================
-- Sample Queries for Testing
-- =====================================================================

-- Get latest live quote for a symbol
-- SELECT * FROM asset_quotes_live WHERE symbol = 'AAPL';

-- Get daily prices for last 30 days
-- SELECT * FROM asset_prices_daily 
-- WHERE symbol = 'AAPL' 
--   AND price_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- ORDER BY price_date DESC;

-- Get intraday prices for today
-- SELECT * FROM asset_prices_intraday 
-- WHERE symbol = 'AAPL' 
--   AND DATE(price_datetime) = CURDATE()
-- ORDER BY price_datetime DESC;

-- Check API call rate for today
-- SELECT fetch_type, COUNT(*) as calls, 
--        AVG(fetch_time_ms) as avg_time_ms,
--        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
-- FROM api_fetch_log 
-- WHERE DATE(created_at) = CURDATE()
-- GROUP BY fetch_type;
