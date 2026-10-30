import mysql from 'mysql2/promise'
import 'dotenv/config'

// One shared pool of connections to MySQL.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Send DATE / DATETIME columns as plain text like '1999-11-13'
  // (otherwise the time zone shifts them by one day).
  dateStrings: true,
  // Cloud databases need SSL. Locally this stays off.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

export default pool