const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Page analytics
  pageViews: {
    url: { type: String, required: true },
    title: String,
    views: { type: Number, default: 1 },
    uniqueViews: { type: Number, default: 1 },
    bounceRate: { type: Number, default: 0 },
    avgTimeOnPage: { type: Number, default: 0 }, // seconds
    date: { type: Date, required: true }
  },
  
  // User behavior
  userMetrics: {
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 },
    sessionsPerUser: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
    date: { type: Date, required: true }
  },
  
  // E-commerce analytics
  salesMetrics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    abandonedCarts: { type: Number, default: 0 },
    date: { type: Date, required: true }
  },
  
  // Content performance
  contentMetrics: {
    targetType: { type: String, enum: ['Article', 'Product'] },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'contentMetrics.targetType' },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    date: { type: Date, required: true }
  },
  
  // Traffic sources
  trafficSources: {
    source: { type: String, required: true }, // organic, direct, social, referral, paid
    medium: String, // search, email, cpc, etc.
    campaign: String,
    sessions: { type: Number, default: 1 },
    users: { type: Number, default: 1 },
    date: { type: Date, required: true }
  },
  
  // Device and browser stats
  deviceStats: {
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    browser: String,
    os: String,
    sessions: { type: Number, default: 1 },
    date: { type: Date, required: true }
  },
  
  // Geographic data
  geoStats: {
    country: String,
    region: String,
    city: String,
    sessions: { type: Number, default: 1 },
    users: { type: Number, default: 1 },
    date: { type: Date, required: true }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
analyticsSchema.index({ 'pageViews.url': 1, 'pageViews.date': 1 });
analyticsSchema.index({ 'userMetrics.date': 1 });
analyticsSchema.index({ 'salesMetrics.date': 1 });
analyticsSchema.index({ 'contentMetrics.targetType': 1, 'contentMetrics.targetId': 1, 'contentMetrics.date': 1 });
analyticsSchema.index({ 'trafficSources.source': 1, 'trafficSources.date': 1 });
analyticsSchema.index({ 'deviceStats.deviceType': 1, 'deviceStats.date': 1 });
analyticsSchema.index({ 'geoStats.country': 1, 'geoStats.date': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
