/*const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, trim: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"] },
    role: { type: String, required: true, enum: ["Admin", "SuperAdmin"], default: "Admin" },
    profileImage: { type: String, default: "" },
    password: { type: String, required: true }, // Should be hashed in production
    settings: {
        language: { type: String, default: "English" },
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        notifications: { type: Boolean, default: true },
        timeZone: { type: String, default: "Africa/Addis_Ababa" },
    },
});

const Admin = mongoose.model("Admin", adminSchema);

// Middleware to simulate authenticated user (replace with real auth)
const getAdminId = (req) => "admin123"; // Placeholder: Replace with req.user.id from JWT or session

// Fetch admin profile
router.get("/admin-profile", async(req, res) => {
    try {
        const adminId = getAdminId(req);
        console.log(`
Fetching profile
for admin: $ { adminId }
`);
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            profileImage: admin.profileImage,
            settings: admin.settings,
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update admin profile
router.post("/update-admin-profile", async(req, res) => {
    try {
        const adminId = getAdminId(req);
        const { name, email, settings } = req.body;
        console.log(`
Updating profile
for admin: $ { adminId }
`, { name, email, settings });
        const admin = await Admin.findByIdAndUpdate(
            adminId, { name, email, settings }, { new: true, runValidators: true }
        );
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Upload profile image (stub: assumes image is stored and URL returned)
router.post("/upload-profile-image", async(req, res) => {
    try {
        const adminId = getAdminId(req);
        // In production, use middleware like multer to handle file uploads
        const imageUrl = ` / uploads / admin - $ { adminId } - $ { Date.now() }.jpg `; // Placeholder
        console.log(`
Uploading image
for admin: $ { adminId }
`);
        const admin = await Admin.findByIdAndUpdate(
            adminId, { profileImage: imageUrl }, { new: true }
        );
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Image uploaded successfully", imageUrl });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Change password (stub: assumes password hashing in production)
router.post("/change-password", async(req, res) => {
    try {
        const adminId = getAdminId(req);
        const { currentPassword, newPassword } = req.body;
        console.log(`
Changing password
for admin: $ { adminId }
`);
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        // In production, compare hashed currentPassword
        if (currentPassword !== admin.password) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        admin.password = newPassword; // In production, hash newPassword
        await admin.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;*/