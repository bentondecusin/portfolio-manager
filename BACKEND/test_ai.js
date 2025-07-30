/**
 * Simple test script for AI Controller
 * Run with: node test_ai.js
 * 
 * Make sure to set GEMINI_API_KEY and ALPHA_VANTAGE_API_KEY in your .env file
 */

require('dotenv').config();
const { generateAIResponse } = require('./src/controller/aiController');

async function testAI() {
    try {
        console.log('Testing AI Controller...');
        console.log('='.repeat(50));
        
        // Test simple message (should not trigger function calls)
        console.log('\n1. Testing simple message:');
        const response1 = await generateAIResponse("Hello, how are you today?");
        console.log('Response:', response1.response);
        console.log('Function Call:', response1.functionCall ? 'Yes' : 'No');
        
        // Test asset query (should trigger getAssetLive function)
        console.log('\n2. Testing live asset query:');
        const response2 = await generateAIResponse("What's the current price of AAPL?");
        console.log('Response:', response2.response);
        console.log('Function Called:', response2.functionCall?.name || 'None');
        if (response2.functionCall) {
            console.log('Function Args:', response2.functionCall.args);
            console.log('Function Result:', response2.functionCall.result);
        }
        
        // Test historical data query (should trigger getAssetHistory function)
        console.log('\n3. Testing historical asset query:');
        const response3 = await generateAIResponse("Show me the historical data for Tesla stock over the past month");
        console.log('Response:', response3.response);
        console.log('Function Called:', response3.functionCall?.name || 'None');
        if (response3.functionCall) {
            console.log('Function Args:', response3.functionCall.args);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('Tests completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testAI();
}

module.exports = { testAI };
