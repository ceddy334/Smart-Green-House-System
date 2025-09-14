const Logger = require('../utils/logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log when response is sent
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log the API request
    Logger.apiRequest(req, res, responseTime);
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = requestLogger;
