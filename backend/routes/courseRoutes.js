/*const express = require("express");
const Course = require("../models/courseModel");

const router = express.Router();

router.post("/addCourse", async(req, res) => {
    try {
        const { courseCode, courseName, description, teacherId, enrolledStudents, department } = req.body;

        // Check for existing course
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already registered with this code" });
        }

        // Create new course
        const newCourse = new Course({
            courseCode,
            courseName,
            description,
            teacherId,
            enrolledStudents: enrolledStudents || [],
            department,
        });

        await newCourse.save();
        res.status(201).json({ message: "Course successfully registered", course: newCourse });
    } catch (error) {
        console.error("Course registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/course-list", async(req, res) => {
    try {
        const courseList = await Course.find();
        if (!courseList || courseList.length === 0) {
            return res.status(404).json({ message: "No courses found" });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error("Course fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/course-list/department/:department", async(req, res) => {
    try {
        const { department } = req.params;
        const decodedDepartment = decodeURIComponent(department).trim();
        console.log(`
Fetching courses
for department: $ { decodedDepartment }
`);
        const courseList = await Course.find({ department: decodedDepartment });
        console.log(`
Query result: $ { courseList.length }
courses found
for $ { decodedDepartment }
`);
        if (!courseList || courseList.length === 0) {
            console.log(`
No courses found
for department: $ { decodedDepartment }
`);
            return res.status(404).json({ message: `
No courses found
for $ { decodedDepartment }
` });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error(`
Department course fetch error
for $ { decodeURIComponent(req.params.department) }: `, error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;*/
/*
const express = require("express");
const Course = require("../models/courseModel");

const router = express.Router();

router.post("/addCourse", async(req, res) => {
    try {
        const { courseCode, courseName, description, teacherId, enrolledStudents, department } = req.body;

        // Check for existing course
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already registered with this code" });
        }

        // Create new course
        const newCourse = new Course({
            courseCode,
            courseName,
            description,
            teacherId,
            enrolledStudents: enrolledStudents || [],
            department,
        });

        await newCourse.save();
        console.log(`
Course registered: $ { courseCode }
`);
        res.status(201).json({ message: "Course successfully registered", course: newCourse });
    } catch (error) {
        console.error("Course registration error:", error);
        res.status(500).json({ message: "Server error: Unable to register course" });
    }
});

router.get("/course-list", async(req, res) => {
    try {
        console.log("Fetching course list");
        const courseList = await Course.find();
        console.log(`
Query result: $ { courseList.length }
courses found `);
        if (!courseList || courseList.length === 0) {
            console.log("No courses found");
            return res.status(404).json({ message: "No courses found" });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error("Course fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch courses" });
    }
});

router.get("/course-list/department/:department", async(req, res) => {
    try {
        const { department } = req.params;
        const decodedDepartment = decodeURIComponent(department).trim();
        console.log(`
Fetching courses
for department: $ { decodedDepartment }
`);
        const courseList = await Course.find({ department: decodedDepartment });
        console.log(`
Query result: $ { courseList.length }
courses found
for $ { decodedDepartment }
`);
        if (!courseList || courseList.length === 0) {
            console.log(`
No courses found
for department: $ { decodedDepartment }
`);
            return res.status(404).json({ message: `
No courses found
for $ { decodedDepartment }
` });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error(`
Department course fetch error
for $ { decodeURIComponent(req.params.department) }: `, error);
        res.status(500).json({ message: "Server error: Unable to fetch courses for department" });
    }
});

module.exports = router;*/

const express = require("express");
const Course = require("../models/courseModel");

const router = express.Router();

router.post("/addCourse", async(req, res) => {
    try {
        const { courseCode, courseName, description, teacherId, enrolledStudents, department } = req.body;

        // Check for existing course
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already registered with this code" });
        }

        // Create new course
        const newCourse = new Course({
            courseCode,
            courseName,
            description,
            teacherId,
            enrolledStudents: enrolledStudents || [],
            department,
        });

        await newCourse.save();
        console.log(`
Course registered: $ { courseCode }
`);
        res.status(201).json({ message: "Course successfully registered", course: newCourse });
    } catch (error) {
        console.error("Course registration error:", error);
        res.status(500).json({ message: "Server error: Unable to register course" });
    }
});

router.get("/course-list", async(req, res) => {
    try {
        console.log("Fetching course list");
        const courseList = await Course.find();
        console.log(`
Query result: $ { courseList.length }
courses found `);
        if (!courseList || courseList.length === 0) {
            console.log("No courses found");
            return res.status(404).json({ message: "No courses found" });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error("Course fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch courses" });
    }
});

router.get("/course-list/department/:department", async(req, res) => {
    try {
        const { department } = req.params;
        const decodedDepartment = decodeURIComponent(department).trim();
        console.log(`
Fetching courses
for department: $ { decodedDepartment }
`);
        const courseList = await Course.find({ department: decodedDepartment });
        console.log(`
Query result: $ { courseList.length }
courses found
for $ { decodedDepartment }
`);
        if (!courseList || courseList.length === 0) {
            console.log(`
No courses found
for department: $ { decodedDepartment }
`);
            return res.status(404).json({ message: `
No courses found
for $ { decodedDepartment }
` });
        }
        res.status(200).json(courseList);
    } catch (error) {
        console.error(`
Department course fetch error
for $ { decodeURIComponent(req.params.department) }: `, error);
        res.status(500).json({ message: "Server error: Unable to fetch courses for department" });
    }
});

module.exports = router;