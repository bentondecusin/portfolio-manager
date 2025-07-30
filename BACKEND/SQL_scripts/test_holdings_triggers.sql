-- Test script for holdings table triggers
-- This script tests the automatic updating of holdings when transactions are inserted

-- Clear existing data (if any)
DELETE FROM transactions;
DELETE FROM holdings;

-- Test 1: Initial buy transaction
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'buy', 100, 150.50, NOW());

-- Check holdings after first buy
SELECT 'Test 1 - Initial buy' as test_name;
SELECT * FROM holdings WHERE symbol = 'AAPL';

-- Test 2: Additional buy (should update average cost)
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'buy', 50, 160.00, NOW());

-- Check holdings after second buy
SELECT 'Test 2 - Additional buy' as test_name;
SELECT * FROM holdings WHERE symbol = 'AAPL';

-- Test 3: Partial sell
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'sell', 30, 155.00, NOW());

-- Check holdings after partial sell
SELECT 'Test 3 - Partial sell' as test_name;
SELECT * FROM holdings WHERE symbol = 'AAPL';

-- Test 4: Another stock
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('GOOGL', 'Alphabet Inc.', 'buy', 25, 2800.00, NOW());

-- Check holdings for new stock
SELECT 'Test 4 - New stock' as test_name;
SELECT * FROM holdings WHERE symbol = 'GOOGL';

-- Test 5: Sell remaining AAPL shares (should close position)
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('AAPL', 'Apple Inc.', 'sell', 120, 158.00, NOW());

-- Check that AAPL position is closed
SELECT 'Test 5 - Close position' as test_name;
SELECT * FROM holdings WHERE symbol = 'AAPL';

-- Test 6: Try to oversell (should fail)
-- This should trigger an error
SELECT 'Test 6 - Oversell attempt (should fail)' as test_name;
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('GOOGL', 'Alphabet Inc.', 'sell', 30, 2850.00, NOW());

-- Test 7: Test case normalization
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('MSFT', 'Microsoft Corp.', 'BUY', 75, 300.00, NOW());

-- Check holdings with normalized case
SELECT 'Test 7 - Case normalization' as test_name;
SELECT * FROM holdings WHERE symbol = 'MSFT';

-- Test 8: Test invalid transaction type (should fail)
SELECT 'Test 8 - Invalid transaction type (should fail)' as test_name;
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('TSLA', 'Tesla Inc.', 'HOLD', 10, 200.00, NOW());

-- Test 9: Test zero quantity (should fail)
SELECT 'Test 9 - Zero quantity (should fail)' as test_name;
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('TSLA', 'Tesla Inc.', 'buy', 0, 200.00, NOW());

-- Test 10: Test negative price (should fail)
SELECT 'Test 10 - Negative price (should fail)' as test_name;
INSERT INTO transactions (symbol, tick_name, txn_type, quantity, price, txn_ts) 
VALUES ('TSLA', 'Tesla Inc.', 'buy', 10, -200.00, NOW());

-- Final holdings summary
SELECT 'Final Holdings Summary' as summary;
SELECT * FROM holdings ORDER BY symbol;

-- Transaction history
SELECT 'Transaction History' as history;
SELECT * FROM transactions ORDER BY txn_ts; 