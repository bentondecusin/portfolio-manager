// test_asset_service.js - Test the asset service functionality

require('dotenv').config();

const { 
  fetchAndStoreLiveQuote, 
  fetchAndStoreDailyHistory,
  getActiveSymbols,
  syncAllSymbolsData 
} = require('./src/service/assetService');

const db = require('./src/db');

async function testAssetService() {
  console.log('🧪 Testing Asset Service...\n');

  try {
    // Test 1: Get active symbols
    console.log('📋 Test 1: Getting trending symbols...');
    const symbols = await getActiveSymbols();
    console.log(`Found symbols: ${symbols.join(', ')}\n`);

    if (symbols.length === 0) {
      console.log('❌ No symbols found in hardcoded list.');
      return;
    }

    const testSymbol = symbols[0];
    
    // Test 2: Fetch live quote for first symbol
    console.log(`📊 Test 2: Fetching live quote for ${testSymbol}...`);
    const liveResult = await fetchAndStoreLiveQuote(testSymbol);
    console.log('Live quote result:', liveResult);
    console.log('');

    // Test 3: Fetch daily history
    console.log(`📈 Test 3: Fetching daily history for ${testSymbol}...`);
    const dailyResult = await fetchAndStoreDailyHistory(testSymbol, 10); // Just 10 days for testing
    console.log('Daily history result:', dailyResult);
    console.log('');

    // Test 4: Check database contents
    console.log('🗄️  Test 4: Checking database contents...');
    
    const [liveQuotes] = await db.execute('SELECT symbol, current_price, last_updated FROM asset_quotes_live ORDER BY symbol');
    console.log('Live quotes in database:', liveQuotes);

    const [dailyData] = await db.execute('SELECT symbol, COUNT(*) as count, MIN(price_date) as earliest, MAX(price_date) as latest FROM asset_prices_daily GROUP BY symbol ORDER BY symbol');
    console.log('Daily data summary:', dailyData);

    console.log('\n✅ Asset service test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    if (db && db.end) {
      await db.end();
    }
    process.exit(0);
  }
}

// Add command line options
const args = process.argv.slice(2);
if (args.includes('--full-sync')) {
  console.log('🔄 Running full sync for all symbols...');
  syncAllSymbolsData().then(() => {
    console.log('Full sync completed');
    process.exit(0);
  }).catch(err => {
    console.error('Full sync failed:', err);
    process.exit(1);
  });
} else {
  testAssetService();
}
