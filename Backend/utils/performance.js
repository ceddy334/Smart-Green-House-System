const mongoose = require('mongoose');

/**
 * Database Performance Optimization Utilities
 */
class PerformanceOptimizer {
  
  /**
   * Create compound indexes for better query performance
   */
  static async createOptimizedIndexes() {
    try {
      console.log('🔧 Creating optimized database indexes...');
      
      // User collection indexes
      const User = mongoose.model('User');
      await User.collection.createIndex({ email: 1, accountStatus: 1 });
      await User.collection.createIndex({ role: 1, isActive: 1 });
      await User.collection.createIndex({ lastLogin: -1, accountStatus: 1 });
      await User.collection.createIndex({ createdAt: -1, registrationSource: 1 });
      
      // Article collection indexes
      const Article = mongoose.model('Article');
      await Article.collection.createIndex({ status: 1, publishedAt: -1 });
      await Article.collection.createIndex({ author: 1, status: 1 });
      await Article.collection.createIndex({ categories: 1, status: 1 });
      await Article.collection.createIndex({ tags: 1, publishedAt: -1 });
      await Article.collection.createIndex({ 
        title: 'text', 
        content: 'text', 
        excerpt: 'text' 
      }, { 
        weights: { title: 10, excerpt: 5, content: 1 },
        name: 'article_text_search'
      });
      
      // Product collection indexes
      const Product = mongoose.model('Product');
      await Product.collection.createIndex({ status: 1, 'price.regular': 1 });
      await Product.collection.createIndex({ categories: 1, status: 1 });
      await Product.collection.createIndex({ 'inventory.quantity': 1, status: 1 });
      await Product.collection.createIndex({ 
        name: 'text', 
        description: 'text' 
      }, { 
        weights: { name: 10, description: 1 },
        name: 'product_text_search'
      });
      
      // Order collection indexes
      const Order = mongoose.model('Order');
      await Order.collection.createIndex({ customer: 1, createdAt: -1 });
      await Order.collection.createIndex({ status: 1, createdAt: -1 });
      await Order.collection.createIndex({ 'payment.status': 1, createdAt: -1 });
      
      // Comment collection indexes
      const Comment = mongoose.model('Comment');
      await Comment.collection.createIndex({ targetType: 1, targetId: 1, createdAt: -1 });
      await Comment.collection.createIndex({ author: 1, status: 1 });
      
      // Review collection indexes
      const Review = mongoose.model('Review');
      await Review.collection.createIndex({ targetType: 1, targetId: 1, rating: -1 });
      await Review.collection.createIndex({ author: 1, status: 1 });
      
      // Analytics collection indexes (time-series optimized)
      const Analytics = mongoose.model('Analytics');
      await Analytics.collection.createIndex({ 'pageViews.date': -1, 'pageViews.url': 1 });
      await Analytics.collection.createIndex({ 'userMetrics.date': -1 });
      await Analytics.collection.createIndex({ 'salesMetrics.date': -1 });
      
      // SystemLog collection indexes
      const SystemLog = mongoose.model('SystemLog');
      await SystemLog.collection.createIndex({ level: 1, createdAt: -1 });
      await SystemLog.collection.createIndex({ category: 1, createdAt: -1 });
      await SystemLog.collection.createIndex({ userId: 1, createdAt: -1 });
      
      console.log('✅ Optimized indexes created successfully');
      
    } catch (error) {
      console.error('❌ Error creating optimized indexes:', error);
      throw error;
    }
  }
  
  /**
   * Analyze and report on collection statistics
   */
  static async analyzeCollectionStats() {
    try {
      console.log('📊 Analyzing collection statistics...');
      
      const collections = [
        'users', 'articles', 'products', 'orders', 
        'comments', 'reviews', 'analytics', 'systemlogs'
      ];
      
      const stats = {};
      
      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const collStats = await collection.stats();
          
          stats[collectionName] = {
            count: collStats.count,
            size: Math.round(collStats.size / 1024) + ' KB',
            avgObjSize: Math.round(collStats.avgObjSize) + ' bytes',
            indexes: collStats.nindexes,
            indexSize: Math.round(collStats.totalIndexSize / 1024) + ' KB'
          };
        } catch (error) {
          stats[collectionName] = { error: 'Collection not found or empty' };
        }
      }
      
