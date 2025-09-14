const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  completeRegistration,
  sendOTP,
  verifyOTP,
  resendOTP,
  resendResetCode
} = require('../controllers/authController');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

// --- Validation Middleware ---

const registerValidation = [
  body('firstName').trim().isLength({ min: 1, max: 25 }).withMessage('First name must be between 1 and 25 characters'),
  body('lastName').trim().isLength({ min: 1, max: 25 }).withMessage('Last name must be between 1 and 25 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const verifyCodeValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 10, max: 10 }).withMessage('Reset code must be 10 characters')
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 10, max: 10 }).withMessage('Reset code must be 10 characters'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const completeRegistrationValidation = [
  body('registrationToken').notEmpty().withMessage('Registration token is required'),
  body('firstName').trim().isLength({ min: 1, max: 25 }).withMessage('First name must be between 1 and 25 characters'),
  body('lastName').trim().isLength({ min: 1, max: 25 }).withMessage('Last name must be between 1 and 25 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const otpValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const verifyOtpValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

// --- Authentication Routes ---

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/verify-reset-code', verifyCodeValidation, verifyResetCode);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/complete-registration', completeRegistrationValidation, completeRegistration);
router.post('/send-otp', otpValidation, sendOTP);
router.post('/verify-otp', verifyOtpValidation, verifyOTP);
router.post('/resend-otp', otpValidation, resendOTP);
router.post('/resend-reset-code', forgotPasswordValidation, resendResetCode);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;