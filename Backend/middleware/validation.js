const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 25 })
      .withMessage('First name must be between 2 and 25 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 25 })
      .withMessage('Last name must be between 2 and 25 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email or username is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateStatus: [
    body('status')
      .isIn(['pending', 'active', 'suspended', 'deactivated'])
      .withMessage('Status must be one of: pending, active, suspended, deactivated')
  ]
};

// Article validation rules
const articleValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 50 })
      .withMessage('Content must be at least 50 characters long'),
    
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Excerpt cannot exceed 300 characters'),
    
    body('categories')
      .optional()
      .isArray()
      .withMessage('Categories must be an array'),
    
    body('categories.*')
      .optional()
      .isMongoId()
      .withMessage('Each category must be a valid ID'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    
    body('seo.metaTitle')
      .optional()
      .trim()
      .isLength({ max: 60 })
      .withMessage('Meta title cannot exceed 60 characters'),
    
    body('seo.metaDescription')
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage('Meta description cannot exceed 160 characters')
  ]
};

// Product validation rules
const productValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Product name must be between 3 and 200 characters'),
    
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 20 })
      .withMessage('Description must be at least 20 characters long'),
    
    body('sku')
      .trim()
      .notEmpty()
      .withMessage('SKU is required')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),
    
    body('price.regular')
      .isFloat({ min: 0.01 })
      .withMessage('Regular price must be a positive number'),
    
    body('price.sale')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Sale price must be a positive number'),
    
    body('inventory.quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('inventory.lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative integer'),
    
    body('categories')
      .isArray({ min: 1 })
      .withMessage('At least one category is required'),
    
    body('categories.*')
      .isMongoId()
      .withMessage('Each category must be a valid ID')
  ]
};

// Category validation rules
const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('type')
      .optional()
      .isIn(['article', 'product', 'general'])
      .withMessage('Type must be article, product, or general'),
    
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('Parent category must be a valid ID')
  ]
};

// Comment validation rules
const commentValidation = {
  create: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ min: 5, max: 1000 })
      .withMessage('Comment must be between 5 and 1000 characters'),
    
    body('targetType')
      .isIn(['Article', 'Product'])
      .withMessage('Target type must be Article or Product'),
    
    body('targetId')
      .isMongoId()
      .withMessage('Target ID must be a valid ID'),
    
    body('parentComment')
      .optional()
      .isMongoId()
      .withMessage('Parent comment must be a valid ID')
  ]
};

// Review validation rules
const reviewValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Review title is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Review content is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Content must be between 10 and 2000 characters'),
    
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('targetType')
      .isIn(['Product', 'Article'])
      .withMessage('Target type must be Product or Article'),
    
    body('targetId')
      .isMongoId()
      .withMessage('Target ID must be a valid ID')
  ]
};

// OTP validation rules
const otpValidation = {
  send: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('purpose')
      .optional()
      .isIn(['registration', 'password_reset', 'email_verification'])
      .withMessage('Purpose must be registration, password_reset, or email_verification')
  ],

  verify: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers')
  ]
};

// Query parameter validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters')
  ]
};

// Parameter validation
const paramValidation = {
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ],

  accountId: [
    param('accountId')
      .isLength({ min: 6, max: 6 })
      .withMessage('Account ID must be 6 characters')
      .isNumeric()
      .withMessage('Account ID must contain only numbers')
  ]
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  userValidation,
  articleValidation,
  productValidation,
  categoryValidation,
  commentValidation,
  reviewValidation,
  otpValidation,
  queryValidation,
  paramValidation
};
