const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }
        // Set strictQuery to suppress deprecation warning
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;