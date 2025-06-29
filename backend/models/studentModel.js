const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studId: {
        type: String,
        required: [true, "Student ID is required"],
        unique: true,
        trim: true,
        minlength: [4, "Student ID must be at least 4 characters"],
    },
    studName: {
        type: String,
        required: [true, "Student name is required"],
        trim: true,
        minlength: [2, "Student name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },
    region: {
        type: String,
        required: [true, "Region is required"],
        trim: true,
    },
    gradeLevel: {
        type: String,
        required: [true, "Year level is required"],
        enum: ["1", "2", "3", "4", "5"],
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: ["Male", "Female", "Other"],
    },
    enrolledCourses: [{
        courseCode: {
            type: String,
            required: true,
        },
        enrollmentDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Enrolled", "Completed", "Dropped"],
            default: "Enrolled",
        },
    }],
    registrationDate: {
        type: String,
        required: [true, "Registration date is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
    batch: {
        type: String,
        required: [true, "Batch is required"],
        trim: true,
    },
    semester: {
        type: String,
        required: [true, "Semester is required"],
        enum: ["Semester 1", "Semester 2"],
    },
});

module.exports = mongoose.model("Student", studentSchema);

/*const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studId: {
        type: String,
        required: [true, "Student ID is required"],
        unique: true,
        trim: true,
        minlength: [4, "Student ID must be at least 4 characters"],
    },
    studName: {
        type: String,
        required: [true, "Student name is required"],
        trim: true,
        minlength: [2, "Student name must be at least 2 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^\+?\d{10,15}$/, "Invalid phone number"],
    },
    region: {
        type: String,
        required: [true, "Region is required"],
        trim: true,
    },
    gradeLevel: {
        type: String,
        required: [true, "Year level is required"],
        enum: ["1", "2", "3", "4", "5"],
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: ["Male", "Female", "Other"],
    },
    enrolledCourses: {
        type: [String],
        required: [true, "At least one enrolled course is required"],
    },
    registrationDate: {
        type: String,
        required: [true, "Registration date is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
    batch: {
        type: String,
        required: [true, "Batch is required"],
        trim: true,
    },
    semester: {
        type: String,
        required: [true, "Semester is required"],
        enum: ["Semester 1", "Semester 2"],
    },
});

module.exports = mongoose.model("Student", studentSchema); */