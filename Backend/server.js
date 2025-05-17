require('rootpath')();
require('dotenv').config(); // Load environment variables

const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handlers');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Allow CORS requests from specified origins
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
  'http://localhost:4200',
  'https://final-intprog.onrender.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../Frontend/dist/final-intprog')));

// API routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/employees', require('./employees'));
app.use('/departments', require('./departments'));
app.use('/workflows', require('./workflows'));
app.use('/requests', require('./requests'));

// Swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is running', status: 'healthy' });
});

// Handle Angular routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/final-intprog/index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server listening on port ${port}`));