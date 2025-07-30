#!/bin/bash

# Database setup script for portfolio manager

echo "🗄️  Setting up database tables for asset price data..."

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    exit 1
fi

# Prompt for MySQL credentials if not set in environment
if [ -z "$DB_HOST" ]; then
    DB_HOST="localhost"
fi

if [ -z "$DB_USER" ]; then
    read -p "Enter MySQL username (default: root): " DB_USER
    DB_USER=${DB_USER:-root}
fi

if [ -z "$DB_PASS" ]; then
    read -s -p "Enter MySQL password: " DB_PASS
    echo
fi

# Run the database setup
echo "📊 Creating database and tables..."

# mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" < SQL_scripts/create.sql
# if [ $? -eq 0 ]; then
#     echo "✅ Base tables created successfully"
# else
#     echo "❌ Failed to create base tables"
#     exit 1
# fi

mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" < SQL_scripts/create_price_tables.sql
if [ $? -eq 0 ]; then
    echo "✅ Price data tables created successfully"
else
    echo "❌ Failed to create price data tables"
    exit 1
fi

echo "🎉 Database setup completed!"
echo ""
echo "📋 Tables created:"
echo "   - asset_quotes_live (real-time quotes)"
echo "   - asset_prices_daily (daily OHLCV data)"
echo "   - asset_prices_intraday (5-minute intervals)"
echo "   - asset_metadata (symbol information)"
echo "   - api_fetch_log (API usage tracking)"
echo ""
echo "🚀 You can now start the server with: npm start"
