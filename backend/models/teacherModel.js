const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    salary: { type: Number, required: true },
    hireDate: { type: Date, required: true },
    position: { type: String, required: true },
    coursesAssigned: [{ type: String }],
    status: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'teacher' },
});

module.exports = mongoose.model('Teacher', teacherSchema);
/*const mongoose = require("mongoose");

const teacherSchema = mongoose.Schema({
    teacherId: {
        type: String,
        trim: true,
        required: [true, "Teacher ID is required"],
        unique: true,
        match: [/^T\d{3}$/, "Teacher ID must be in format TXXX (e.g., T001)"],
    },
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [2, "Name must be at least 2 characters"],
    },
    department: {
        type: String,
        trim: true,
        required: [true, "Department is required"],
        enum: [
            "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
            "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
            "Agriculture", "Public Health", "Social Work", "Education"
        ],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    phone: {
        type: String,
        trim: true,
        required: [true, "Phone number is required"],
        match: [/^\+?\d{10,12}$/, "Phone number must be 10-12 digits"],
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"],
        min: [0, "Salary must be a positive number"],
    },
    hireDate: {
        type: Date,
        required: [true, "Hire date is required"],
    },
    position: {
        type: String,
        trim: true,
        required: [true, "Position is required"],
        enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"],
    },
    coursesAssigned: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        trim: true,
        required: [true, "Status is required"],
        enum: ["Active", "On Leave", "Retired"],
    },
});

module.exports = mongoose.model("teachers", teacherSchema);*/