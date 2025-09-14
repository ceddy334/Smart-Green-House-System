require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user/User');
const Article = require('../models/content/Article');
const Category = require('../models/content/Category');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing old data...');
    await Article.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('Data cleared.');

    // --- Create Sample User ---
    console.log('Creating sample user...');
    const user = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sghs.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log(`Created user: ${user.email}`);

    // --- Create Sample Category ---
    console.log('Creating sample category...');
    const category = await Category.create({
      name: 'Technology',
      description: 'Articles about modern technology and innovation.',
      slug: 'technology',
      isActive: true
    });
    console.log(`Created category: ${category.name}`);

    // --- Create Sample Article ---
    console.log('Creating sample article...');
    const articleTitle = 'Getting Started with Smart Greenhouses';
    const article = new Article({
      title: articleTitle,
      slug: articleTitle.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      content: 'This is the full text of the article about smart greenhouses. It covers topics like IoT, automation, and sustainable agriculture.',
      excerpt: 'Learn how to get started with smart greenhouses and modern agricultural technology.',
      author: user._id,
      categories: [category._id],
      tags: ['iot', 'agriculture', 'automation'],
      featuredImage: '/images/smart-greenhouse.jpg',
      status: 'published',
      seoMeta: {
        metaTitle: 'Smart Greenhouses Guide | SGHS',
        metaDescription: 'Comprehensive guide to setting up and managing smart greenhouses with the latest technology.',
        keywords: ['smart greenhouse', 'iot', 'agriculture', 'automation']
      }
    });

    await article.save();
    console.log(`Created article: "${article.title}"`);
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase();