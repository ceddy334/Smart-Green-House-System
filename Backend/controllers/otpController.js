const OTP = require('../models/user/OTP');
const User = require('../models/user/User');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

// Send OTP to email
exports.sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, purpose = 'email_verification' } = req.body;

    // Check if user exists for email verification
    if (purpose === 'email_verification') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Check if user exists for password reset
    if (purpose === 'password_reset') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email'
        });
      }
    }

    // Create OTP
    const otpDoc = await OTP.createOTP(email, purpose);

    // Send OTP via email
    const emailResult = await emailService.sendEmail(email, 'otp', { otp: otpDoc.otp });

    if (!emailResult.success) {
      // If email fails, delete the OTP
      await OTP.findByIdAndDelete(otpDoc._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp, purpose = 'email_verification' } = req.body;

    // Find the OTP
    const otpDoc = await OTP.findOne({ 
      email, 
      purpose, 
      isUsed: false 
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify the OTP
    try {
      await otpDoc.verifyOTP(otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });

    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: verifyError.message
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, purpose = 'email_verification' } = req.body;

    // Check rate limiting (max 3 OTPs per email per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await OTP.countDocuments({
      email,
      purpose,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentOTPs >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting another OTP.'
      });
    }

    // Create new OTP
    const otpDoc = await OTP.createOTP(email, purpose);

    // Send OTP via email
    const emailResult = await emailService.sendEmail(email, 'otp', { otp: otpDoc.otp });

    if (!emailResult.success) {
      await OTP.findByIdAndDelete(otpDoc._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully to your email',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
};

// Verify OTP and complete registration
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp, firstName, lastName, password } = req.body;

    // Verify OTP first
    const otpDoc = await OTP.findOne({ 
      email, 
      purpose: 'email_verification', 
      isUsed: false 
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    try {
      await otpDoc.verifyOTP(otp);
    } catch (verifyError) {
      return res.status(400).json({
        success: false,
        message: verifyError.message
      });
    }

    // Create user after OTP verification
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
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

  } catch (error) {
    console.error('Verify OTP and register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Get OTP status
exports.getOTPStatus = async (req, res) => {
  try {
    const { email, purpose = 'email_verification' } = req.query;

    const otpDoc = await OTP.findOne({ 
      email, 
      purpose, 
      isUsed: false 
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(404).json({
        success: false,
        message: 'No active OTP found'
      });
    }

    const timeLeft = Math.max(0, Math.floor((otpDoc.expiresAt - new Date()) / 1000));

    res.status(200).json({
      success: true,
      data: {
        email: otpDoc.email,
        purpose: otpDoc.purpose,
        attempts: otpDoc.attempts,
        timeLeft: timeLeft,
        expiresAt: otpDoc.expiresAt
      }
    });

  } catch (error) {
    console.error('Get OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting OTP status'
    });
  }
};
