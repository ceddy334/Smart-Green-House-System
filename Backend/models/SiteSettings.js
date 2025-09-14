const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  // General site settings
  siteName: {
    type: String,
    required: true,
    default: 'Smart Green House System'
  },
  siteDescription: {
    type: String,
    default: 'Advanced greenhouse monitoring and control system'
  },
  siteUrl: {
    type: String,
    default: 'https://localhost:3000'
  },
  logo: {
    type: String, // URL to logo
    default: null
  },
  favicon: {
    type: String, // URL to favicon
    default: null
  },
  
  // Theme and appearance
  theme: {
    primaryColor: { type: String, default: '#4a90e2' },
    secondaryColor: { type: String, default: '#357abd' },
    accentColor: { type: String, default: '#27ae60' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#333333' },
    fontFamily: { type: String, default: 'Arial, sans-serif' }
  },
  
  // SEO settings
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    googleAnalyticsId: String,
    googleTagManagerId: String,
    facebookPixelId: String
  },
  
  // Social media links
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  
  // Contact information
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // E-commerce settings
  ecommerce: {
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0 },
    shippingMethods: [{
      name: String,
      cost: Number,
      description: String,
      estimatedDays: Number
    }],
    paymentMethods: [{
      name: String,
      enabled: { type: Boolean, default: true },
      config: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Email settings
  email: {
    fromName: { type: String, default: 'Smart Green House System' },
    fromEmail: String,
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    templates: {
      welcome: String,
      orderConfirmation: String,
      passwordReset: String
    }
  },
  
  // Feature toggles
  features: {
    enableRegistration: { type: Boolean, default: true },
    enableComments: { type: Boolean, default: true },
    enableReviews: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableCart: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  },
  
  // Content settings
  content: {
    postsPerPage: { type: Number, default: 10 },
    productsPerPage: { type: Number, default: 12 },
    allowGuestComments: { type: Boolean, default: false },
    moderateComments: { type: Boolean, default: true },
    autoApproveReviews: { type: Boolean, default: false }
  },
  
  // Security settings
  security: {
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDuration: { type: Number, default: 15 }, // minutes
    sessionTimeout: { type: Number, default: 60 }, // minutes
    requireEmailVerification: { type: Boolean, default: true },
    enableTwoFactor: { type: Boolean, default: false }
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Only allow one settings document
siteSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update timestamp
siteSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
