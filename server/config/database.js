// server/config/database.js
// Final Version using MySQL2/Promise for better performance and syntax.

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Ensure .env is loaded correctly

// Create a connection pool for efficient database handling
const pool = mysql.createPool({
  // Use environment variables for secure, flexible configuration
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306, // Default MySQL port
  user: process.env.DB_USER || 'scm_app_user', 
  password: process.env.DB_PASSWORD || 'DBMS@pesu2025',
  database: process.env.DB_NAME || 'scm_portal',
  
  // Pool configuration for high transaction volume
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Enable multiple statements for calling stored procedures/triggers in a single query
  // NOTE: Use this sparingly and carefully due to SQL Injection risks.
  multipleStatements: true 
});

// Test connection and log status
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Failed to connect to MySQL database:', err.message);
        console.error('Check your .env file credentials and ensure MySQL service is running.');
        process.exit(1);
    });

module.exports = pool;

/* * REQUIRED .env FILE CONTENT:
* --------------------------
* DB_HOST=localhost
* DB_PORT=3306
* DB_USER=scm_app_user   <-- Use the non-root user you created!
* DB_PASSWORD=your_secure_password
* DB_NAME=scm_portal
*/