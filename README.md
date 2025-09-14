# Smart Green House System (SGHS)

A comprehensive IoT dashboard and e-commerce platform for greenhouse management with React frontend, Node.js backend, and React Native mobile app.

## 🌱 Features

### 🔐 Authentication & User Management
- ✅ User Registration and Login (Email/Username support)
- ✅ JWT-based Authentication
- ✅ Password Reset with OTP verification
- ✅ Role-based Access Control (Customer, Editor, Administrator, Moderator)
- ✅ User Profile Management

### 📊 IoT Dashboard
- ✅ Real-time Greenhouse Monitoring
- ✅ Sensor Data Visualization
- ✅ Environmental Controls
- ✅ Analytics and Reporting

### 🛒 E-commerce Platform
- ✅ Product Catalog Management
- ✅ Shopping Cart & Wishlist
- ✅ Order Management System
- ✅ Payment Integration Ready

### 📱 Content Management
- ✅ Blog Posts & Articles
- ✅ Media Management
- ✅ Category & Tag System
- ✅ User Comments & Reviews

### 📧 Communication
- ✅ Email Notifications
- ✅ Newsletter Subscription
- ✅ System Notifications

## 🚀 Tech Stack

### Frontend (Web)
- React 19.1.1
- React Router DOM 7.8.2
- Axios for API calls
- Modern CSS with responsive design

### Backend (API)
- Node.js with Express.js 5.1.0
- MongoDB with Mongoose 8.18.0
- JWT Authentication
- bcryptjs for password hashing
- Nodemailer for email services
- Express-validator for input validation
- Security middleware (Helmet, Rate Limiting, CORS)

### Mobile App
- React Native with Expo
- Cross-platform iOS/Android support

### Database
- MongoDB with comprehensive schema
- User management, Content, E-commerce, Analytics models
- Optimized indexing and validation

## 📋 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SGHS.git
   cd SGHS
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   npm run setup    # Creates .env file and initializes database
   npm run dev      # Start development server
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start        # Start React development server
   ```

4. **Mobile App Setup**
   ```bash
   cd mobile
   npm install
   expo start       # Start Expo development server
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Mobile: Scan QR code with Expo Go app

## 🔧 Environment Variables

Create a `.env` file in the Backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/sghs_database

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Smart Green House System <noreply@sghs.com>
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile (protected)

### IoT Dashboard
- `GET /api/greenhouse/sensors` - Get sensor data
- `POST /api/greenhouse/controls` - Update greenhouse controls
- `GET /api/greenhouse/analytics` - Get analytics data

### E-commerce
- `GET /api/products` - Get products
- `POST /api/cart` - Add to cart
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Content Management
- `GET /api/articles` - Get blog articles
- `POST /api/articles` - Create article (protected)
- `GET /api/categories` - Get categories

## 🏗️ Project Structure

```
SGHS/
├── Backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   │   ├── user/          # User management models
│   │   ├── content/       # Content management models
│   │   └── ecommerce/     # E-commerce models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React web application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── assets/        # Static assets
│   └── public/            # Public files
├── mobile/                # React Native mobile app
│   ├── src/
│   │   └── screens/       # Mobile screens
│   └── assets/            # Mobile assets
└── docs/                  # Documentation
```

## 🔒 Security Features

- Password hashing with bcryptjs (salt rounds: 12)
- JWT token authentication with secure secrets
- Rate limiting (100 requests per 15 minutes)
- CORS protection with whitelist
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🧪 Default Credentials

**Admin User:**
- Email: admin@sghs.com
- Username: admin
- Password: admin123

## 🚀 Development Scripts

### Backend
```bash
npm run dev          # Start with nodemon
npm run start        # Production start
npm run setup        # Initialize environment and database
npm run seed         # Seed database with sample data
```

### Frontend
```bash
npm start            # Development server
npm run build        # Production build
npm test             # Run tests
```

### Mobile
```bash
expo start           # Start Expo development server
expo build:android   # Build Android APK
expo build:ios       # Build iOS IPA
```

## 📊 Database Schema

The system includes comprehensive models for:
- **User Management**: Users, roles, preferences, activity tracking
- **Content Management**: Articles, categories, media, tags, comments
- **E-commerce**: Products, orders, cart, wishlist, reviews
- **IoT Dashboard**: Sensor data, greenhouse controls, analytics
- **System**: Notifications, settings, logs, newsletters

## 🌐 Deployment

### Production Checklist
1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use secure JWT secrets
4. Configure MongoDB Atlas
5. Set up email service (Gmail/SendGrid)
6. Build frontend: `npm run build`
7. Deploy to cloud platform (Heroku, AWS, DigitalOcean)

### Mobile App Deployment
1. Build production APK/IPA
2. Submit to Google Play Store / Apple App Store
3. Configure push notifications
4. Set up analytics tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@sghs.com
- Documentation: [Wiki](https://github.com/yourusername/SGHS/wiki)
- Issues: [GitHub Issues](https://github.com/yourusername/SGHS/issues)

---

**Smart Green House System** - Revolutionizing greenhouse management through IoT and modern web technologies. 🌱