CREATE DATABASE IF NOT EXISTS DB_portfolio;
USE DB_portfolio;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop triggers first
DROP TRIGGER IF EXISTS trg_transactions_before_insert;
DROP TRIGGER IF EXISTS trg_transactions_after_insert;

-- Drop tables
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS transactions;

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol   VARCHAR(16)  NOT NULL,
  tick_name VARCHAR(64) NOT NULL,           -- pulled from yfinance at insert time
  txn_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  quantity DECIMAL(20,2) NOT NULL,          -- shares
  price    DECIMAL(20,2) NOT NULL,          -- execution price
  txn_ts   DATETIME      NOT NULL,
  INDEX idx_symbol_ts (symbol, txn_ts)      -- fast range & aggregation queries
) ENGINE=InnoDB;

-- holdings
CREATE TABLE IF NOT EXISTS holdings (
  symbol            VARCHAR(16) PRIMARY KEY,
  stock_name        VARCHAR(64) NOT NULL,
  quantity          DECIMAL(20,2) NOT NULL DEFAULT 0,      -- current shares
  average_cost      DECIMAL(20,2) NULL,                    -- moving-average cost per share
  last_update_time  DATETIME NOT NULL
) ENGINE=InnoDB;

-- Restore FK checks
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

DELIMITER $$

CREATE TRIGGER trg_transactions_before_insert
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
  DECLARE cur_qty DECIMAL(20,2) DEFAULT 0;
  DECLARE err_msg TEXT;

  -- Normalize txn_type casing if needed
  SET NEW.txn_type = CASE
    WHEN UPPER(NEW.txn_type) IN ('BUY','B') THEN 'buy'
    WHEN UPPER(NEW.txn_type) IN ('SELL','S') THEN 'sell'
    ELSE NEW.txn_type
  END;

  -- Basic validations
  IF NEW.txn_type NOT IN ('buy','sell') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'txn_type must be buy or sell';
  END IF;

  IF NEW.quantity <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'quantity must be positive';
  END IF;

  IF NEW.price <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'price must be positive';
  END IF;

  -- Oversell prevention
  IF NEW.txn_type = 'sell' THEN
    SELECT IFNULL(quantity,0) INTO cur_qty
    FROM holdings
    WHERE symbol = NEW.symbol;

    IF cur_qty < NEW.quantity THEN
      SET err_msg = CONCAT('Insufficient shares to sell for ', NEW.symbol);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = err_msg;
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_transactions_after_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
  DECLARE row_exists INT DEFAULT 0;
  DECLARE old_qty DECIMAL(20,2) DEFAULT 0;
  DECLARE old_avg DECIMAL(20,2) DEFAULT NULL;
  DECLARE new_qty DECIMAL(20,2);
  DECLARE new_avg DECIMAL(20,2);

  SELECT COUNT(*) INTO row_exists
  FROM holdings
  WHERE symbol = NEW.symbol;

  IF NEW.txn_type = 'buy' THEN

    IF row_exists = 0 THEN
      INSERT INTO holdings (symbol, stock_name, quantity, average_cost, last_update_time)
      VALUES (NEW.symbol, NEW.tick_name, NEW.quantity, NEW.price, NEW.txn_ts);
    ELSE
      SELECT quantity, average_cost INTO old_qty, old_avg
      FROM holdings
      WHERE symbol = NEW.symbol
      FOR UPDATE;

      SET new_qty = old_qty + NEW.quantity;
      -- moving-average cost
      SET new_avg = ROUND(((old_qty * COALESCE(old_avg, 0)) + (NEW.quantity * NEW.price)) / new_qty, 6);

      UPDATE holdings
      SET stock_name = NEW.tick_name,
          quantity = new_qty,
          average_cost = new_avg,
          last_update_time = NEW.txn_ts
      WHERE symbol = NEW.symbol;
    END IF;

  ELSEIF NEW.txn_type = 'sell' THEN

    -- row must exist due to BEFORE trigger
    SELECT quantity, average_cost INTO old_qty, old_avg
    FROM holdings
    WHERE symbol = NEW.symbol
    FOR UPDATE;

    SET new_qty = old_qty - NEW.quantity;

    IF new_qty > 0 THEN
      -- average_cost unchanged on sell
      UPDATE holdings
      SET quantity = new_qty,
          last_update_time = NEW.txn_ts
      WHERE symbol = NEW.symbol;
    ELSE
      -- position closed: remove row
      DELETE FROM holdings WHERE symbol = NEW.symbol;
    END IF;

  END IF;
END$$

DELIMITER ;

-- #####################################################################
-- Seed (dummy) data – small realistic sample
-- #####################################################################
INSERT INTO transactions
        (symbol, tick_name, txn_type, quantity, price,  txn_ts)
VALUES
  -- AAPL — two buys, one sell
  ('AAPL',  'Apple Inc.',            'buy',  25, 172.45, '2025-06-03 14:31:00'),
  ('AAPL',  'Apple Inc.',            'buy',  10, 180.10, '2025-06-21 15:05:00'),
  ('AAPL',  'Apple Inc.',            'sell',  5, 189.50, '2025-07-10 10:42:00'),

  -- MSFT
  ('MSFT',  'Microsoft Corporation', 'buy',  18, 415.80, '2025-06-05 09:45:00'),
  ('MSFT',  'Microsoft Corporation', 'buy',  12, 428.20, '2025-07-02 13:20:00'),

  -- NVDA
  ('NVDA',  'NVIDIA Corporation',    'buy',  6,  123.70, '2025-06-07 11:15:00'),
  ('NVDA',  'NVIDIA Corporation',    'sell', 2,  138.95, '2025-07-15 14:10:00'),

  -- AMZN
  ('AMZN',  'Amazon.com Inc.',       'buy',  4,  184.30, '2025-06-10 10:00:00'),
  ('AMZN',  'Amazon.com Inc.',       'buy',  3,  192.15, '2025-07-01 16:25:00'),
  ('AMZN',  'Amazon.com Inc.',       'sell', 1,  199.40, '2025-07-18 11:08:00'),

  -- GOOGL
  ('GOOGL', 'Alphabet Inc.-Class A', 'buy',  7,  145.60, '2025-06-12 14:55:00'),
  ('GOOGL', 'Alphabet Inc.-Class A', 'buy',  5,  151.25, '2025-06-28 09:37:00'),

  -- TSLA
  ('TSLA',  'Tesla Inc.',            'buy',  8,  242.80, '2025-06-15 15:12:00'),
  ('TSLA',  'Tesla Inc.',            'sell', 3,  256.75, '2025-07-12 10:50:00'),

  -- JPM
  ('JPM',   'JPMorgan Chase & Co.',  'buy',  20, 195.10, '2025-06-18 13:03:00'),
  ('JPM',   'JPMorgan Chase & Co.',  'buy',  15, 199.25, '2025-07-03 12:44:00'),

  -- NFLX
  ('NFLX',  'Netflix Inc.',          'buy',   5, 649.50, '2025-06-20 11:28:00'),
  ('NFLX',  'Netflix Inc.',          'sell',  2, 678.85, '2025-07-14 09:59:00'),

  -- Extra diversity
  ('KO',    'Coca-Cola Company',     'buy',  30, 63.40,  '2025-06-24 14:17:00'),
  ('KO',    'Coca-Cola Company',     'sell', 10, 67.05,  '2025-07-09 15:33:00');

-- Quick sanity query
-- SELECT * FROM v_holding_live ORDER BY market_value DESC;