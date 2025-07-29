// db.ts
const mysql = require('mysql2/promise')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'QQW1372zl.',
  port: 3306,
  database: 'portfolio_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00', // Optional, based on your region
});

export default db;
