import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'Marwa@cinden-crm.com' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Marwa',
      email: 'Marwa@cinden-crm.com',
      password: 'Ma2025#',
      role: 'admin',
    });

    await testUser.save();
    console.log('Test user created successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser(); 