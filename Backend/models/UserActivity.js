const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  // Browsing history and behavior
  pageViews: [{
    url: String,
    title: String,
    timestamp: { type: Date, default: Date.now },
    timeSpent: Number, // seconds
    referrer: String
  }],
  searchHistory: [{
    query: String,
    results: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  // Product interactions
  productViews: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    timestamp: { type: Date, default: Date.now },
    timeSpent: Number
  }],
  wishlist: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now }
  }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    addedAt: { type: Date, default: Date.now }
  }],
  // Recommendations data
  recommendations: {
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    lastUpdated: { type: Date, default: Date.now }
  },
  // Location data
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Device and browser info
  device: {
    type: String,
    browser: String,
    os: String,
    screenResolution: String,
    userAgent: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
userActivitySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Indexes
userActivitySchema.index({ user: 1 });
userActivitySchema.index({ sessionId: 1 });
userActivitySchema.index({ 'productViews.product': 1 });
userActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
