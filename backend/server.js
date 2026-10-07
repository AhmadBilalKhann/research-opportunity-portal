const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (from backend/.env or root .env)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import MySQL database pool
const pool = require('./config/db');

// Initialize Express application
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Attempt a lightweight query to verify database connectivity
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      message: 'University Research Opportunity Portal API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(200).json({
      status: 'OK',
      message: 'University Research Opportunity Portal API is running',
      database: 'disconnected',
      databaseError: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Start Express Server
app.listen(PORT, async () => {
  console.log('====================================================');
  console.log('University Research Opportunity Portal Server');
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Frontend served from: ${frontendPath}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  // Test database connection on server start
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected to MySQL database "${process.env.DB_NAME || 'research_opportunity_db'}" successfully.`);
    connection.release();
  } catch (err) {
    console.warn(`[Database Notice] Could not connect to MySQL: ${err.message}`);
    console.warn('[Database Notice] Please verify credentials in backend/.env if MySQL is running.');
  }
});
