# Smart Green House System - API Documentation

## Overview
This document provides comprehensive API documentation for the Smart Green House System backend, including all endpoints for user management, authentication, content management, and e-commerce functionality.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user (creates pending account).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "accountId": "123456"
  }
}
```

### POST /auth/login
Login with email/username and password.

**Request Body:**
```json
{
  "email": "john@example.com", // or just "john" for username
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "accountId": "123456",
    "role": "customer",
    "accountStatus": "active",
    "lastLogin": "2025-01-10T12:00:00.000Z"
  }
}
```

### GET /auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "accountId": "123456",
    "role": "customer",
    "avatar": null,
    "bio": "",
    "phone": null,
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zipCode": "",
      "country": ""
    },
    "preferences": {
      "theme": "light",
      "language": "en",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    },
    "accountStatus": "active",
    "isVerified": true,
    "lastLogin": "2025-01-10T12:00:00.000Z",
    "loginCount": 5,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## OTP Endpoints

### POST /otp/send
Send OTP for email verification.

**Request Body:**
```json
{
  "email": "john@example.com",
  "purpose": "registration"
}
```

### POST /otp/verify-and-register
Verify OTP and complete user registration.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

---

## User Management Endpoints (Admin Only)

### GET /users
Get all users with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by account status
- `role` (string): Filter by user role
- `search` (string): Search in name, email, accountId

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "accountId": "123456",
      "role": "customer",
      "accountStatus": "active",
      "registrationSource": "website",
      "registrationIP": "192.168.1.1",
      "emailVerifiedAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-01-10T12:00:00.000Z",
      "loginCount": 5,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### GET /users/stats
Get user statistics for dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 100,
      "activeUsers": 85,
      "pendingUsers": 10,
      "suspendedUsers": 5,
      "verifiedUsers": 90
    },
    "registrationSources": [
      { "_id": "website", "count": 80 },
      { "_id": "mobile_app", "count": 15 },
      { "_id": "admin_created", "count": 5 }
    ],
    "recentRegistrations": 25
  }
}
```

### GET /users/activities
Get recent user activities.

**Query Parameters:**
- `limit` (number): Number of activities to return (default: 20)

### GET /users/:id
Get user by ID.

### GET /users/account/:accountId
Get user by account ID.

### PUT /users/:id/status
Update user account status.

**Request Body:**
```json
{
  "status": "active" // pending, active, suspended, deactivated
}
```

---

## Content Management Endpoints

### Articles

#### GET /articles
Get all articles with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (draft, published)
- `category`: Filter by category ID
- `author`: Filter by author ID
- `search`: Search in title and content

#### POST /articles
Create new article (requires editor/admin role).

**Request Body:**
```json
{
  "title": "Article Title",
  "content": "Article content...",
  "excerpt": "Short description",
  "categories": ["category_id_1", "category_id_2"],
  "tags": ["tag_id_1", "tag_id_2"],
  "featuredImage": "image_url",
  "status": "published",
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "keywords": ["keyword1", "keyword2"]
  }
}
```

#### GET /articles/:id
Get article by ID.

#### PUT /articles/:id
Update article (requires author/admin role).

#### DELETE /articles/:id
Delete article (requires author/admin role).

### Categories

#### GET /categories
Get all categories.

#### POST /categories
Create new category (requires admin role).

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "type": "article", // article, product, general
  "parentCategory": "parent_category_id", // optional
  "image": "image_url" // optional
}
```

### Tags

#### GET /tags
Get all tags.

#### POST /tags
Create new tag (requires editor/admin role).

**Request Body:**
```json
{
  "name": "tag-name",
  "description": "Tag description",
  "color": "#4a90e2"
}
```

---

## E-commerce Endpoints

### Products

#### GET /products
Get all products with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category
- `status`: Filter by status (active, inactive)
- `search`: Search in name and description
- `minPrice`, `maxPrice`: Price range filter

#### POST /products
Create new product (requires admin role).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "sku": "PROD-001",
  "price": {
    "regular": 99.99,
    "sale": 79.99
  },
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 10
  },
  "categories": ["category_id"],
  "tags": ["tag_id"],
  "images": [
    {
      "url": "image_url",
      "alt": "Image description",
      "isPrimary": true
    }
  ],
  "specifications": {
    "Weight": "1kg",
    "Dimensions": "10x10x10cm"
  }
}
```

#### GET /products/:id
Get product by ID.

#### PUT /products/:id
Update product (requires admin role).

### Orders

#### GET /orders
Get user's orders (or all orders for admin).

#### POST /orders
Create new order.

**Request Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "billing": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "country": "Country"
    }
  },
  "shipping": {
    "method": "standard",
    "cost": 9.99,
    "address": {
      // same structure as billing
    }
  },
  "payment": {
    "method": "credit_card",
    "transactionId": "txn_123"
  }
}
```

### Cart

#### GET /cart
Get user's cart.

#### POST /cart/add
Add item to cart.

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

#### PUT /cart/update
Update cart item quantity.

#### DELETE /cart/remove/:productId
Remove item from cart.

### Wishlist

#### GET /wishlist
Get user's wishlist.

#### POST /wishlist/add
Add item to wishlist.

#### DELETE /wishlist/remove/:productId
Remove item from wishlist.

---

## Interactive Features

### Comments

#### GET /comments
Get comments for an article/product.

**Query Parameters:**
- `targetType`: "Article" or "Product"
- `targetId`: ID of the article/product

#### POST /comments
Create new comment.

**Request Body:**
```json
{
  "content": "Comment content",
  "targetType": "Article",
  "targetId": "article_id",
  "parentComment": "parent_comment_id" // optional for replies
}
```

### Reviews

#### GET /reviews
Get reviews for a product/article.

#### POST /reviews
Create new review.

**Request Body:**
```json
{
  "title": "Review title",
  "content": "Review content",
  "rating": 5,
  "targetType": "Product",
  "targetId": "product_id",
  "images": [
    {
      "url": "image_url",
      "caption": "Image caption"
    }
  ]
}
```

---

## System Endpoints

### Site Settings

#### GET /settings
Get site settings (public settings only for non-admin).

#### PUT /settings
Update site settings (requires admin role).

### Analytics

#### GET /analytics/overview
Get analytics overview (requires admin role).

#### GET /analytics/users
Get user analytics (requires admin role).

#### GET /analytics/content
Get content performance analytics (requires admin role).

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // optional
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Data Validation

All endpoints include comprehensive data validation:
- Required fields validation
- Data type validation
- Length and format constraints
- Business logic validation

## Security Features

- JWT token authentication
- Role-based access control
- Account lockout after failed attempts
- IP address tracking
- Request rate limiting
- Input sanitization
- CORS protection
