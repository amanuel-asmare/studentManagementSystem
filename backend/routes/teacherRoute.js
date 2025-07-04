const express = require("express");
const bcrypt = require("bcrypt");
const Teacher = require("../models/teacherModel");
const User = require("../models/userModel");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Add Teacher (Admin Only)
router.post("/addTeacher", authMiddleware(['admin']), async(req, res) => {
    try {
        const {
            teacherId,
            name,
            department,
            email,
            phone,
            salary,
            hireDate,
            position,
            coursesAssigned,
            status,
            password,
            role = "teacher", // Default role
        } = req.body;

        // Validate inputs
        if (!teacherId || !name || !department || !email || !phone || !salary || !hireDate || !position || !status || !password) {
            return res.status(400).json({ message: "All required fields, including password, must be provided" });
        }
        if (!/^T\d{3}$/.test(teacherId)) {
            return res.status(400).json({ message: "Teacher ID must be in format TXXX (e.g., T001)" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!/^\+?\d{10,12}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must be 10-12 digits" });
        }
        if (isNaN(salary) || salary <= 0) {
            return res.status(400).json({ message: "Salary must be a positive number" });
        }
        if (!Date.parse(hireDate)) {
            return res.status(400).json({ message: "Invalid hire date format" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        // Check for existing teacher or user
        const [existingTeacher, existingUser] = await Promise.all([
            Teacher.findOne({ teacherId }),
            User.findOne({ email }),
        ]);
        if (existingTeacher || existingUser) {
            return res.status(400).json({ message: "Teacher ID or email already registered" });
        }

        // Sanitize inputs
        const sanitizedData = {
            teacherId: teacherId.trim(),
            name: name.trim(),
            department: department.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            salary: Number(salary),
            hireDate: new Date(hireDate),
            position: position.trim(),
            coursesAssigned: coursesAssigned ? coursesAssigned.map(course => course.trim()) : [],
            status: status.trim(),
            password: await bcrypt.hash(password.trim(), 10),
            role,
        };

        // Create new teacher
        const newTeacher = new Teacher(sanitizedData);

        // Create corresponding user entry
        const newUser = new User({
            name: sanitizedData.name,
            email: sanitizedData.email,
            password: sanitizedData.password,
            role: sanitizedData.role,
        });

        // Save both teacher and user
        await Promise.all([newTeacher.save(), newUser.save()]);

        console.log(`Teacher registered: ${teacherId}`);
        res.status(201).json({ message: "Teacher successfully added", teacher: newTeacher });
    } catch (error) {
        console.error("Teacher registration error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `Validation error: ${messages.join(", ")}` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Teacher ID or email already registered" });
        }
        res.status(500).json({ message: "Server error: Unable to register teacher" });
    }
});

// Get Teacher List (Admin Only)
router.get("/teacher-list", authMiddleware(['admin']), async(req, res) => {
    try {
        console.log("Fetching teacher list");
        const teacherList = await Teacher.find();
        console.log(`Query result: ${teacherList.length} teachers found`);
        if (!teacherList || teacherList.length === 0) {
            console.log("No teachers found");
            return res.status(404).json({ message: "No teachers found" });
        }
        res.status(200).json(teacherList);
    } catch (error) {
        console.error("Teacher fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch teachers" });
    }
});

// Get Teacher-Specific Data (Teacher Only)
router.get("/teacher/:teacherId", authMiddleware(['teacher']), async(req, res) => {
    try {
        const { teacherId } = req.params;
        if (req.user.role !== 'teacher' || req.user.id !== teacherId) {
            return res.status(403).json({ message: "Unauthorized: You can only access your own data" });
        }
        const teacher = await Teacher.findOne({ teacherId });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error("Teacher fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch teacher data" });
    }
});

// Delete Teacher (Admin Only)
router.delete("/deleteTeacher/:teacherId", authMiddleware(['admin']), async(req, res) => {
    try {
        const { teacherId } = req.params;
        const teacher = await Teacher.findOneAndDelete({ teacherId });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        await User.findOneAndDelete({ email: teacher.email });
        console.log(`Teacher deleted: ${teacherId}`);
        res.status(200).json({ message: "Teacher successfully deleted" });
    } catch (error) {
        console.error("Teacher deletion error:", error);
        res.status(500).json({ message: "Server error: Unable to delete teacher" });
    }
});

module.exports = router;
/*const express = require("express");
const Teacher = require("../models/teacherModel");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/addTeacher", async(req, res) => {
    try {
        const {
            teacherId,
            name,
            department,
            email,
            phone,
            salary,
            hireDate,
            position,
            coursesAssigned,
            status,
            password,
        } = req.body;

        // Validate inputs
        if (!teacherId ||
            !name ||
            !department ||
            !email ||
            !phone ||
            !salary ||
            !hireDate ||
            !position ||
            !status ||
            !password
        ) {
            return res.status(400).json({ message: "All required fields, including password, must be provided" });
        }
        if (!/^T\d{3}$/.test(teacherId)) {
            return res.status(400).json({ message: "Teacher ID must be in format TXXX (e.g., T001)" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!/^\+?\d{10,12}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must be 10-12 digits" });
        }
        if (isNaN(salary) || salary <= 0) {
            return res.status(400).json({ message: "Salary must be a positive number" });
        }
        if (!Date.parse(hireDate)) {
            return res.status(400).json({ message: "Invalid hire date format" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        // Check for existing teacher or user
        const [existingTeacher, existingUser] = await Promise.all([
            Teacher.findOne({ teacherId }),
            User.findOne({ email }),
        ]);
        if (existingTeacher || existingUser) {
            return res.status(400).json({ message: "Teacher ID or email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new teacher
        const newTeacher = new Teacher({
            teacherId,
            name,
            department,
            email,
            phone,
            salary,
            hireDate,
            position,
            coursesAssigned: coursesAssigned || [],
            status,
        });

        // Create corresponding user entry
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "teacher",
        });

        // Save both teacher and user
        await Promise.all([newTeacher.save(), newUser.save()]);

        console.log(`
Teacher registered: $ { teacherId }
`);
        res.status(201).json({ message: "Teacher successfully added", teacher: newTeacher });
    } catch (error) {
        console.error("Teacher registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/teacher-list", async(req, res) => {
    try {
        console.log("Fetching teacher list");
        const teacherList = await Teacher.find();
        console.log(`
Query result: $ { teacherList.length }
teachers found `);
        if (!teacherList || teacherList.length === 0) {
            console.log("No teachers found");
            return res.status(404).json({ message: "No teachers found" });
        }
        res.status(200).json(teacherList);
    } catch (error) {
        console.error("Teacher fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch teachers" });
    }
});

module.exports = router;*/