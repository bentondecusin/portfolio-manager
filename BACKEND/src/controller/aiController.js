/**
 * AI Controller for Portfolio Manager
 * 
 * This controller integrates Google's Gemini AI with function calling capabilities
 * to provide intelligent responses about financial assets.
 * 
 * Features:
 * - Natural language queries about stocks/assets
 * - Automatic function calling for live and historical data
 * - Error handling and input validation
 * 
 * Usage:
 * POST /api/ai/chat
 * Body: { "message": "What's the current price of AAPL?" }
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google AI API key
 * - ALPHA_VANTAGE_API_KEY: For asset data (used by assetController)
 */

const { GoogleGenAI, Type } = require('@google/genai');
const { getAssetLive, getAssetHistory } = require('./assetController');

// Initialize the Google GenAI client
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('Missing GEMINI_API_KEY; set it in your environment variables');
    process.exit(1);
}

console.log('Using Google GenAI API Key:', API_KEY.substring(0, 10) + '...'); // Log first 10 chars for debugging

// Configure the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Wrapper function to call getAssetLive and return the result
 * @param {string} symbol - Asset symbol
 * @returns {Promise<Object>} Asset live data
 */
const callAssetLive = async (symbol) => {
    return new Promise((resolve, reject) => {
        const req = { params: { symbol } };
        const res = {
            json: (data) => resolve(data),
            status: (code) => ({
                json: (data) => {
                    if (code >= 400) {
                        reject(new Error(`HTTP ${code}: ${JSON.stringify(data)}`));
                    } else {
                        resolve(data);
                    }
                }
            })
        };

        getAssetLive(req, res).catch(reject);
    });
};

/**
 * Wrapper function to call getAssetHistory and return the result
 * @param {string} symbol - Asset symbol
 * @param {string} type - History type (intraday/daily)
 * @param {string} range - Time range (week/month)
 * @returns {Promise<Object>} Asset history data
 */
const callAssetHistory = async (symbol, type = 'daily', range = 'month') => {
    return new Promise((resolve, reject) => {
        const req = {
            params: { symbol },
            query: { type, range }
        };
        const res = {
            json: (data) => resolve(data),
            status: (code) => ({
                json: (data) => {
                    if (code >= 400) {
                        reject(new Error(`HTTP ${code}: ${JSON.stringify(data)}`));
                    } else {
                        resolve(data);
                    }
                }
            })
        };

        getAssetHistory(req, res).catch(reject);
    });
};

// Define the function declarations for the model
const getAssetLiveFuncDecl = {
    name: 'getAssetLive',
    description: 'Get live asset information for a given symbol including current price, volume, and trading data',
    parameters: {
        type: Type.OBJECT,
        properties: {
            symbol: {
                type: Type.STRING,
                description: 'The asset symbol to get the live information for (e.g., "AAPL", "GOOGL")',
            }
        },
        required: ['symbol']
    }
};

const getAssetHistoryFuncDecl = {
    name: 'getAssetHistory',
    description: 'Get historical asset information for a given symbol over a specified time period',
    parameters: {
        type: Type.OBJECT,
        properties: {
            symbol: {
                type: Type.STRING,
                description: 'The asset symbol to get the historical information for (e.g., "AAPL", "GOOGL")',
            },
            type: {
                type: Type.STRING,
                description: 'The type of history to fetch',
                enum: ['intraday', 'daily'],
                default: 'daily'
            },
            range: {
                type: Type.STRING,
                description: 'The time range of history to fetch',
                enum: ['week', 'month'],
                default: 'month'
            }
        },
        required: ['symbol']
    }
};

/**
 * Generate AI response with function calling capabilities
 * @param {string} userMessage - The user's message to the AI
 * @returns {Promise<Object>} The AI response and any function call results
 */
const generateAIResponse = async (userMessage) => {
    try {
        // simple test
        console.log("user message:", userMessage);
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: userMessage,
        });
        console.log('Simple test result:', result.response.text());
        return {
            response: result.response.text(),
            functionCall: null // No function call in simple test
        };
