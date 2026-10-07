const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test / health route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'University Research Opportunity Portal API is running',
    status: 'OK',
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
