/*const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
    bookId: {
        type: String,
        trim: true,
        required: [true, "Book ID is required"],
        unique: true,
        minlength: [3, "Book ID must be at least 3 characters"],
        match: [/^[A-Z]{2,4}_BOOK_\d{3}$/, "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)"],
    },
    bookName: {
        type: String,
        trim: true,
        required: [true, "Book name is required"],
        minlength: [2, "Book name must be at least 2 characters"],
    },
    author: {
        type: String,
        trim: true,
        required: [true, "Author is required"],
        minlength: [2, "Author name must be at least 2 characters"],
    },
    department: {
        type: String,
        trim: true,
        required: [true, "Department is required"],
    },
    publishedDate: {
        type: Date,
        required: [true, "Published date is required"],
    },
    courseCode: {
        type: String,
        trim: true,
        default: null,
    },
    filePath: {
        type: String,
        trim: true,
        default: null,
    },
    onlineUrl: {
        type: String,
        trim: true,
        default: null,
        match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Invalid URL format"],
    },
});

module.exports = mongoose.model("Book", bookSchema);*/

/*const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: [true, "Book ID is required"],
        unique: true,
        trim: true,
        match: [/^[A-Z]{2,4}_BOOK_\d{3}$/, "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)"],
    },
    bookName: {
        type: String,
        required: [true, "Book name is required"],
        trim: true,
        minlength: [2, "Book name must be at least 2 characters"],
    },
    author: {
        type: String,
        required: [true, "Author is required"],
        trim: true,
        minlength: [2, "Author name must be at least 2 characters"],
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
    publishedDate: {
        type: Date,
        required: [true, "Published date is required"],
    },
    courseCode: {
        type: String,
        trim: true,
        default: "",
    },
    bookFile: {
        type: String,
        trim: true,
        default: "",
    },
    onlineUrl: {
        type: String,
        trim: true,
        default: "",
        match: [/^$|^https?:\/\/[^\s$.?#].[^\s]*$/, "Invalid URL format"],
    },
});

module.exports = mongoose.model("Book", bookSchema);*/


const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: [true, "Book ID is required"],
        unique: true,
        trim: true,
        match: [/^[A-Z]{2,4}_BOOK_\d{3}$/, "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)"],
    },
    bookName: {
        type: String,
        required: [true, "Book name is required"],
        trim: true,
        minlength: [2, "Book name must be at least 2 characters"],
    },
    author: {
        type: String,
        required: [true, "Author is required"],
        trim: true,
        minlength: [2, "Author name must be at least 2 characters"],
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
    },
    publishedDate: {
        type: Date,
        required: [true, "Published date is required"],
    },
    courseCode: {
        type: String,
        trim: true,
        default: "",
    },
    bookFile: {
        type: String,
        trim: true,
        default: "",
    },
    onlineUrl: {
        type: String,
        trim: true,
        default: "",
        match: [/^$|^https?:\/\/[^\s$.?#].[^\s]*$/, "Invalid URL format"],
    },
});

module.exports = mongoose.model("Book", bookSchema);