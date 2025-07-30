-- Simple step-by-step test for holdings triggers
-- Run these commands one by one to see how triggers work

-- Step 1: Clear existing data
DELETE FROM transactions;
DELETE FROM holdings;

-- Step 2: Insert first buy transaction
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'buy', 100, 150.50, NOW());

-- Step 3: Check what happened to holdings
SELECT 'After first buy:' as step;
SELECT * FROM holdings;

-- Step 4: Insert second buy (different price)
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'buy', 50, 160.00, NOW());

-- Step 5: Check average cost calculation
SELECT 'After second buy (check average cost):' as step;
SELECT * FROM holdings;

-- Step 6: Sell some shares
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'sell', 30, 155.00, NOW());

-- Step 7: Check holdings after sell
SELECT 'After partial sell:' as step;
SELECT * FROM holdings;

-- Step 8: Try to sell more than we have (should fail)
SELECT 'Trying to oversell (should show error):' as step;
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'sell', 200, 155.00, NOW()); 