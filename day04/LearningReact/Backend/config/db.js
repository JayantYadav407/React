const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log this to check if your environment variables are actually loading
    console.log("Attempting to connect with URI:", process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your .env file loading!");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 MongoDB Connected succesfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;