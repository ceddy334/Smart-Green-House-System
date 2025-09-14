const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset', 'login_verification'],
    default: 'email_verification'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Static method to generate OTP
otpSchema.statics.generateOTP = function(format = 'numeric', length = 6) {
  if (format === 'alphanumeric') {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  // Default 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP for email
otpSchema.statics.createOTP = async function(email, purpose = 'email_verification', format = 'numeric', length = 6) {
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose, isUsed: false });
  
  const otp = this.generateOTP(format, length);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  const otpDoc = new this({
    email,
    otp,
    purpose,
    expiresAt
  });
  
  return await otpDoc.save();
};

// Instance method to verify OTP
otpSchema.methods.verifyOTP = async function(inputOTP) {
  // Check if OTP is expired
  if (this.expiresAt < new Date()) {
    throw new Error('expired');
  }
  
  // Check if OTP is already used
  if (this.isUsed) {
    throw new Error('used');
  }
  
  // Check if max attempts exceeded
  if (this.attempts >= 3) {
    throw new Error('max_attempts');
  }
  
  // Increment attempts
  this.attempts += 1;
  
  // Check if OTP matches
  if (this.otp !== inputOTP) {
    await this.save();
    throw new Error('invalid');
  }
  
  // OTP is correct, delete it
  await this.deleteOne();
  
  return true;
};

module.exports = mongoose.model('OTP', otpSchema);
