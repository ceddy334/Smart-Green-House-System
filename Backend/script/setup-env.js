#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
MONGO_URI=mongodb://localhost:27017/iot_dashboard

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
  console.log('⚠️  Please update JWT_SECRET with a secure random string for production');
} else {
  console.log('⚠️  .env file already exists, skipping creation');
}

console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start MongoDB service');
console.log('3. Run database setup: npm run seed');
console.log('4. Start development server: npm run dev');