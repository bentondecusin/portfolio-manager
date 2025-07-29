CREATE DATABASE IF NOT EXISTS DB_portfolio;
USE DB_portfolio;

-- House‑keeping --
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS transactions;

-- Immutable transaction ledger --
CREATE TABLE IF NOT EXISTS transactions (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol   VARCHAR(16)  NOT NULL,
  tick_name VARCHAR(64) NOT NULL,           -- pulled from yfinance at insert time
  txn_type VARCHAR(10) NOT NULL, -- 'Buy' or 'Sell'
  quantity DECIMAL NOT NULL,          -- shares
  price    DECIMAL NOT NULL,          -- execution price
  txn_ts   DATETIME      NOT NULL,
  INDEX idx_symbol_ts (symbol, txn_ts)      -- fast range & aggregation queries
) ENGINE=InnoDB;

-- Restore FK checks --
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- #####################################################################
-- Seed (dummy) data – small realistic sample
-- #####################################################################
INSERT INTO transactions
        (symbol, tick_name, txn_type, quantity, price,  txn_ts)
VALUES
  -- AAPL — two buys, one sell
  ('AAPL',  'Apple Inc.',            'Buy',  25, 172.45, '2025-06-03 14:31:00'),
  ('AAPL',  'Apple Inc.',            'Buy',  10, 180.10, '2025-06-21 15:05:00'),
  ('AAPL',  'Apple Inc.',            'Sell',  5, 189.50, '2025-07-10 10:42:00'),

  -- MSFT
  ('MSFT',  'Microsoft Corporation', 'Buy',  18, 415.80, '2025-06-05 09:45:00'),
  ('MSFT',  'Microsoft Corporation', 'Buy',  12, 428.20, '2025-07-02 13:20:00'),

  -- NVDA
  ('NVDA',  'NVIDIA Corporation',    'Buy',  6,  123.70, '2025-06-07 11:15:00'),
  ('NVDA',  'NVIDIA Corporation',    'Sell', 2,  138.95, '2025-07-15 14:10:00'),

  -- AMZN
  ('AMZN',  'Amazon.com Inc.',       'Buy',  4,  184.30, '2025-06-10 10:00:00'),
  ('AMZN',  'Amazon.com Inc.',       'Buy',  3,  192.15, '2025-07-01 16:25:00'),
  ('AMZN',  'Amazon.com Inc.',       'Sell', 1,  199.40, '2025-07-18 11:08:00'),

  -- GOOGL
  ('GOOGL', 'Alphabet Inc.-Class A', 'Buy',  7,  145.60, '2025-06-12 14:55:00'),
  ('GOOGL', 'Alphabet Inc.-Class A', 'Buy',  5,  151.25, '2025-06-28 09:37:00'),

  -- TSLA
  ('TSLA',  'Tesla Inc.',            'Buy',  8,  242.80, '2025-06-15 15:12:00'),
  ('TSLA',  'Tesla Inc.',            'Sell', 3,  256.75, '2025-07-12 10:50:00'),

  -- JPM
  ('JPM',   'JPMorgan Chase & Co.',  'Buy',  20, 195.10, '2025-06-18 13:03:00'),
  ('JPM',   'JPMorgan Chase & Co.',  'Buy',  15, 199.25, '2025-07-03 12:44:00'),

  -- NFLX
  ('NFLX',  'Netflix Inc.',          'Buy',   5, 649.50, '2025-06-20 11:28:00'),
  ('NFLX',  'Netflix Inc.',          'Sell',  2, 678.85, '2025-07-14 09:59:00'),

  -- Extra diversity
  ('KO',    'Coca-Cola Company',     'Buy',  30, 63.40,  '2025-06-24 14:17:00'),
  ('KO',    'Coca-Cola Company',     'Sell', 10, 67.05,  '2025-07-09 15:33:00');

-- Quick sanity query
-- SELECT * FROM v_holding_live ORDER BY market_value DESC;