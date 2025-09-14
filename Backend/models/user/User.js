const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [25, 'First name cannot be more than 25 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [25, 'Last name cannot be more than 25 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  passwordChangedAt: {
    type: Date,
  },
  accountId: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetToken: {
    type: String,
    select: false
  },
  resetTokenExpire: {
    type: Date,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  return next();
});

// Generate a unique 6-digit accountId for new users
userSchema.pre('validate', async function(next) {
  if (this.isNew && !this.accountId) {
    const generateId = () => Math.floor(100000 + Math.random() * 900000).toString();
    let candidate = generateId();
    // Ensure uniqueness with a few attempts
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await mongoose.model('User').findOne({ accountId: candidate }).lean();
      if (!exists) break;
      candidate = generateId();
    }
    this.accountId = candidate;
  }
  next();
});


// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);