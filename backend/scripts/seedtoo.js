import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Call from '../models/Call.js'; // Import Call model
import Notification from '../models/Notification.js'; // Import Notification model

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Seed calls data
    const calls = [
      {
        client: '64a1b2c3d4e5f67890123456', // Replace with valid client IDs
        status: 'success',
        result: 'Success', // Updated to match valid enum value
        agent: '64a1b2c3d4e5f67890123459', // Replace with valid agent ID
        notes: 'Client is interested in the product.',
        scheduledCallback: null,
        createdAt: new Date(),
      },
      {
        client: '64a1b2c3d4e5f67890123457', // Replace with valid client IDs
        status: 'callback',
        result: 'Callback Requested', // Updated to match valid enum value
        agent: '64a1b2c3d4e5f67890123459', // Replace with valid agent ID
        notes: 'Requested a callback next week.',
        scheduledCallback: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        client: '64a1b2c3d4e5f67890123458', // Replace with valid client IDs
        status: 'no_answer',
        result: 'No Response', // Updated to match valid enum value
        agent: '64a1b2c3d4e5f67890123459', // Replace with valid agent ID
        notes: 'No response from the client.',
        scheduledCallback: null,
        createdAt: new Date(),
      },
    ];

    await Call.insertMany(calls);
    console.log('Calls seeded successfully.');

    // Seed notifications data
    const notifications = [
      {
        title: 'New Document Uploaded',
        message: 'A new document has been uploaded for your review.',
        type: 'document',
        recipient: '64a1b2c3d4e5f67890123456', // Replace with valid user IDs
        createdAt: new Date(),
      },
      {
        title: 'Upcoming Appointment',
        message: 'You have an appointment scheduled tomorrow.',
        type: 'appointment',
        recipient: '64a1b2c3d4e5f67890123457', // Replace with valid user IDs
        createdAt: new Date(),
      },
      {
        title: 'Missed Call Alert',
        message: 'You missed a call from a client.',
        type: 'call',
        recipient: '64a1b2c3d4e5f67890123458', // Replace with valid user IDs
        createdAt: new Date(),
      },
    ];

    await Notification.insertMany(notifications);
    console.log('Notifications seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedData();
};

runSeeder();
