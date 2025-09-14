const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Test OTP email endpoint
router.post('/test-otp-email', async (req, res) => {
  try {
    const { email = 'xirced334@gmail.com', otp = '123456', purpose = 'email_verification' } = req.body;
    
    console.log('Sending test OTP email to:', email);
        const result = await require('../services/emailService').sendOTPEmail(email, otp, purpose);
    
    console.log('Email service response:', result);
    res.json({
      success: true,
      message: 'Test OTP email sent',
      result
    });
  } catch (error) {
    console.error('Error sending test OTP email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test OTP email',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
