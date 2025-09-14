# Smart Green House System - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Smart Green House System to production environments.

## Prerequisites

### System Requirements
- **Node.js**: Version 16.x or higher
- **MongoDB**: Version 5.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: HTTPS support for production

### Required Services
- **Email Service**: Gmail SMTP or alternative email provider
- **Database**: MongoDB Atlas (recommended) or self-hosted MongoDB
- **SSL Certificate**: For HTTPS in production
- **Domain**: Registered domain name for production deployment

## Environment Configuration

### Backend Environment Variables (.env)
```bash
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sghs_production

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Additional Services
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend Environment Variables (.env)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

## Database Setup

### 1. MongoDB Atlas (Recommended)
```bash
# Create MongoDB Atlas cluster
1. Sign up at https://www.mongodb.com/atlas
2. Create a new cluster
3. Configure network access (whitelist your server IP)
4. Create database user with read/write permissions
5. Get connection string and update MONGO_URI
```

### 2. Initialize Database
```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Initialize database with sample data
node scripts/init-db.js

# Optimize database performance
node scripts/optimize-db.js --full
```

## Backend Deployment

### 1. Prepare for Production
```bash
# Install production dependencies
npm ci --only=production

# Run security audit
npm audit fix

# Create production build (if applicable)
npm run build
```

### 2. Process Management (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'sghs-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Frontend Deployment

### 1. Build for Production
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci

# Create production build
npm run build

# The build folder contains the production-ready files
```

### 2. Static File Hosting Options

#### Option A: Nginx Static Hosting
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    root /path/to/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Option B: Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=build
```

**netlify.toml:**
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  REACT_APP_API_URL = "https://api.yourdomain.com"
```

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs sghs-backend

# Application metrics
pm2 install pm2-server-monit
```

### 2. Database Monitoring
```javascript
// Add to your monitoring script
const mongoose = require('mongoose');

setInterval(async () => {
  const stats = await mongoose.connection.db.stats();
  console.log('DB Stats:', {
    collections: stats.collections,
    dataSize: Math.round(stats.dataSize / 1024 / 1024) + 'MB',
    indexSize: Math.round(stats.indexSize / 1024 / 1024) + 'MB'
  });
}, 300000); // Every 5 minutes
```

### 3. Log Rotation
```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/sghs

# Configuration:
/path/to/sghs/Backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Security Checklist

### Backend Security
- [ ] Environment variables properly configured
- [ ] JWT secret is strong and unique
- [ ] Rate limiting enabled
- [ ] Input validation and sanitization
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Database connection secured
- [ ] Regular security updates

### Frontend Security
- [ ] HTTPS enforced
- [ ] Content Security Policy (CSP) headers
- [ ] Secure cookie settings
- [ ] XSS protection enabled
- [ ] No sensitive data in client-side code
- [ ] Regular dependency updates

## Performance Optimization

### Database Optimization
```bash
# Run performance optimization
node scripts/optimize-db.js --full

# Schedule regular optimization (crontab)
0 2 * * 0 cd /path/to/sghs/Backend && node scripts/optimize-db.js --cleanup
```

### Caching Strategy
```javascript
// Redis caching example
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

## Backup Strategy

### Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="sghs_production"

# Create backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Health Checks

### Application Health Check
```javascript
// Add to server.js
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: `${memUsageMB}MB`,
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MongoDB connection
   mongosh "your_connection_string"
   
   # Verify network access
   telnet cluster.mongodb.net 27017
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Increase memory limit
   pm2 restart sghs-backend --node-args="--max-old-space-size=2048"
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew --force-renewal
   ```

### Log Analysis
```bash
# View application logs
pm2 logs sghs-backend --lines 100

# Search for errors
grep -i error /path/to/logs/combined.log

# Monitor real-time logs
tail -f /path/to/logs/combined.log
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify backup completion

### Weekly
- Review performance metrics
- Update dependencies (if needed)
- Clean up old logs

### Monthly
- Run database optimization
- Security audit
- Performance review
- Backup verification

## Support and Documentation

### Useful Commands
```bash
# Restart application
pm2 restart sghs-backend

# View application status
pm2 status

# Scale application
pm2 scale sghs-backend 4

# Update application
git pull origin main
npm ci --only=production
pm2 reload sghs-backend

# Database operations
node scripts/init-db.js --help
node scripts/optimize-db.js --help
```

### Emergency Procedures
1. **Application Down**: Check PM2 status, restart if needed
2. **Database Issues**: Check MongoDB Atlas dashboard, verify connection
3. **High Memory Usage**: Restart application, check for memory leaks
4. **SSL Expiry**: Renew certificate with Certbot
5. **Performance Issues**: Run database optimization, check logs

This deployment guide ensures a robust, secure, and scalable production environment for the Smart Green House System.
