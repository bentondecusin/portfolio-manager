const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'DB_portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable transactions
  multipleStatements: true
});

// The pool already has getConnection method from mysql2/promise
// No need to add it explicitly

module.exports = pool;