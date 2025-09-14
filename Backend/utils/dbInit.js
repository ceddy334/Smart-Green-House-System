const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Media = require('../models/Media');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const UserActivity = require('../models/UserActivity');
const Analytics = require('../models/Analytics');
const SystemLog = require('../models/SystemLog');
const Newsletter = require('../models/Newsletter');
const SiteSettings = require('../models/SiteSettings');
const Tag = require('../models/Tag');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

/**
 * Initialize database with default data
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Create default admin user
    await createDefaultAdmin();
    
    // Create default categories
    await createDefaultCategories();
    
    // Create default tags
    await createDefaultTags();
    
    // Initialize site settings
    await initializeSiteSettings();
    
    // Create sample content
    await createSampleContent();
    
    console.log('✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create default admin user
 */
async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@sghs.com' });
    if (existingAdmin) {
      console.log('📝 Admin user already exists, skipping...');
      return;
    }

    // Don't hash password here - let the User model's pre-save hook handle it
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@sghs.com',
      password: 'admin123'  // Raw password - will be hashed by pre-save hook
    });

    await adminUser.save();
    console.log('👤 Default admin user created: admin@sghs.com / admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

/**
 * Create default categories
 */
async function createDefaultCategories() {
  try {
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('📂 Categories already exist, skipping...');
      return;
    }

    const categories = [
      {
        name: 'Greenhouse Technology',
        description: 'Latest technology and innovations in greenhouse systems',
        type: 'article'
      },
      {
        name: 'Plant Care',
        description: 'Tips and guides for plant care and cultivation',
        type: 'article'
      },
      {
        name: 'Automation Systems',
        description: 'Automated greenhouse control and monitoring systems',
        type: 'product'
      },
      {
        name: 'Sensors & Monitoring',
        description: 'Environmental sensors and monitoring equipment',
        type: 'product'
      },
      {
        name: 'Climate Control',
        description: 'Heating, cooling, and ventilation systems',
        type: 'product'
      },
      {
        name: 'Growing Supplies',
        description: 'Seeds, nutrients, and growing mediums',
        type: 'product'
      }
    ];

    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
    }

    console.log('📂 Default categories created');
    
  } catch (error) {
    console.error('Error creating categories:', error);
  }
}

/**
 * Create default tags
 */
async function createDefaultTags() {
  try {
    const existingTags = await Tag.countDocuments();
    if (existingTags > 0) {
      console.log('🏷️ Tags already exist, skipping...');
      return;
    }

    const tags = [
      { name: 'automation', color: '#4a90e2' },
      { name: 'sensors', color: '#27ae60' },
      { name: 'climate', color: '#e74c3c' },
      { name: 'monitoring', color: '#f39c12' },
      { name: 'hydroponics', color: '#9b59b6' },
      { name: 'organic', color: '#2ecc71' },
      { name: 'smart-farming', color: '#34495e' },
      { name: 'iot', color: '#3498db' }
    ];

    for (const tagData of tags) {
      const tag = new Tag(tagData);
      await tag.save();
    }

    console.log('🏷️ Default tags created');
    
  } catch (error) {
    console.error('Error creating tags:', error);
  }
}

/**
 * Initialize site settings
 */
async function initializeSiteSettings() {
  try {
    const existingSettings = await SiteSettings.findOne();
    if (existingSettings) {
      console.log('⚙️ Site settings already exist, skipping...');
      return;
    }

    const settings = new SiteSettings({
      siteName: 'Smart Green House System',
      siteDescription: 'Advanced greenhouse monitoring and control system for modern agriculture',
      seo: {
        metaTitle: 'Smart Green House System - Advanced Greenhouse Technology',
        metaDescription: 'Discover cutting-edge greenhouse automation, monitoring systems, and smart farming solutions for optimal plant growth.',
        keywords: ['greenhouse', 'automation', 'smart farming', 'hydroponics', 'plant monitoring']
      },
      contact: {
        email: 'info@sghs.com',
        phone: '+1-555-0123'
      },
      ecommerce: {
        currency: 'USD',
        taxRate: 0.08
      }
    });

    await settings.save();
    console.log('⚙️ Site settings initialized');
    
  } catch (error) {
    console.error('Error initializing site settings:', error);
  }
}

