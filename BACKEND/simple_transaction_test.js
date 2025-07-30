const http = require('http');

const BASE_URL = 'http://localhost:8080';

// Helper function to make HTTP requests
function makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Helper function to get current balance
async function getBalance() {
    try {
        const response = await makeRequest('GET', `${BASE_URL}/balance`);
        if (response.status === 200) {
            return response.data.balance || 0;
        }
        return 0;
    } catch (error) {
        console.log('Error getting balance:', error.message);
        return 0;
    }
}

// Helper function to get holdings for a symbol
async function getHoldings(symbol) {
    try {
        const response = await makeRequest('GET', `${BASE_URL}/holdings/symbol/${symbol}`);
        if (response.status === 200) {
            return response.data.quantity || 0;
        }
        return 0;
    } catch (error) {
        console.log(`Error getting holdings for ${symbol}:`, error.message);
        return 0;
    }
}

async function simpleTransactionTest() {
    console.log('🧪 Simple Transaction API Test\n');

    // Test 1: Check initial state
    console.log('1. Checking initial state...');
    const initialBalance = await getBalance();
    const initialAAPL = await getHoldings('AAPL');
    
    console.log(`   Initial Balance: $${initialBalance.toFixed(2)}`);
    console.log(`   Initial AAPL Holdings: ${initialAAPL} shares`);
    console.log('');

    // Test 2: Buy transaction
    console.log('2. Testing BUY transaction...');
    const buyTxn = {
        symbol: 'AAPL',
        txnType: 'buy',
        quantity: 2,
        price: 150.00
    };
    
    try {
        const buyResponse = await makeRequest('POST', `${BASE_URL}/transactions`, buyTxn);
        if (buyResponse.status === 200) {
            console.log('   ✅ Buy successful:', buyResponse.data.message);
            console.log(`   Transaction ID: ${buyResponse.data.transactionId}`);
        } else {
            console.log('   ❌ Buy failed:', buyResponse.data.error || buyResponse.data);
        }
    } catch (error) {
        console.log('   ❌ Buy error:', error.message);
    }
    console.log('');

    // Test 3: Check balance after buy
    console.log('3. Checking balance after buy...');
    const balanceAfterBuy = await getBalance();
    const aaplAfterBuy = await getHoldings('AAPL');
    
    console.log(`   Balance after buy: $${balanceAfterBuy.toFixed(2)}`);
    console.log(`   AAPL holdings after buy: ${aaplAfterBuy} shares`);
    
    const expectedBalanceAfterBuy = initialBalance - (2 * 150.00);
    const expectedAAPLAfterBuy = initialAAPL + 2;
    
    if (Math.abs(balanceAfterBuy - expectedBalanceAfterBuy) < 0.01) {
        console.log('   ✅ Balance updated correctly after buy');
    } else {
        console.log(`   ❌ Balance not updated correctly. Expected: $${expectedBalanceAfterBuy.toFixed(2)}, Got: $${balanceAfterBuy.toFixed(2)}`);
    }
    
    if (aaplAfterBuy === expectedAAPLAfterBuy) {
        console.log('   ✅ AAPL holdings updated correctly after buy');
    } else {
        console.log(`   ❌ AAPL holdings not updated correctly. Expected: ${expectedAAPLAfterBuy}, Got: ${aaplAfterBuy}`);
    }
    console.log('');

    // Test 4: Sell transaction
    console.log('4. Testing SELL transaction...');
    const sellTxn = {
        symbol: 'AAPL',
        txnType: 'sell',
        quantity: 1,
        price: 160.00
    };
    
    try {
        const sellResponse = await makeRequest('POST', `${BASE_URL}/transactions`, sellTxn);
        if (sellResponse.status === 200) {
            console.log('   ✅ Sell successful:', sellResponse.data.message);
            console.log(`   Transaction ID: ${sellResponse.data.transactionId}`);
        } else {
            console.log('   ❌ Sell failed:', sellResponse.data.error || sellResponse.data);
        }
    } catch (error) {
        console.log('   ❌ Sell error:', error.message);
    }
    console.log('');

    // Test 5: Check balance after sell
    console.log('5. Checking balance after sell...');
    const balanceAfterSell = await getBalance();
    const aaplAfterSell = await getHoldings('AAPL');
    
    console.log(`   Balance after sell: $${balanceAfterSell.toFixed(2)}`);
    console.log(`   AAPL holdings after sell: ${aaplAfterSell} shares`);
    
    const expectedBalanceAfterSell = balanceAfterBuy + (1 * 160.00);
    const expectedAAPLAfterSell = aaplAfterBuy - 1;
    
    if (Math.abs(balanceAfterSell - expectedBalanceAfterSell) < 0.01) {
        console.log('   ✅ Balance updated correctly after sell');
    } else {
        console.log(`   ❌ Balance not updated correctly. Expected: $${expectedBalanceAfterSell.toFixed(2)}, Got: $${balanceAfterSell.toFixed(2)}`);
    }
    
    if (aaplAfterSell === expectedAAPLAfterSell) {
        console.log('   ✅ AAPL holdings updated correctly after sell');
    } else {
        console.log(`   ❌ AAPL holdings not updated correctly. Expected: ${expectedAAPLAfterSell}, Got: ${aaplAfterSell}`);
    }
    console.log('');

    // Test 6: Summary
    console.log('6. Test Summary:');
    console.log(`   Initial Balance: $${initialBalance.toFixed(2)}`);
    console.log(`   Final Balance: $${balanceAfterSell.toFixed(2)}`);
    console.log(`   Balance Change: $${(balanceAfterSell - initialBalance).toFixed(2)}`);
    console.log(`   Initial AAPL: ${initialAAPL} shares`);
    console.log(`   Final AAPL: ${aaplAfterSell} shares`);
    console.log(`   AAPL Change: ${aaplAfterSell - initialAAPL} shares`);
    console.log('');

    console.log('🎉 Simple transaction test completed!');
}

// Run the test
simpleTransactionTest().catch(console.error); 