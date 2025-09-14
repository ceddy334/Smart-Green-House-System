const crypto = require('crypto');
const User = require('../models/user/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const rateLimit = require('express-rate-limit');

// WARNING: In-memory store for OTPs is not suitable for production.
// Replace with a persistent store like Redis.
const otpStore = new Map();

// Rate limiting for OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per windowMs
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for login attempts
const loginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Cleanup expired OTPs
const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

// Apply rate limiting to OTP requests
exports.otpRateLimiter = otpRateLimiter;

// Send OTP to user's email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_EMAIL',
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address'
      });
    }

    const existingOTP = otpStore.get(email);
    if (existingOTP && existingOTP.expiresAt > new Date()) {
      const timeLeft = Math.ceil((existingOTP.expiresAt - new Date()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        code: 'OTP_ALREADY_SENT',
        message: `Please wait ${timeLeft} minutes before requesting a new OTP`,
        retryAfter: timeLeft * 60
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    otpStore.set(email, { otp, expiresAt });

    try {
      const emailResult = await emailService.sendEmail(email, 'otp', { otp });
      
      if (!emailResult || !emailResult.success) {
        console.error('Failed to send OTP email:', emailResult?.error);
        return res.status(500).json({
          success: false,
          code: 'EMAIL_SEND_FAILED',
          message: 'Failed to send OTP email. Please try again later.'
        });
      }

      console.log(`OTP generated for ${email}, expires at ${expiresAt}`);
      
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        expiresAt: expiresAt.toISOString()
      });

    } catch (emailError) {
      otpStore.delete(email);
      
      console.error('Error in sendOTP email service:', {
        email,
        error: emailError.message,
        stack: process.env.NODE_ENV === 'development' ? emailError.stack : undefined
      });
      
      return res.status(500).json({
        success: false,
        code: emailError.code || 'EMAIL_SERVICE_ERROR',
        message: emailError.message || 'Failed to send OTP email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Unexpected error in sendOTP:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

// Apply rate limiting to login attempts
exports.loginRateLimiter = loginRateLimiter;

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email and OTP are required',
        field: !email ? 'email' : 'otp'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address'
      });
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_OTP_FORMAT',
        message: 'OTP must be a 6-digit number'
      });
    }

    const storedOTP = otpStore.get(email);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        code: 'OTP_NOT_FOUND',
        message: 'No OTP found for this email. Please request a new one.'
      });
    }

    if (new Date() > storedOTP.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        code: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (storedOTP.blockedUntil && new Date() < storedOTP.blockedUntil) {
      const minutesLeft = Math.ceil((storedOTP.blockedUntil - new Date()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        code: 'ACCOUNT_TEMPORARILY_LOCKED',
        message: `Too many failed attempts. Please try again in ${minutesLeft} minutes.`,
        retryAfter: Math.ceil((storedOTP.blockedUntil - new Date()) / 1000)
      });
    }

    if (storedOTP.otp !== otp) {
      console.log(`OTP validation failed for ${email}. Received: ${otp}, Expected: ${storedOTP.otp}`);
      storedOTP.attempts = (storedOTP.attempts || 0) + 1;
      
      if (storedOTP.attempts >= 3) {
        const blockedUntil = new Date();
        blockedUntil.setMinutes(blockedUntil.getMinutes() + 15);
        storedOTP.blockedUntil = blockedUntil;
        
        otpStore.set(email, storedOTP);
        
        return res.status(429).json({
          success: false,
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many failed attempts. Please try again in 15 minutes.',
          retryAfter: 900
        });
      }

      otpStore.set(email, storedOTP);
      
      return res.status(400).json({
        success: false,
        code: 'INVALID_OTP',
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: 3 - storedOTP.attempts
      });
    }

    otpStore.delete(email);

    console.log(`OTP verified successfully for ${email} (purpose: ${purpose})`);

    const token = jwt.sign(
      { email, purpose },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    try {
      switch (purpose) {
        case 'login':
          const user = await User.findOne({ email });
          if (!user) {
            return res.status(404).json({
              success: false,
              code: 'USER_NOT_FOUND',
              message: 'No account found with this email. Please register first.'
            });
          }
          
          const authToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: authToken,
            user: {
              id: user._id,
              email: user.email,
              name: user.name || email.split('@')[0]
            }
          });
          
        case 'registration':
          const newUser = await User.findOne({ email });
          if (!newUser) {
            return res.status(404).json({
              success: false,
              code: 'USER_NOT_FOUND',
              message: 'User not found. Please try registering again.'
            });
          }

          newUser.isVerified = true;
          await newUser.save();

          const registrationAuthToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            message: 'Account successfully registered! Welcome to Smart Green House System.',
            token: registrationAuthToken,
            user: {
              id: newUser._id,
              email: newUser.email,
              name: newUser.firstName
            }
          });
          
        case 'password_reset':
          return res.status(200).json({
            success: true,
            message: 'OTP verified. You can now reset your password.',
            token
          });
          
        default:
          return res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token
          });
      }
    } catch (error) {
      console.error('Error processing OTP verification:', error);
      return res.status(500).json({
        success: false,
        code: 'PROCESSING_ERROR',
        message: 'Error processing your request. Please try again.'
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.password = password;
      } else {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use. Please use a different email.'
        });
      }
    } else {
      user = new User({
        firstName,
        lastName,
        email,
        password,
        isVerified: false
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    otpStore.set(email, { otp, expiresAt });

    const emailResult = await emailService.sendEmail(email, 'otp', { otp });
    
    if (!emailResult || !emailResult.success) {
      console.error('Failed to send OTP email:', emailResult?.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Verification OTP sent to your email. Please verify to complete registration.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt with:', { email: email, passwordLength: password?.length });

    let user;
    if (email.includes('@')) {
      console.log('Searching by email:', email);
      user = await User.findOne({ email }).select('+password');
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      console.log('Searching by username:', escapedUsername);
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      }).select('+password');
    }
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your email for the verification link.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountId: user.accountId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountId: user.accountId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Generate and send password reset token
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email } = req.body;
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email });
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      });
    }

    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset code has been sent.' });
    }

    const resetToken = crypto.randomBytes(5).toString('hex').toUpperCase();
    const expireTime = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpire = expireTime;
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendEmail(user.email, 'password_reset', { resetCode: resetToken });
      res.status(200).json({ success: true, message: 'Password reset code sent successfully to your email.' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success: false, message: 'Failed to send password reset code. Please try again.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify the reset token
exports.verifyResetCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, code } = req.body;
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email }).select('+resetToken +resetTokenExpire');
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      }).select('+resetToken +resetTokenExpire');
    }

    if (!user || !user.resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    if (user.resetToken !== code || user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    res.status(200).json({ success: true, message: 'Code verified successfully.' });
  } catch (err) {
    console.error('Verify reset code error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset the password after successful verification
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, code, newPassword } = req.body;
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email }).select('+resetToken +resetTokenExpire');
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      }).select('+resetToken +resetTokenExpire');
    }

    if (!user || user.resetToken !== code || user.resetTokenExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please try again.' });
    }

    user.password = newPassword;

    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Complete registration with verified token