/**
 * Create sample content
 */
async function createSampleContent() {
  try {
    const admin = await User.findOne({ role: 'administrator' });
    if (!admin) {
      console.log('⚠️ No admin user found, skipping sample content creation');
      return;
    }

    // Create sample articles
    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      const categories = await Category.find({ type: 'article' }).limit(2);
      const tags = await Tag.find().limit(3);

      const sampleArticles = [
        {
          title: 'Getting Started with Smart Greenhouse Automation',
          slug: 'getting-started-smart-greenhouse-automation',
          content: 'Learn how to set up your first automated greenhouse system with sensors, controllers, and monitoring software...',
          excerpt: 'A comprehensive guide to setting up automated greenhouse systems for beginners.',
          author: admin._id,
          categories: categories.map(cat => cat._id),
          tags: tags.map(tag => tag._id),
          status: 'published',
          publishedAt: new Date()
        },
        {
          title: 'Optimizing Plant Growth with Environmental Monitoring',
          slug: 'optimizing-plant-growth-environmental-monitoring',
          content: 'Discover the key environmental factors that affect plant growth and how to monitor them effectively...',
          excerpt: 'Understanding environmental factors and monitoring techniques for optimal plant growth.',
          author: admin._id,
          categories: categories.slice(0, 1).map(cat => cat._id),
          tags: tags.slice(1, 3).map(tag => tag._id),
          status: 'published',
          publishedAt: new Date()
        }
      ];

      for (const articleData of sampleArticles) {
        const article = new Article(articleData);
        await article.save();
      }

      console.log('📄 Sample articles created');
    }

    // Create sample products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productCategories = await Category.find({ type: 'product' }).limit(3);
      const tags = await Tag.find().limit(4);

      const sampleProducts = [
        {
          name: 'Smart Temperature & Humidity Sensor',
          slug: 'smart-temperature-humidity-sensor',
          description: 'Wireless sensor for monitoring temperature and humidity levels in your greenhouse with real-time alerts.',
          sku: 'SGHS-TH-001',
          price: {
            regular: 89.99,
            sale: 79.99
          },
          inventory: {
            quantity: 50,
            lowStockThreshold: 10
          },
          categories: productCategories.slice(0, 2).map(cat => cat._id),
          tags: tags.slice(0, 3).map(tag => tag._id),
          specifications: {
            'Temperature Range': '-40°C to 80°C',
            'Humidity Range': '0% to 100% RH',
            'Wireless Range': 'Up to 100m',
            'Battery Life': '2 years'
          },
          status: 'active'
        },
        {
          name: 'Automated Irrigation Controller',
          slug: 'automated-irrigation-controller',
          description: 'Smart irrigation system with programmable schedules and soil moisture monitoring.',
          sku: 'SGHS-IRR-002',
          price: {
            regular: 249.99
          },
          inventory: {
            quantity: 25,
            lowStockThreshold: 5
          },
          categories: productCategories.slice(1, 3).map(cat => cat._id),
          tags: tags.slice(1, 4).map(tag => tag._id),
          specifications: {
            'Zones': '8 irrigation zones',
            'Power': '24V AC',
            'Connectivity': 'WiFi enabled',
            'App Control': 'iOS & Android'
          },
          status: 'active'
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
      }

      console.log('🛍️ Sample products created');
    }

  } catch (error) {
    console.error('Error creating sample content:', error);
  }
}

/**
 * Drop all collections (use with caution!)
 */
async function dropDatabase() {
  try {
    console.log('⚠️ Dropping all collections...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`🗑️ Dropped collection: ${collection.name}`);
    }
    
    console.log('✅ All collections dropped successfully!');
    
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    throw error;
  }
}

/**
 * Reset database (drop and reinitialize)
 */
async function resetDatabase() {
  try {
    await dropDatabase();
    await initializeDatabase();
    console.log('🔄 Database reset completed!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  dropDatabase,
  resetDatabase,
  createDefaultAdmin,
  createDefaultCategories,
  createDefaultTags,
  initializeSiteSettings,
  createSampleContent
};
