const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Create Express app
const app = express();


console.log('Express app created successfully');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: 1 // Trust the first hop from the proxy
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the public directory
app.use(express.static('public'));

console.log('Middleware setup completed');

// Connect to MongoDB
connectDB();


// Test routes
const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

console.log('Basic route setup completed');

// Import and use auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  console.log('Auth routes imported successfully');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted successfully');
} catch (error) {
  console.error('Error with auth routes:', error);
}

// Import and use greenhouse routes
try {
  const greenhouseRoutes = require('./routes/greenhouseRoutes');
  console.log('Greenhouse routes imported successfully');
  app.use('/api/greenhouse', greenhouseRoutes);
  console.log('Greenhouse routes mounted successfully');
} catch (error) {
  console.error('Error with greenhouse routes:', error);
}

// Import and use OTP routes
try {
  const otpRoutes = require('./routes/otpRoutes');
  console.log('OTP routes imported successfully');
  app.use('/api/otp', otpRoutes);
  console.log('OTP routes mounted successfully');
} catch (error) {
  console.error('Error with OTP routes:', error);
}

// Import and use IoT Dashboard routes
try {
  const iotDashboardRoutes = require('./routes/iotDashboardRoutes');
  console.log('IoT Dashboard routes imported successfully');
  app.use('/api/iot', iotDashboardRoutes);
  console.log('IoT Dashboard routes mounted successfully');
} catch (error) {
  console.error('Error with IoT Dashboard routes:', error);
}

// Import and use user routes
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('User routes mounted successfully');
} catch (error) {
  console.error('Error with user routes:', error);
}

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

console.log('All routes setup completed');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle port conflicts gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    const newPort = PORT + 1;
    const newServer = app.listen(newPort, () => {
      console.log(`Server is running on port ${newPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

console.log('Server listening setup completed');