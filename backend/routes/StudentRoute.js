const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/studentModel");

const router = express.Router();

router.post("/addStudent", async(req, res) => {
    try {
        const {
            studId,
            studName,
            email,
            phone,
            region,
            gradeLevel,
            gender,
            enrolledCourses,
            registrationDate,
            password,
            department,
            batch,
            semester,
        } = req.body;

        // Validate studId format
        if (!/^[A-Z]{2,4}_STU_\d{3}$/.test(studId)) {
            return res.status(400).json({ message: "Student ID must be in format DEPT_STU_XXX (e.g., CS_STU_001)" });
        }

        // Check for existing student
        const existingStudent = await Student.findOne({ $or: [{ studId }, { email }] });
        if (existingStudent) {
            return res.status(400).json({ message: "Student ID or email already registered" });
        }

        // Validate enrolledCourses
        if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
            return res.status(400).json({ message: "At least one course must be selected" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transform enrolledCourses to match schema
        const formattedCourses = enrolledCourses.map(courseCode => ({
            courseCode,
            enrollmentDate: new Date(),
            status: "Enrolled",
        }));

        // Create new student
        const newStudent = new Student({
            studId,
            studName,
            email,
            phone,
            region,
            gradeLevel,
            gender,
            enrolledCourses: formattedCourses,
            registrationDate,
            password: hashedPassword,
            department,
            batch,
            semester,
        });

        await newStudent.save();
        console.log(`
Student registered: $ { studId }
`);
        res.status(201).json({ message: "Student successfully registered", student: newStudent });
    } catch (error) {
        console.error("Student registration error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `
Validation error: $ { messages.join(", ") }
` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Student ID or email already registered" });
        }
        res.status(500).json({ message: "Server error: Unable to register student" });
    }
});

router.get("/student-list", async(req, res) => {
    try {
        console.log("Fetching student list");
        const { department } = req.query;
        const query = department ? { department } : {};
        const studentList = await Student.find(query);
        console.log(`
Query result: $ { studentList.length }
students found `);
        if (!studentList || studentList.length === 0) {
            console.log("No students found");
            return res.status(404).json({ message: "No students found" });
        }
        res.status(200).json(studentList);
    } catch (error) {
        console.error("Student fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch students" });
    }
});

router.get("/recent-activities", async(req, res) => {
    try {
        console.log("Fetching recent activities");
        const activities = await Student.aggregate([
            { $unwind: "$enrolledCourses" },
            { $sort: { "enrolledCourses.enrollmentDate": -1 } },
            {
                $project: {
                    student: "$studName",
                    course: "$enrolledCourses.courseCode",
                    status: "$enrolledCourses.status",
                    date: "$enrolledCourses.enrollmentDate",
                },
            },
            { $limit: 5 },
        ]);
        console.log(`
Query result: $ { activities.length }
activities found `);
        if (!activities || activities.length === 0) {
            console.log("No recent activities found");
            return res.status(404).json({ message: "No recent activities found" });
        }
        res.status(200).json(activities);
    } catch (error) {
        console.error("Recent activities fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch recent activities" });
    }
});

module.exports = router;

/*const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/studentModel");

const router = express.Router();

router.post("/addStudent", async(req, res) => {
    try {
        const {
            studId,
            studName,
            email,
            phone,
            region,
            gradeLevel,
            gender,
            enrolledCourses,
            registrationDate,
            password,
            department,
            batch,
            semester,
        } = req.body;

        // Check for existing student
        const existingStudent = await Student.findOne({ $or: [{ studId }, { email }] });
        if (existingStudent) {
            return res.status(400).json({ message: "Student ID or email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const newStudent = new Student({
            studId,
            studName,
            email,
            phone,
            region,
            gradeLevel,
            gender,
            enrolledCourses,
            registrationDate,
            password: hashedPassword,
            department,
            batch,
            semester,
        });

        await newStudent.save();
        res.status(201).json({ message: "Student successfully registered", student: newStudent });
    } catch (error) {
        console.error("Student registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/student-list", async(req, res) => {
    try {
        const { department } = req.query;
        const query = department ? { department } : {};
        const studentList = await Student.find(query);
        if (!studentList || studentList.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }
        res.status(200).json(studentList);
    } catch (error) {
        console.error("Student fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;*/