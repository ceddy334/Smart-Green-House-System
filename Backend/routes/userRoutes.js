const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { userValidation, queryValidation, paramValidation, handleValidationErrors, sanitizeInput } = require('../middleware/validation');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', 
  protect, 
  authorize('administrator', 'moderator'),
  sanitizeInput,
  queryValidation.pagination,
  queryValidation.search,
  handleValidationErrors,
  userController.getAllUsers
);

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats', 
  protect, 
  authorize('administrator', 'moderator'),
  userController.getUserStats
);

// @route   GET /api/users/activities
// @desc    Get recent user activities (admin only)
// @access  Private/Admin
router.get('/activities', 
  protect, 
  authorize('administrator', 'moderator'),
  userController.getRecentActivities
);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', 
  protect, 
  authorize('administrator', 'moderator'),
  userController.getUserById
);

// @route   GET /api/users/account/:accountId
// @desc    Get user by account ID (admin only)
// @access  Private/Admin
router.get('/account/:accountId', 
  protect, 
  authorize('administrator', 'moderator'),
  userController.getUserByAccountId
);

// @route   PUT /api/users/:id/status
// @desc    Update user status (admin only)
// @access  Private/Admin
router.put('/:id/status', 
  protect, 
  authorize('administrator'),
  sanitizeInput,
  paramValidation.mongoId,
  userValidation.updateStatus,
  handleValidationErrors,
  userController.updateUserStatus
);

module.exports = router;
