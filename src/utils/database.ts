import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDatabase = async (): Promise<void> => {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set.');
    console.error('Please set it in your .env file or environment variables.');
    console.error('See .env.example for reference.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};