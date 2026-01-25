const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Your MySQL username
  password: 'S@rvesh.3',   // Your MySQL password (make sure this is correct!)
  database: 'nyay_saathi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();
  }
});

// Export promise-based pool for async/await use
module.exports = pool.promise();