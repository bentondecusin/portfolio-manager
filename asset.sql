CREATE DATABASE IF NOT EXISTS portfolio_management;
USE portfolio_management;

CREATE TABLE assets (
    symbol VARCHAR(10),
    name VARCHAR(50),
    price DECIMAL(10, 2),
    date DATE,
    class VARCHAR(20),
    PRIMARY KEY (symbol, date)
);

INSERT INTO assets (symbol, name, price, date, class) VALUES
-- GBPUSD
('GBPUSD', 'British Pound / US Dollar', 1.28, '2025-07-21', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.27, '2025-07-22', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.26, '2025-07-23', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.25, '2025-07-24', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.24, '2025-07-25', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.25, '2025-07-26', 'FX'),
('GBPUSD', 'British Pound / US Dollar', 1.26, '2025-07-27', 'FX'),

-- CNYUSD
('CNYUSD', 'Chinese Yuan / US Dollar', 0.14, '2025-07-21', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.14, '2025-07-22', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.145, '2025-07-23', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.147, '2025-07-24', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.148, '2025-07-25', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.146, '2025-07-26', 'FX'),
('CNYUSD', 'Chinese Yuan / US Dollar', 0.145, '2025-07-27', 'FX'),

-- NVDA
('NVDA', 'NVIDIA Corporation', 125.00, '2025-07-21', 'stock'),
('NVDA', 'NVIDIA Corporation', 128.00, '2025-07-22', 'stock'),
('NVDA', 'NVIDIA Corporation', 130.00, '2025-07-23', 'stock'),
('NVDA', 'NVIDIA Corporation', 132.00, '2025-07-24', 'stock'),
('NVDA', 'NVIDIA Corporation', 134.00, '2025-07-25', 'stock'),
('NVDA', 'NVIDIA Corporation', 133.00, '2025-07-26', 'stock'),
('NVDA', 'NVIDIA Corporation', 135.00, '2025-07-27', 'stock'),

-- AAPL
('AAPL', 'Apple Inc.', 190.00, '2025-07-21', 'stock'),
('AAPL', 'Apple Inc.', 192.00, '2025-07-22', 'stock'),
('AAPL', 'Apple Inc.', 194.00, '2025-07-23', 'stock'),
('AAPL', 'Apple Inc.', 195.00, '2025-07-24', 'stock'),
('AAPL', 'Apple Inc.', 197.00, '2025-07-25', 'stock'),
('AAPL', 'Apple Inc.', 196.00, '2025-07-26', 'stock'),
('AAPL', 'Apple Inc.', 198.00, '2025-07-27', 'stock'),

-- MS
('MS', 'Morgan Stanley', 85.00, '2025-07-21', 'stock'),
('MS', 'Morgan Stanley', 84.50, '2025-07-22', 'stock'),
('MS', 'Morgan Stanley', 84.00, '2025-07-23', 'stock'),
('MS', 'Morgan Stanley', 83.50, '2025-07-24', 'stock'),
('MS', 'Morgan Stanley', 83.00, '2025-07-25', 'stock'),
('MS', 'Morgan Stanley', 83.50, '2025-07-26', 'stock'),
('MS', 'Morgan Stanley', 84.00, '2025-07-27', 'stock'),

-- MSFT
('MSFT', 'Microsoft Corp.', 320.00, '2025-07-21', 'stock'),
('MSFT', 'Microsoft Corp.', 322.00, '2025-07-22', 'stock'),
('MSFT', 'Microsoft Corp.', 325.00, '2025-07-23', 'stock'),
('MSFT', 'Microsoft Corp.', 327.00, '2025-07-24', 'stock'),
('MSFT', 'Microsoft Corp.', 330.00, '2025-07-25', 'stock'),
('MSFT', 'Microsoft Corp.', 328.00, '2025-07-26', 'stock'),
('MSFT', 'Microsoft Corp.', 332.00, '2025-07-27', 'stock'),

-- BTCUSD
('BTCUSD', 'Bitcoin / US Dollar', 60000.00, '2025-07-21', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 60500.00, '2025-07-22', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 61000.00, '2025-07-23', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 61500.00, '2025-07-24', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 62000.00, '2025-07-25', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 61800.00, '2025-07-26', 'crypto'),
('BTCUSD', 'Bitcoin / US Dollar', 62500.00, '2025-07-27', 'crypto');

