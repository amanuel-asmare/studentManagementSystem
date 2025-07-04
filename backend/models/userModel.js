const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
        type: String,
        enum: ["admin", "teacher", "student"],
        default: "student",
    },
    profileImage: {
        type: String,
        trim: true,
        default: "",
    },
    settings: {
        language: {
            type: String,
            enum: ["English", "Amharic", ""],
            default: "English",
        },
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        },
        notifications: {
            type: Boolean,
            default: true,
        },
        timeZone: {
            type: String,
            enum: ["Africa/Addis_Ababa", "UTC", "America/New_York", "Europe/London", ""],
            default: "Africa/Addis_Ababa",
        },
    },
});

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
/*const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: ["admin", "student", "teacher"],
        default: "student",
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("users", userSchema);*/