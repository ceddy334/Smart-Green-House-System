const Logger = require('./logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, category = 'system') {
    super(message);
    this.statusCode = statusCode;
    this.category = category;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle async errors in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle different types of errors
 */
const handleError = async (err, req, res) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  await Logger.error(error.message, {
    category: error.category || 'system',
    userId: req.user?.id,
    sessionId: req.sessionID,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    endpoint: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode,
    errorStack: err.stack,
    metadata: {
      body: req.body,
      params: req.params,
      query: req.query
    }
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, 400, 'database');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400, 'database');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'validation');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'auth');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'auth');
  }

  // Rate limit error
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new AppError(message, 429, 'security');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  handleError(err, req, res);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new AppError(message, 404, 'api');
  next(error);
};

/**
 * Database connection error handler
 */
const handleDatabaseError = (err) => {
  Logger.error('Database connection error', {
    category: 'database',
    errorStack: err.stack,
    metadata: { connectionString: process.env.MONGO_URI?.replace(/\/\/.*@/, '//***:***@') }
  });
};

/**
 * Unhandled promise rejection handler
 */
const handleUnhandledRejection = (err) => {
  Logger.error('Unhandled Promise Rejection', {
    category: 'system',
    errorStack: err.stack,
    metadata: { reason: err.reason }
  });
  
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  process.exit(1);
};

/**
 * Uncaught exception handler
 */
const handleUncaughtException = (err) => {
  Logger.error('Uncaught Exception', {
    category: 'system',
    errorStack: err.stack
  });
  
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
};

module.exports = {
  AppError,
  asyncHandler,
  globalErrorHandler,
  notFound,
  handleDatabaseError,
  handleUnhandledRejection,
  handleUncaughtException
};
