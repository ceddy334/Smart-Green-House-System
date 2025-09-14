const express = require('express');
const { body } = require('express-validator');

const {
  sendOTP,
  verifyOTP,
  resendOTP,
  verifyOTPAndRegister,
  getOTPStatus
} = require('../controllers/otpController');

const router = express.Router();

// Validation middleware
const sendOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('purpose')
    .optional()
    .isIn(['email_verification', 'password_reset', 'login_verification'])
    .withMessage('Invalid purpose')
];

const verifyOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('purpose')
    .optional()
    .isIn(['email_verification', 'password_reset', 'login_verification'])
    .withMessage('Invalid purpose')
];

const resendOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('purpose')
    .optional()
    .isIn(['email_verification', 'password_reset', 'login_verification'])
    .withMessage('Invalid purpose')
];

const verifyOTPAndRegisterValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('First name must be between 1 and 25 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('Last name must be between 1 and 25 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Routes
router.post('/send', sendOTPValidation, sendOTP);
router.post('/verify', verifyOTPValidation, verifyOTP);
router.post('/resend', resendOTPValidation, resendOTP);
router.post('/verify-and-register', verifyOTPAndRegisterValidation, verifyOTPAndRegister);
router.get('/status', getOTPStatus);

module.exports = router;
