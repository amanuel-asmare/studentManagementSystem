require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/StudentRoute");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courseRoutes");
const bookRoutes = require("./routes/bookRoute");
const teacherRoutes = require("./routes/teacherRoute");
//const adminRoute = require("./routes/adminRoute");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");
const profileRoutes = require("./routes/profile")
const attendanceRoutes = require("./routes/attendanceRoutes");
const app = express();

// Create Uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Serve static files from Uploads directory
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
// CORS Middleware
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight OPTIONS requests
app.options("*", cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON bodies
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Request logging
app.use((req, res, next) => {
    console.log(`
${new Date().toISOString()} - ${req.method}
${req.url} - Origin: ${req.headers.origin || "unknown"}
`);
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", authRoutes);
app.use("/api", studentRoutes);
app.use("/api", courseRoutes);
app.use("/api", bookRoutes);
app.use("/api", teacherRoutes);
//app.use("/api", adminRoute);
app.use("/api", profileRoutes);
//teacher dashbord route
app.use("/api", attendanceRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    if (err.message === "Only PDF files are allowed") {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`
Server running on http://localhost:${PORT}`));