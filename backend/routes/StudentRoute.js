const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/studentModel");
const User = require("../models/userModel");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Add Student (Admin Only)
router.post("/addStudent", authMiddleware(['admin']), async(req, res) => {
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
            role = "student", // Default role
        } = req.body;

        // Validate studId format
        if (!/^[A-Z]{2,4}_STU_\d{3}$/.test(studId)) {
            return res.status(400).json({ message: "Student ID must be in format DEPT_STU_XXX (e.g., CS_STU_001)" });
        }

        // Check for existing student or user
        const [existingStudent, existingUser] = await Promise.all([
            Student.findOne({ $or: [{ studId }, { email }] }),
            User.findOne({ email }),
        ]);
        if (existingStudent || existingUser) {
            return res.status(400).json({ message: "Student ID or email already registered" });
        }

        // Validate enrolledCourses
        if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
            return res.status(400).json({ message: "At least one course must be selected" });
        }

        // Sanitize inputs
        const sanitizedData = {
            studId: studId.trim(),
            studName: studName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            region: region.trim(),
            gradeLevel: gradeLevel.trim(),
            gender: gender.trim(),
            enrolledCourses: enrolledCourses.map(course => ({
                courseCode: course.trim(),
                enrollmentDate: new Date(),
                status: "Enrolled",
            })),
            registrationDate: new Date(registrationDate),
            password: await bcrypt.hash(password.trim(), 10),
            department: department.trim(),
            batch: batch.trim(),
            semester: semester.trim(),
            role,
        };

        // Create new student
        const newStudent = new Student(sanitizedData);

        // Create corresponding user entry
        const newUser = new User({
            name: sanitizedData.studName,
            email: sanitizedData.email,
            password: sanitizedData.password,
            role: sanitizedData.role,
        });

        // Save both student and user
        await Promise.all([newStudent.save(), newUser.save()]);

        console.log(`Student registered: ${studId}`);
        res.status(201).json({ message: "Student successfully registered", student: newStudent });
    } catch (error) {
        console.error("Student registration error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `Validation error: ${messages.join(", ")}` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Student ID or email already registered" });
        }
        res.status(500).json({ message: "Server error: Unable to register student" });
    }
});

// Get Student List (Admin Only)
router.get("/student-list", authMiddleware(['admin']), async(req, res) => {
    try {
        console.log("Fetching student list");
        const { department } = req.query;
        const query = department ? { department } : {};
        const studentList = await Student.find(query);
        console.log(`Query result: ${studentList.length} students found`);
        if (!studentList || studentList.length === 0) {
            console.log("No students found");
            return res.status(404).json({ message: "No students found for the specified department" });
        }
        res.status(200).json(studentList);
    } catch (error) {
        console.error("Student fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch students" });
    }
});

// Get Student-Specific Data (Student Only)
router.get("/student/:studId", authMiddleware(['student']), async(req, res) => {
    try {
        const { studId } = req.params;
        if (req.user.role !== 'student' || req.user.id !== studId) {
            return res.status(403).json({ message: "Unauthorized: You can only access your own data" });
        }
        const student = await Student.findOne({ studId });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error("Student fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch student data" });
    }
});

// Get Recent Activities (Admin or Student)
router.get("/recent-activities", authMiddleware(['admin', 'student']), async(req, res) => {
    try {
        console.log("Fetching recent activities");
        let query = {};
        if (req.user.role === 'student') {
            const student = await Student.findOne({ email: req.user.email });
            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }
            query = { studId: student.studId };
        }
        const activities = await Student.aggregate([
            { $match: query },
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
        console.log(`Query result: ${activities.length} activities found`);
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
const User = require("../models/user");
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

        // Check for existing student or user
        const [existingStudent, existingUser] = await Promise.all([
            Student.findOne({ $or: [{ studId }, { email }] }),
            User.findOne({ email }),
        ]);
        if (existingStudent || existingUser) {
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

        // Create corresponding user entry
        const newUser = new User({
            name: studName,
            email,
            password: hashedPassword,
            role: "student",
        });

        // Save both student and user
        await Promise.all([newStudent.save(), newUser.save()]);

        console.log(`Student registered: ${studId}`);
        res.status(201).json({ message: "Student successfully registered", student: newStudent });
    } catch (error) {
        console.error("Student registration error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `Validation error: ${messages.join(", ")}` });
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
        console.log(`Query result: ${studentList.length} students found`);
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
        console.log(`Query result: ${activities.length} activities found`);
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

module.exports = router;*/