const express = require('express');
const cors = require('cors');

const portfolioRoute = require('../route/portfolioRoute');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', portfolioRoute);

// basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