exports.completeRegistration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { registrationToken, firstName, lastName, password } = req.body;

    try {
      const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
      
      if (!decoded || decoded.purpose !== 'registration' || !decoded.verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid registration token'
        });
      }

      const email = decoded.email;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use. Please use a different email.'
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountId: user.accountId
        }
      });

    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired registration token'
      });
    }

  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_EMAIL',
        message: 'Email is required'
      });
    }

    if (otpStore.has(email)) {
      otpStore.delete(email);
      console.log(`Invalidated previous OTP for ${email}`);
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    otpStore.set(email, { otp, expiresAt });

    try {
      const emailResult = await emailService.sendEmail(email, 'otp', { otp });
      
      if (!emailResult || !emailResult.success) {
        console.error('Failed to resend OTP email:', emailResult?.error);
        return res.status(500).json({
          success: false,
          code: 'EMAIL_SEND_FAILED',
          message: 'Failed to resend OTP email. Please try again later.'
        });
      }

      console.log(`Resent OTP for ${email}, expires at ${expiresAt}`);
      
      return res.status(200).json({
        success: true,
        message: 'A new OTP has been sent successfully',
        expiresAt: expiresAt.toISOString()
      });

    } catch (emailError) {
      otpStore.delete(email);
      console.error('Error in resendOTP email service:', {
        email,
        error: emailError.message,
      });
      
      return res.status(500).json({
        success: false,
        code: 'EMAIL_SERVICE_ERROR',
        message: 'Failed to send OTP email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Unexpected error in resendOTP:', {
      error: error.message,
    });
    
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

// Resend password reset code
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email });
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      });
    }

    if (!user) {
      // We send a success response even if the user doesn't exist to prevent email enumeration attacks
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a new password reset code has been sent.' });
    }

    const resetToken = crypto.randomBytes(5).toString('hex').toUpperCase();
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpire = expireTime;
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendEmail(user.email, 'password_reset', { resetCode: resetToken });
      res.status(200).json({ success: true, message: 'A new password reset code has been sent to your email.' });
    } catch (emailError) {
      console.error('Failed to resend password reset email:', emailError);
      // Don't clear the token here, so the user can try again later
      res.status(500).json({ success: false, message: 'Failed to send password reset code. Please try again.' });
    }
  } catch (err) {
    console.error('Resend password reset code error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Resend password reset code
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email });
    } else {
      const escapedUsername = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        email: { $regex: `^${escapedUsername}@`, $options: 'i' }
      });
    }

    if (!user) {
      // We send a success response even if the user doesn't exist to prevent email enumeration attacks
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a new password reset code has been sent.' });
    }

    const resetToken = crypto.randomBytes(5).toString('hex').toUpperCase();
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpire = expireTime;
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendEmail(user.email, 'password_reset', { resetCode: resetToken });
      res.status(200).json({ success: true, message: 'A new password reset code has been sent to your email.' });
    } catch (emailError) {
      console.error('Failed to resend password reset email:', emailError);
      // Don't clear the token here, so the user can try again later
      res.status(500).json({ success: false, message: 'Failed to send password reset code. Please try again.' });
    }
  } catch (err) {
    console.error('Resend password reset code error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};