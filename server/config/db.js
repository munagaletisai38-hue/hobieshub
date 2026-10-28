const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hobbyhub';

  try {
    // Attempt connecting to the configured MongoDB with a short timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}:${conn.connection.port || ''}/${conn.connection.name}`);
    await checkAndSeed();
  } catch (primaryErr) {
    console.log(`ℹ️  Direct connection to ${primaryUri} failed (${primaryErr.message}).`);
    console.log('🔄 Initializing high-performance embedded MongoDB engine...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`🚀 Embedded In-Memory MongoDB running & connected!`);
      await checkAndSeed();
    } catch (mmsErr) {
      console.error(`❌ Failed to start embedded MongoDB: ${mmsErr.message}`);
      console.error('👉 Please ensure MongoDB is running locally, or configure a valid MONGO_URI in server/.env');
      process.exit(1);
    }
  }
};

const checkAndSeed = async () => {
  try {
    const Forum = require('../models/Forum');
    const forumCount = await Forum.countDocuments();
    if (forumCount === 0) {
      console.log('🌱 Empty database detected. Auto-seeding initial community data...');
      const seedDB = require('../seed');
      await seedDB(false);
      console.log('✨ Auto-seeding complete! Ready for user requests.');
    }
  } catch (err) {
    console.warn('⚠️  Auto-seed check notice:', err.message);
  }
};

module.exports = connectDB;
