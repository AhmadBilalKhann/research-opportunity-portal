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

// Handle malformed JSON body errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload. Please ensure the request body is valid JSON.'
    });
  }
  next(err);
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// API Routes
const opportunitiesRouter = require('./routes/opportunities');
app.use('/api/opportunities', opportunitiesRouter);

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

// Catch-all 404 handler for unhandled API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
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
