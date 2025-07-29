CREATE DATABASE IF NOT EXISTS portfolio;
USE portfolio;

-- House‑keeping --
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing objects (if any) --
DROP TABLE IF EXISTS portfolio_snapshot;
DROP TABLE IF EXISTS price_eod;
DROP TABLE IF EXISTS price_tick;
DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS holding;
DROP TABLE IF EXISTS asset;

-- Core reference table --
CREATE TABLE IF NOT EXISTS asset (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol    VARCHAR(16)  NOT NULL UNIQUE,
  name      VARCHAR(64)  NOT NULL,
  type      ENUM ('STOCK','BOND','CASH','ETF','CRYPTO') NOT NULL,
  currency  CHAR(3)      NOT NULL DEFAULT 'USD'
) ENGINE = InnoDB;

-- Current positions --
CREATE TABLE IF NOT EXISTS holding (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id    BIGINT       NOT NULL,
  quantity    DECIMAL(20,6) NOT NULL,
  avg_cost    DECIMAL(18,4) NOT NULL,      -- price per unit
  opened_ts   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_holding_asset FOREIGN KEY (asset_id) REFERENCES asset(id)
) ENGINE = InnoDB;

-- Immutable transaction ledger --
CREATE TABLE IF NOT EXISTS transaction (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id  BIGINT       NOT NULL,
  txn_type  ENUM('BUY','SELL','DEPOSIT','WITHDRAW') NOT NULL,
  quantity  DECIMAL(20,6) NOT NULL,
  price     DECIMAL(18,4) NOT NULL,         -- unit price or cash amount
  txn_ts    DATETIME     NOT NULL,
  CONSTRAINT fk_txn_asset FOREIGN KEY (asset_id) REFERENCES asset(id),
  INDEX idx_txn_asset_ts (asset_id, txn_ts)
) ENGINE = InnoDB;

--  Intraday quotes (tick/minute bars) --
CREATE TABLE IF NOT EXISTS price_tick (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_id   BIGINT      NOT NULL,
  price_ts   DATETIME    NOT NULL,
  last_price DECIMAL(18,4) NOT NULL,
  source     VARCHAR(32) NOT NULL DEFAULT 'iex',
  CONSTRAINT fk_tick_asset FOREIGN KEY (asset_id) REFERENCES asset(id),
  INDEX idx_tick_asset_ts (asset_id, price_ts)
) ENGINE = InnoDB;

-- End‑of‑day close prices --
CREATE TABLE IF NOT EXISTS price_eod (
  asset_id    BIGINT      NOT NULL,
  price_date  DATE        NOT NULL,
  close_price DECIMAL(18,4) NOT NULL,
  PRIMARY KEY (asset_id, price_date),
  CONSTRAINT fk_eod_asset FOREIGN KEY (asset_id) REFERENCES asset(id)
) ENGINE = InnoDB;

-- Cached portfolio valuations (optional) --
CREATE TABLE IF NOT EXISTS portfolio_snapshot (
  snapshot_ts DATETIME PRIMARY KEY,
  total_value DECIMAL(20,2) NOT NULL,
  total_cost  DECIMAL(20,2) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- Restore FK checks --
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- #####################################################################
-- Seed (dummy) data – small realistic sample
-- #####################################################################
INSERT IGNORE INTO asset (symbol, name, type, currency) VALUES
  ('AAPL', 'Apple Inc.', 'STOCK', 'USD'),
  ('MSFT', 'Microsoft Corp.', 'STOCK', 'USD'),
  ('BND',  'Vanguard Total Bond ETF', 'BOND', 'USD'),
  ('CASH', 'US Dollars', 'CASH', 'USD');

-- 🇸🇬  Assume script run on 2025‑07‑29 SGT 10:00 → 2025‑07‑29 02:00 UTC

-- Holdings
INSERT IGNORE INTO holding (asset_id, quantity, avg_cost, opened_ts)
SELECT id, qty, cost, '2024-10-01 14:30:00' -- same opened date for demo
FROM (
  SELECT 'AAPL' sym, 50.000000 qty, 145.80 cost
  UNION ALL SELECT 'MSFT', 30.000000, 320.00
  UNION ALL SELECT 'BND', 100.000000, 75.00
  UNION ALL SELECT 'CASH', 5000.000000, 1.00
) AS seed
JOIN asset a ON a.symbol = seed.sym;

-- Transactions (all BUYs to match holdings)
INSERT IGNORE INTO transaction (asset_id, txn_type, quantity, price, txn_ts)
SELECT id, 'BUY', qty, cost, '2024-10-01 14:30:00'
FROM (
  SELECT 'AAPL' sym, 50.000000 qty, 145.80 cost
  UNION ALL SELECT 'MSFT', 30.000000, 320.00
  UNION ALL SELECT 'BND', 100.000000, 75.00
) tx
JOIN asset a ON a.symbol = tx.sym;

-- Latest intraday ticks (2025‑07‑28 13:45:00 UTC)
INSERT IGNORE INTO price_tick (asset_id, price_ts, last_price)
SELECT id, '2025-07-28 13:45:00', price
FROM (
  SELECT 'AAPL' sym, 198.12 price
  UNION ALL SELECT 'MSFT', 410.55
  UNION ALL SELECT 'BND', 74.88
  UNION ALL SELECT 'CASH', 1.00
) p
JOIN asset a ON a.symbol = p.sym;

-- Previous EOD close (2025‑07‑27)
INSERT IGNORE INTO price_eod (asset_id, price_date, close_price)
SELECT id, '2025-07-27', price
FROM (
  SELECT 'AAPL' sym, 196.00 price
  UNION ALL SELECT 'MSFT', 405.70
  UNION ALL SELECT 'BND', 74.80
  UNION ALL SELECT 'CASH', 1.00
) q
JOIN asset a ON a.symbol = q.sym;

-- Portfolio snapshot for 2025‑07‑27 22:00 UTC
INSERT IGNORE INTO portfolio_snapshot (snapshot_ts, total_value, total_cost)
VALUES ('2025-07-27 22:00:00', 125432.55, 116900.00);

-- #####################################################################
-- Verification helpers -------------------------------------------------
-- View: live market value per holding (using latest tick)
DROP VIEW IF EXISTS v_holding_live;
CREATE VIEW v_holding_live AS
SELECT h.id AS holding_id,
       a.symbol,
       h.quantity,
       h.avg_cost,
       t.last_price AS market_price,
       (h.quantity * t.last_price) AS market_value,
       ROUND(((t.last_price - h.avg_cost) / h.avg_cost) * 100, 2) AS return_pct
FROM holding h
JOIN asset a        ON a.id = h.asset_id
JOIN price_tick t   ON t.asset_id = h.asset_id
WHERE t.price_ts = (SELECT MAX(price_ts) FROM price_tick WHERE asset_id = h.asset_id);

-- Quick sanity query
-- SELECT * FROM v_holding_live ORDER BY market_value DESC;