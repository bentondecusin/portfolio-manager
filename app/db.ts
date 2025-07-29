const mysql = require('mysql2/promise')

// Create DB pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'n3u3da!',
  database: 'portfolio_management',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+08:00'
})

export default db