      console.log('📈 Collection Statistics:');
      console.table(stats);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Error analyzing collection stats:', error);
      throw error;
    }
  }
  
  /**
   * Clean up old data based on TTL and retention policies
   */
  static async cleanupOldData() {
    try {
      console.log('🧹 Cleaning up old data...');
      
      // Clean up old system logs (older than 90 days)
      const SystemLog = mongoose.model('SystemLog');
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const deletedLogs = await SystemLog.deleteMany({ 
        createdAt: { $lt: ninetyDaysAgo } 
      });
      
      // Clean up old analytics data (older than 2 years)
      const Analytics = mongoose.model('Analytics');
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      const deletedAnalytics = await Analytics.deleteMany({ 
        createdAt: { $lt: twoYearsAgo } 
      });
      
      // Clean up expired OTPs
      const OTP = mongoose.model('OTP');
      const deletedOTPs = await OTP.deleteMany({ 
        expiresAt: { $lt: new Date() } 
      });
      
      console.log(`🗑️ Cleanup completed:
        - Deleted ${deletedLogs.deletedCount} old system logs
        - Deleted ${deletedAnalytics.deletedCount} old analytics records
        - Deleted ${deletedOTPs.deletedCount} expired OTPs`);
      
      return {
        systemLogs: deletedLogs.deletedCount,
        analytics: deletedAnalytics.deletedCount,
        otps: deletedOTPs.deletedCount
      };
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }
  
  /**
   * Optimize database performance
   */
  static async optimizeDatabase() {
    try {
      console.log('⚡ Starting database optimization...');
      
      // Create optimized indexes
      await this.createOptimizedIndexes();
      
      // Analyze current performance
      const stats = await this.analyzeCollectionStats();
      
      // Clean up old data
      const cleanup = await this.cleanupOldData();
      
      // Compact collections (MongoDB specific)
      if (mongoose.connection.db.admin) {
        try {
          await mongoose.connection.db.admin().command({ compact: 'users' });
          await mongoose.connection.db.admin().command({ compact: 'articles' });
          await mongoose.connection.db.admin().command({ compact: 'products' });
          console.log('🗜️ Database compaction completed');
        } catch (compactError) {
          console.log('ℹ️ Database compaction skipped (requires admin privileges)');
        }
      }
      
      console.log('✅ Database optimization completed successfully');
      
      return {
        indexesCreated: true,
        stats,
        cleanup,
        optimizationComplete: true
      };
      
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
      throw error;
    }
  }
  
  /**
   * Monitor query performance
   */
  static enableQueryProfiling() {
    // Enable Mongoose debug mode in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`🔍 Query: ${collectionName}.${method}`, {
          query: JSON.stringify(query),
          doc: doc ? JSON.stringify(doc).substring(0, 100) + '...' : undefined
        });
      });
    }
  }
  
  /**
   * Get slow query recommendations
   */
  static async getPerformanceRecommendations() {
    try {
      const recommendations = [];
      
      // Check for collections without proper indexes
      const User = mongoose.model('User');
      const userCount = await User.countDocuments();
      if (userCount > 1000) {
        recommendations.push({
          type: 'index',
          collection: 'users',
          suggestion: 'Consider adding compound indexes for frequently queried fields',
          priority: 'medium'
        });
      }
      
      // Check for large collections
      const Article = mongoose.model('Article');
      const articleCount = await Article.countDocuments();
      if (articleCount > 10000) {
        recommendations.push({
          type: 'pagination',
          collection: 'articles',
          suggestion: 'Implement cursor-based pagination for better performance',
          priority: 'high'
        });
      }
      
      // Check for old data
      const SystemLog = mongoose.model('SystemLog');
      const oldLogsCount = await SystemLog.countDocuments({
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      if (oldLogsCount > 10000) {
        recommendations.push({
          type: 'cleanup',
          collection: 'systemlogs',
          suggestion: 'Set up automated cleanup for old system logs',
          priority: 'medium'
        });
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      return [];
    }
  }
}

module.exports = PerformanceOptimizer;
