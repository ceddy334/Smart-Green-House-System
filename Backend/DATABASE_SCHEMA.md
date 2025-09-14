# Smart Green House System - Database Schema Documentation

## Overview
This document outlines the comprehensive database schema for the Smart Green House System, designed to support a full-featured website with content management, e-commerce, user interaction, and analytics capabilities.

## Database Models

### 1. User Management

#### User Model (`User.js`)
**Purpose**: Enhanced user management with roles, preferences, and activity tracking
- **Core Fields**: firstName, lastName, email, password, accountId
- **Enhanced Features**: 
  - Role-based access (customer, editor, administrator, moderator)
  - User preferences (theme, language, notifications, privacy)
  - Profile information (avatar, bio, phone, address)
  - Activity tracking (lastLogin, loginCount, isActive, isVerified)

#### OTP Model (`OTP.js`)
**Purpose**: Email verification and password reset functionality
- **Features**: 6-digit OTP codes, expiration handling, attempt limiting

### 2. Website Content

#### Article Model (`Article.js`)
**Purpose**: Blog posts, news articles, and educational content
- **Content Fields**: title, slug, content, excerpt, featuredImage
- **Metadata**: author, categories, tags, publishedAt, views, likes
- **SEO**: metaTitle, metaDescription, keywords
- **Features**: Draft/published status, reading time calculation

#### Category Model (`Category.js`)
**Purpose**: Hierarchical content organization
- **Features**: Parent-child relationships, slug generation, sorting

#### Media Model (`Media.js`)
**Purpose**: File management for images, videos, documents
- **Features**: File metadata, thumbnails, usage tracking, tagging

### 3. E-commerce System

#### Product Model (`Product.js`)
**Purpose**: Product catalog management
- **Core Fields**: name, description, SKU, price (regular/sale)
- **Inventory**: quantity tracking, low stock alerts
- **Media**: multiple images with primary designation
- **Features**: Specifications, ratings, sales tracking

#### Order Model (`Order.js`)
**Purpose**: Complete order management system
- **Customer Data**: billing and shipping addresses
- **Order Items**: products, quantities, prices
- **Payment**: method, status, transaction tracking
- **Fulfillment**: shipping method, tracking, status updates

### 4. Interactive Elements

#### Comment Model (`Comment.js`)
**Purpose**: User comments on articles and products
- **Features**: Threaded replies, moderation, like/dislike system
- **Polymorphic**: Works with articles, products, and nested comments

#### Review Model (`Review.js`)
**Purpose**: Product and content reviews with ratings
- **Features**: 1-5 star ratings, verified purchases, helpful votes
- **Media**: Review images, moderation system

### 5. Personalization & Analytics

#### UserActivity Model (`UserActivity.js`)
**Purpose**: User behavior tracking for personalization
- **Tracking**: page views, search history, product interactions
- **Personalization**: wishlist, cart, recommendations
- **Technical**: device info, location data, session tracking

#### Analytics Model (`Analytics.js`)
**Purpose**: Website performance and business metrics
- **Metrics**: page views, user behavior, sales data
- **Segmentation**: traffic sources, device stats, geographic data
- **Content Performance**: article/product engagement metrics

### 6. System Configuration

#### SiteSettings Model (`SiteSettings.js`)
**Purpose**: Centralized website configuration
- **Appearance**: theme colors, logos, branding
- **SEO**: meta tags, analytics IDs, social media links
- **E-commerce**: currency, tax rates, payment methods
- **Features**: toggles for registration, comments, maintenance mode

#### SystemLog Model (`SystemLog.js`)
**Purpose**: System monitoring and debugging
- **Log Levels**: error, warn, info, debug
- **Categories**: auth, payment, email, security, user actions
- **Metadata**: user info, request details, performance metrics
- **Auto-cleanup**: 30-day TTL for log retention

### 7. Marketing & Communication

#### Newsletter Model (`Newsletter.js`)
**Purpose**: Email marketing and subscriber management
- **Subscriber Data**: email, preferences, verification status
- **Segmentation**: categories, frequency preferences
- **Tracking**: subscription source, email delivery status

## Database Relationships

### Primary Relationships
- **User → Articles**: One-to-many (author relationship)
- **User → Orders**: One-to-many (customer orders)
- **User → Comments/Reviews**: One-to-many (user-generated content)
- **Product → Categories**: Many-to-many (product categorization)
- **Order → Products**: Many-to-many (order items)
- **Article → Categories**: Many-to-many (content categorization)

### Polymorphic Relationships
- **Comments**: Can reference Articles, Products, or other Comments
- **Reviews**: Can reference Products or Articles
- **Analytics**: Tracks metrics for various content types

## Indexing Strategy

### Performance Indexes
- **User**: email, accountId, role, lastLogin
- **Article**: slug, author, categories, status, publishedAt
- **Product**: slug, SKU, categories, status, price
- **Order**: orderNumber, customer, status, createdAt
- **Analytics**: date-based indexes for time-series queries

### Search Indexes
- **Text Search**: Articles (title, content), Products (name, description)
- **Geographic**: UserActivity location data
- **Composite**: Multi-field indexes for complex queries

## Data Security & Privacy

### Sensitive Data Handling
- **Passwords**: Bcrypt hashing with salt
- **Personal Data**: GDPR-compliant user preferences
- **Payment Info**: Tokenized storage (external processor integration)
- **Audit Trail**: System logs for security monitoring

### Access Control
- **Role-based Permissions**: Customer, Editor, Administrator, Moderator
- **Data Isolation**: User-specific data access controls
- **Session Management**: Secure session handling with timeouts

## Scalability Considerations

### Performance Optimization
- **Pagination**: Built-in support for large datasets
- **Caching Strategy**: Frequently accessed data optimization
- **Archive Strategy**: Automated cleanup for logs and old data

### Growth Planning
- **Horizontal Scaling**: Sharding-ready design
- **Data Partitioning**: Time-based partitioning for analytics
- **CDN Integration**: Media file distribution support

## Implementation Notes

### MongoDB Features Used
- **Schema Validation**: Mongoose schema enforcement
- **Middleware**: Pre/post hooks for data processing
- **Aggregation**: Complex analytics queries
- **TTL Indexes**: Automatic data cleanup

### Best Practices Implemented
- **Consistent Naming**: Uniform field naming conventions
- **Validation**: Comprehensive data validation rules
- **Error Handling**: Graceful error management
- **Documentation**: Inline code documentation

This schema provides a solid foundation for a modern, scalable web application with comprehensive functionality for content management, e-commerce, user engagement, and business analytics.
