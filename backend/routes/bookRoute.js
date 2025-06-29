const express = require("express");
const router = express.Router();
const Book = require("../models/bookModel");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `
$ { req.body.bookId } - $ { Date.now() }
$ { path.extname(file.originalname) }
`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    },
});

router.post("/addBook", upload.single("bookFile"), async(req, res) => {
    try {
        const { bookId, bookName, author, department, publishedDate, courseCode, onlineUrl } = req.body;

        // Check for existing book
        const existingBook = await Book.findOne({ bookId });
        if (existingBook) {
            return res.status(400).json({ message: "Book already registered with this ID" });
        }

        // Create new book
        const newBook = new Book({
            bookId,
            bookName,
            author,
            department,
            publishedDate: new Date(publishedDate),
            courseCode: courseCode || "",
            bookFile: req.file ? ` / Uploads / $ { req.file.filename }
` : "",
            onlineUrl: onlineUrl || "",
        });

        await newBook.save();
        console.log(`
Book registered: $ { bookId }
`);
        res.status(201).json({ message: "Book successfully registered", book: newBook });
    } catch (error) {
        console.error("Book registration error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: `
Validation error: $ { messages.join(", ") }
` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "Book ID already registered" });
        }
        if (error.message === "Only PDF files are allowed") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: `
Server error: Unable to register book: $ { error.message }
` });
    }
});

router.get("/booklist", async(req, res) => {
    try {
        console.log("Fetching book list");
        const bookList = await Book.find().select("bookId bookName author department publishedDate courseCode bookFile onlineUrl");
        console.log(`
Query result: $ { bookList.length }
books found `);
        if (!bookList || bookList.length === 0) {
            console.log("No books found");
            return res.status(404).json({ message: "No books found" });
        }
        res.status(200).json(bookList);
    } catch (error) {
        console.error("Book list fetch error:", error);
        res.status(500).json({ message: "Server error: Unable to fetch book list" });
    }
});

module.exports = router;


/*const express = require("express");
const bookModel = require("../models/book");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Ensure Uploads folder exists
const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `
$ { Date.now() } - $ { file.originalname }
`);
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    },
});

router.post("/addBook", upload.single("bookFile"), async(req, res) => {
    try {
        const { bookId, bookName, author, department, publishedDate, courseCode, onlineUrl } = req.body;

        // Validate inputs
        if (!bookId || !bookName || !author || !department || !publishedDate) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        if (!/^[A-Z]{2,4}_BOOK_\d{3}$/.test(bookId)) {
            return res.status(400).json({ message: "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)" });
        }
        if (onlineUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(onlineUrl)) {
            return res.status(400).json({ message: "Invalid URL format" });
        }
        if (!req.file && !onlineUrl) {
            return res.status(400).json({ message: "Either a PDF file or an online URL must be provided" });
        }

        // Check for existing book by bookId
        const existingBook = await bookModel.findOne({ bookId });
        if (existingBook) {
            return res.status(400).json({ message: "Book already registered with this ID" });
        }

        // Create new book
        const newBook = new bookModel({
            bookId,
            bookName,
            author,
            department,
            publishedDate,
            courseCode: courseCode || null,
            filePath: req.file ? req.file.path : null,
            onlineUrl: onlineUrl || null,
        });

        await newBook.save();
        res.status(201).json({ message: "Book successfully added", book: newBook });
    } catch (error) {
        console.error("Book upload error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add endpoint to fetch all books
router.get("/booklist", async(req, res) => {
    try {
        console.log("Fetching book list");
        const books = await bookModel.find();
        console.log(`
Query result: $ { books.length }
books found `);
        if (!books || books.length === 0) {
            console.log("No books found in the database");
            return res.status(404).json({ message: "No books found" });
        }
        res.status(200).json(books);
    } catch (error) {
        console.error("Book list fetch error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router; */