const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: [true, "Course code is required"],
        unique: true,
        trim: true,
        minlength: [4, "Course code must be at least 4 characters"],
    },
    courseName: {
        type: String,
        required: [true, "Course name is required"],
        trim: true,
        minlength: [2, "Course name must be at least 2 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters"],
    },
    teacherId: {
        type: String,
        required: [true, "Teacher ID is required"],
        trim: true,
    },
    enrolledStudents: {
        type: [String],
        default: [], // Allow empty array by default
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
});

module.exports = mongoose.model("Course", courseSchema);