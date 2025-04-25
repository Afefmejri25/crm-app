import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();


import Client from '../models/Client.js';

(async () => {
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
    // Drop the problematic index
    await mongoose.connection.db.collection('clients').dropIndex('email_1');

    console.log('Dropped existing email index.');

    // Ensure Mongoose re-applies schema indexes properly
    await Client.syncIndexes();
    console.log('Indexes synced with schema.');
    
  mongoose.connection.close();
})();

