import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'Marwa@cinden-crm.com' });
    if (existingUser) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Marwa2025/', salt);

    const adminUser = new User({
      name: 'Marwa',
      email: 'Marwa@cinden-crm.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdminUser(); 