//         const result = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             contents: [{
//                 role: 'user',
//                 parts: [{ text: userMessage }]
//             }],
//             config: {
//                 tools: [{
//                     functionDeclarations: [getAssetLiveFuncDecl, getAssetHistoryFuncDecl],
//                 }],
//             }
//         });
//         const response = result.response;

//         // Check for function calls in the response
//         if (response.functionCalls && response.functionCalls.length > 0) {
//             const functionCall = response.functionCalls[0]; // Get the first function call
//             console.log(`Function to call: ${functionCall.name}`);
//             console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);

//             let functionResult = null;

//             // Execute the appropriate function based on the function call
//             if (functionCall.name === 'getAssetLive') {
//                 const { symbol } = functionCall.args;
//                 try {
//                     console.log(`Fetching live data for symbol: ${symbol}`);
//                     functionResult = await callAssetLive(symbol);
//                 } catch (error) {
//                     console.error('Error calling getAssetLive:', error);
//                     functionResult = {
//                         error: 'Failed to fetch live asset data',
//                         details: error.message,
//                         symbol: symbol
//                     };
//                 }
//             } else if (functionCall.name === 'getAssetHistory') {
//                 const { symbol, type = 'daily', range = 'month' } = functionCall.args;
//                 try {
//                     console.log(`Fetching historical data for symbol: ${symbol}, type: ${type}, range: ${range}`);
//                     functionResult = await callAssetHistory(symbol, type, range);
//                 } catch (error) {
//                     console.error('Error calling getAssetHistory:', error);
//                     functionResult = {
//                         error: 'Failed to fetch asset history data',
//                         details: error.message,
//                         symbol: symbol,
//                         type: type,
//                         range: range
//                     };
//                 }
//             } else {
//                 console.log(`Unknown function call: ${functionCall.name}`);
//                 functionResult = { error: `Unknown function: ${functionCall.name}` };
//             }

//             // Generate a follow-up response with the function result
//             const followUpPrompt = `
// User asked: "${userMessage}"
// I called the function ${functionCall.name} with arguments: ${JSON.stringify(functionCall.args)}
// The function returned: ${JSON.stringify(functionResult)}

// Please provide a helpful and informative response to the user based on this data. Include specific numbers and explain what they mean in context.
//             `;

//             try {
//                 const followUpResult = await model.generateContent({
//                     contents: followUpPrompt
//                 });
//                 const followUpResponse = followUpResult.response;

//                 return {
//                     response: followUpResponse.text(),
//                     functionCall: {
//                         name: functionCall.name,
//                         args: functionCall.args,
//                         result: functionResult
//                     }
//                 };
//             } catch (error) {
//                 console.error('Error generating follow-up response:', error);
//                 return {
//                     response: `I retrieved the following data for ${functionCall.args.symbol}: ${JSON.stringify(functionResult)}`,
//                     functionCall: {
//                         name: functionCall.name,
//                         args: functionCall.args,
//                         result: functionResult
//                     }
//                 };
//             }
//         } else {
//             console.log("No function call found in the response.");
//             return {
//                 response: response.text(),
//                 functionCall: null
//             };
//         }
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('Failed to generate AI response: ' + error.message);
    }
}

/**
 * Express.js controller for handling AI chat requests
 * POST /api/ai/chat
 */
const handleChatRequest = async (req, res) => {
    try {
        const { message } = req.body;

        // Input validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Message too long. Maximum 2000 characters allowed.'
            });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message cannot be empty'
            });
        }

        const aiResponse = await generateAIResponse(message.trim());

        res.json({
            success: true,
            data: aiResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in handleChatRequest:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};

/**
 * Express.js controller for health check
 * GET /api/ai/health
 */
const healthCheck = (req, res) => {
    res.json({
        success: true,
        message: 'AI Controller is healthy',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    generateAIResponse,
    handleChatRequest,
    healthCheck
};