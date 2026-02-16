const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection, use it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    // Check if mongoose is already connected
    if (mongoose.connection.readyState === 1) {
        cachedConnection = mongoose.connection;
        return cachedConnection;
    }

    try {
        if (!process.env.MONGO_URI) {
            console.error('CRITICAL: MONGO_URI environment variable is missing.');
            return null;
        }

        console.log('Connecting to MongoDB...');
        cachedConnection = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully.');
        return cachedConnection;
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        cachedConnection = null;
        return null;
    }
};

module.exports = connectDB;
