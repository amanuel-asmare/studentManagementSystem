const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("Uploads directory created successfully");
    } catch (error) {
        console.error("Error creating Uploads directory:", error.message);
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        console.log("No authentication token provided");
        return res.status(401).json({ message: "Authentication token required" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.email || !decoded.role) {
            console.log("Invalid token payload:", decoded);
            return res.status(401).json({ message: "Invalid token payload" });
        }
        if (decoded.role !== "admin") {
            console.log(`Unauthorized access attempt by role: ${decoded.role}`);
            return res.status(403).json({ message: "Only admins can access this resource" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log("Uploads directory created during upload");
            }
            fs.accessSync(uploadDir, fs.constants.W_OK);
            cb(null, uploadDir);
        } catch (error) {
            console.error("Uploads directory error:", error.message);
            cb(new Error("Uploads directory is not accessible or writable"), null);
        }
    },
    filename: (req, file, cb) => {
        if (!req.user || !req.user.email) {
            console.error("No user email in request for file upload");
            return cb(new Error("User email not found"), null);
        }
        cb(null, `profile-${req.user.email}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/png"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log("Invalid file type:", file.mimetype);
            cb(new Error("Only JPEG or PNG images are allowed"), false);
        }
    },
});

// GET admin profile
router.get("/admin-profile", authenticateToken, async(req, res) => {
    try {
        console.log(`Fetching profile for user: ${req.user.email} using User model`);
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            console.log(`No user found for email: ${req.user.email} in users collection`);
            return res.status(404).json({ message: "Admin profile not found" });
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            settings: user.settings,
        });
    } catch (error) {
        console.error(`Error fetching profile for ${req.user.email}:`, error.message, error.stack);
        if (error.name === "CastError") {
            console.log(`Invalid query parameter: ${error.stringValue} for path ${error.path}`);
            return res.status(400).json({ message: `Invalid query: ${error.message}` });
        }
        if (error.name === "MongoServerError") {
            console.log(`Database error: ${error.message}`);
            return res.status(500).json({ message: `Database error: Unable to fetch profile` });
        }
        res.status(500).json({ message: `Server error: Unable to fetch profile: ${error.message}` });
    }
});

// POST update admin profile
router.post("/update-admin-profile", authenticateToken, async(req, res) => {
    try {
        const { name, email, settings } = req.body;
        console.log(`Updating profile/settings for user: ${req.user.email}`, { name, email, settings });
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (settings) updateData.settings = settings;

        if (Object.keys(updateData).length === 0) {
            console.log("No valid fields provided for update");
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        const user = await User.findOneAndUpdate({ email: req.user.email }, { $set: updateData }, { new: true, runValidators: true }).select("-password");

        if (!user) {
            console.log(`No user found for email: ${req.user.email}`);
            return res.status(404).json({ message: "Admin profile not found" });
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            settings: user.settings,
        });
    } catch (error) {
        console.error(`Error updating profile for ${req.user.email}:`, error.message, error.stack);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `Validation error: ${messages.join(", ")}` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already registered" });
        }
        if (error.name === "CastError") {
            console.log(`Invalid query parameter: ${error.stringValue} for path ${error.path}`);
            return res.status(400).json({ message: `Invalid query: ${error.message}` });
        }
        if (error.name === "MongoServerError") {
            console.log(`Database error: ${error.message}`);
            return res.status(500).json({ message: `Database error: Unable to update profile` });
        }
        res.status(500).json({ message: `Server error: Unable to update profile: ${error.message}` });
    }
});

// POST upload profile image
router.post("/upload-profile-image", authenticateToken, upload.single("profileImage"), async(req, res) => {
    try {
        console.log(`Uploading profile image for user: ${req.user.email} using User model`);
        if (!req.file) {
            console.log("No image file provided in request");
            return res.status(400).json({ message: "No image file provided" });
        }
        const imageUrl = `/Uploads/${req.file.filename}`;
        const user = await User.findOneAndUpdate({ email: req.user.email }, { $set: { profileImage: imageUrl } }, { new: true }).select("-password");

        if (!user) {
            console.log(`No user found for email: ${req.user.email} in users collection`);
            return res.status(404).json({ message: "Admin profile not found" });
        }
        res.status(200).json({ message: "Profile image uploaded successfully", imageUrl });
    } catch (error) {
        console.error(`Error uploading profile image for ${req.user.email}:`, error.message, error.stack);
        if (error.name === "CastError") {
            console.log(`Invalid query parameter: ${error.stringValue} for path ${error.path}`);
            return res.status(400).json({ message: `Invalid query: ${error.message}` });
        }
        if (error.message === "Only JPEG or PNG images are allowed" || error.message === "No image file provided") {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes("Uploads directory")) {
            return res.status(500).json({ message: "Server error: Uploads directory is not accessible" });
        }
        if (error.name === "MongoServerError") {
            console.log(`Database error: ${error.message}`);
            return res.status(500).json({ message: `Database error: Unable to upload image` });
        }
        res.status(500).json({ message: `Server error: Unable to upload image: ${error.message}` });
    }
});

// POST change password
router.post("/change-password", authenticateToken, async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log(`Changing password for user: ${req.user.email}`);
        if (!currentPassword || !newPassword) {
            console.log("Missing current or new password in request");
            return res.status(400).json({ message: "Current and new passwords are required" });
        }
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            console.log(`No user found for email: ${req.user.email}`);
            return res.status(404).json({ message: "Admin profile not found" });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            console.log("Current password is incorrect for user:", req.user.email);
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        user.password = newPassword; // Password hashing handled in userModel.js pre-save
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(`Error changing password for ${req.user.email}:`, error.message, error.stack);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `Validation error: ${messages.join(", ")}` });
        }
        if (error.name === "CastError") {
            console.log(`Invalid query parameter: ${error.stringValue} for path ${error.path}`);
            return res.status(400).json({ message: `Invalid query: ${error.message}` });
        }
        if (error.name === "MongoServerError") {
            console.log(`Database error: ${error.message}`);
            return res.status(500).json({ message: `Database error: Unable to change password` });
        }
        res.status(500).json({ message: `Server error: Unable to change password: ${error.message}` });
    }
});

module.exports = router;