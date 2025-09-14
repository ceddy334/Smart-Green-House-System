const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/iot_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return;
    }

    // Create test user
    const testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123'
    });

    await testUser.save();
    console.log('Test user created successfully:', {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      accountId: testUser.accountId
    });

    console.log('\nYou can now test login with:');
    console.log('- Email: test@example.com');
    console.log('- Username: John');
    console.log('- Username: Doe');
    console.log('- Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
