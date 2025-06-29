const express = require("express");
const Teacher = require("../models/teacherModel");
const router = express.Router();

router.post("/addTeacher", async(req, res) => {
    try {
        const { teacherId, name, department, email, phone, salary, hireDate, position, coursesAssigned, status } = req.body;

        // Validate inputs
        if (!teacherId || !name || !department || !email || !phone || !salary || !hireDate || !position || !status) {
            return res.status(400).json({ message: "All required fields must be provided" });
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

        // Check for existing teacher
        const existingTeacher = await Teacher.findOne({ teacherId });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already registered with this ID" });
        }

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

        await newTeacher.save();
        res.status(201).json({ message: "Teacher successfully added", teacher: newTeacher });
    } catch (error) {
        console.error("Teacher registration error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/teacher-list", async(req, res) => {
    try {
        console.log("Fetching teacher list");
        const teachers = await Teacher.find();
        console.log(`
Query result: $ { teachers.length }
teachers found `);
        if (!teachers || teachers.length === 0) {
            console.log("No teachers found in the database");
            return res.status(404).json({ message: "No teachers found" });
        }
        res.status(200).json(teachers);
    } catch (error) {
        console.error("Teacher list fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/deleteTeacher/:teacherId", async(req, res) => {
    try {
        const { teacherId } = req.params;
        console.log(`
Deleting teacher: $ { teacherId }
`);
        const teacher = await Teacher.findOneAndDelete({ teacherId });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
        console.error("Teacher deletion error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;