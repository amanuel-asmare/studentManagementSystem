const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: [true, "Course code is required"],
        trim: true,
    },
    studId: {
        type: String,
        required: [true, "Student ID is required"],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, "Attendance date is required"],
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Absent with Apology"],
        required: [true, "Attendance status is required"],
    },
    teacherId: {
        type: String,
        required: [true, "Teacher ID is required"],
        trim: true,
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);