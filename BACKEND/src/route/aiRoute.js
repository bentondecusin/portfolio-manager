const express = require('express');
const router  = express.Router();
const ctrl    = require('../controller/aiController');

// AI chat endpoint
router.post('/chat', ctrl.handleChatRequest);

// Health check endpoint
router.get('/health', ctrl.healthCheck);

module.exports = router;