const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendanceModel");
const Student = require("../models/studentModel");
const Course = require("../models/courseModel");
const authMiddleware = require("../middleware/auth");

// Get assigned students and courses for the teacher
router.get("/assigned-data", authMiddleware(["teacher"]), async(req, res) => {
    try {
        const teacherId = req.user.id; // From JWT payload (modify authMiddleware to include id)
        const courses = await Course.find({ teacherId });
        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "No courses assigned to this teacher" });
        }

        const courseCodes = courses.map((course) => course.courseCode);
        const students = await Student.find({ "enrolledCourses.courseCode": { $in: courseCodes } });

        res.status(200).json({
            courses,
            students: students.map((student) => ({
                studId: student.studId,
                studName: student.studName,
                gender: student.gender,
                enrolledCourses: student.enrolledCourses.filter((course) =>
                    courseCodes.includes(course.courseCode)
                ),
                department: student.department,
            })),
        });
    } catch (error) {
        console.error("Error fetching assigned data:", error);
        res.status(500).json({ message: "Server error: Unable to fetch assigned data" });
    }
});

// Save attendance records
router.post("/save-attendance", authMiddleware(["teacher"]), async(req, res) => {
    try {
        const { courseCode, date, attendanceRecords } = req.body;
        const teacherId = req.user.id;

        // Validate input
        if (!courseCode || !date || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ message: "Course code, date, and attendance records are required" });
        }

        // Verify teacher is assigned to the course
        const course = await Course.findOne({ courseCode, teacherId });
        if (!course) {
            return res.status(403).json({ message: "Unauthorized: You are not assigned to this course" });
        }

        // Save or update attendance records
        const attendancePromises = attendanceRecords.map(async(record) => {
            const { studId, status } = record;
            if (!studId || !status) {
                throw new Error("Student ID and status are required for each record");
            }

            // Verify student is enrolled in the course
            const student = await Student.findOne({ studId, "enrolledCourses.courseCode": courseCode });
            if (!student) {
                throw new Error(`Student ${studId} is not enrolled in course ${courseCode}`);
            }

            return Attendance.findOneAndUpdate({ courseCode, studId, date: new Date(date), teacherId }, {
                courseCode,
                studId,
                date: new Date(date),
                status,
                teacherId,
                department: course.department,
            }, { upsert: true, new: true });
        });

        await Promise.all(attendancePromises);
        res.status(201).json({ message: "Attendance saved successfully" });
    } catch (error) {
        console.error("Error saving attendance:", error);
        res.status(400).json({ message: error.message || "Server error: Unable to save attendance" });
    }
});

module.exports = router;