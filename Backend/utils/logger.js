const SystemLog = require('../models/SystemLog');

/**
 * Logger utility for system-wide logging
 */
class Logger {
  /**
   * Log an error
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  static async error(message, options = {}) {
    try {
      await SystemLog.create({
        level: 'error',
        message,
        category: options.category || 'system',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        errorStack: options.errorStack || null,
        metadata: options.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
    
    // Also log to console
    console.error(`[ERROR] ${message}`, options.metadata || '');
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  static async warn(message, options = {}) {
    try {
      await SystemLog.create({
        level: 'warn',
        message,
        category: options.category || 'system',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: options.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log warning:', error);
    }
    
    console.warn(`[WARN] ${message}`, options.metadata || '');
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  static async info(message, options = {}) {
    try {
      await SystemLog.create({
        level: 'info',
        message,
        category: options.category || 'system',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: options.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log info:', error);
    }
    
    console.info(`[INFO] ${message}`, options.metadata || '');
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} options - Additional options
   */
  static async debug(message, options = {}) {
    if (process.env.NODE_ENV === 'production') return;
    
    try {
      await SystemLog.create({
        level: 'debug',
        message,
        category: options.category || 'system',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: options.metadata || {}
      });
    } catch (error) {
      console.error('Failed to log debug:', error);
    }
    
    console.debug(`[DEBUG] ${message}`, options.metadata || '');
  }

  /**
   * Log user action
   * @param {string} action - Action performed
   * @param {Object} options - Additional options
   */
  static async userAction(action, options = {}) {
    try {
      await SystemLog.create({
        level: 'info',
        message: `User action: ${action}`,
        category: 'user_action',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: {
          action,
          ...options.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  /**
   * Log authentication events
   * @param {string} event - Auth event (login, logout, register, etc.)
   * @param {Object} options - Additional options
   */
  static async auth(event, options = {}) {
    try {
      await SystemLog.create({
        level: options.success ? 'info' : 'warn',
        message: `Authentication: ${event}`,
        category: 'auth',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: {
          event,
          success: options.success || false,
          ...options.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  /**
   * Log security events
   * @param {string} event - Security event
   * @param {Object} options - Additional options
   */
  static async security(event, options = {}) {
    try {
      await SystemLog.create({
        level: 'warn',
        message: `Security: ${event}`,
        category: 'security',
        userId: options.userId || null,
        sessionId: options.sessionId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        endpoint: options.endpoint || null,
        method: options.method || null,
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        metadata: {
          event,
          ...options.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log API requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  static async apiRequest(req, res, responseTime) {
    try {
      const statusCode = res.statusCode;
      const level = statusCode >= 400 ? 'warn' : 'info';
      
      await SystemLog.create({
        level,
        message: `API Request: ${req.method} ${req.originalUrl}`,
        category: 'api',
        userId: req.user?.id || null,
        sessionId: req.sessionID || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        statusCode,
        responseTime,
        metadata: {
          query: req.query,
          params: req.params,
          bodySize: JSON.stringify(req.body).length
        }
      });
    } catch (error) {
      console.error('Failed to log API request:', error);
    }
  }
}

module.exports = Logger;
