const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === 'development') {
      try {
        const path = require('path');
        const fs = require('fs');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        
        const dbPath = path.join(__dirname, '../database-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        try {
          mongoServer = await MongoMemoryServer.create({
            instance: {
              dbPath,
              storageEngine: 'wiredTiger',
              port: 27018,
            }
          });
        } catch (portErr) {
          mongoServer = await MongoMemoryServer.create({
            instance: {
              dbPath,
              storageEngine: 'wiredTiger',
            }
          });
        }
        dbUri = mongoServer.getUri();
        console.log('Started local persistent MongoDB Server. Connection URI:', dbUri);
      } catch (err) {
        console.warn('Could not start MongoMemoryServer, falling back to MONGODB_URI env:', err.message);
      }
    }

    const conn = await mongoose.connect(dbUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin user
    try {
      const User = require('../models/User');
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        await User.create({
          name: 'FlexOra Admin',
          email: 'admin@flexora.com',
          password: 'adminpassword',
          role: 'admin',
          age: 30,
          gender: 'male',
          height: 180,
          weight: 75,
          activityLevel: 'active',
          fitnessGoal: 'maintain'
        });
        console.log('Seeded default admin user: admin@flexora.com / adminpassword');
      }
    } catch (err) {
      console.error('Failed to seed default admin user:', err.message);
    }

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
