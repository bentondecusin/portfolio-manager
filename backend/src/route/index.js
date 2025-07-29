const express = require('express');
const cors = require('cors');

const assetRoute = require('../route/assetRoute');
const transactionRoute = require('../route/transactionRoute');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/transactions', transactionRoute);
app.use('/assets', assetRoute);

// Fallback for undefined routes (optional)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
