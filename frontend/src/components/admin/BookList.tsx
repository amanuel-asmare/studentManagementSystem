
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaBook, FaSearch, FaSync, FaFilePdf, FaLink } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Book {
  bookId: string;
  bookName: string;
  author: string;
  department: string;
  publishedDate: string;
  courseCode: string | null;
  bookFile?: string;
  onlineUrl?: string;
}

const departments = [
  "All Departments",
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [bookData, setBookData] = useState<Book[]>([]);
  const [filteredData, setFilteredData] = useState<Book[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<{ courseCode: string; courseName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sortField, setSortField] = useState<keyof Book | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(2);

  useEffect(() => {
    fetchBooks();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [selectedDepartment, selectedCourse, searchQuery, bookData]);

  const fetchBooks = async (retries = retryCount) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching books, attempt ${3 - retries}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/booklist`);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      console.log("Books fetched:", response.data);
      setBookData(response.data);
      setFilteredData(response.data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Failed to fetch books:", error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchBooks(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage = error.response?.status === 404
          ? "No books found in the library."
          : error.response?.data?.message || "Failed to fetch book list. Please check your connection or try again.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-list`);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      console.log("Courses fetched:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to load courses. Some filtering options may be unavailable.");
    }
  };

  const filterBooks = () => {
    let filtered = [...bookData];
    
    // Filter by department
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((book) => book.department === selectedDepartment);
    }

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter((book) => book.courseCode === selectedCourse);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.bookId.toLowerCase().includes(query) ||
          book.bookName.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.courseCode && book.courseCode.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      });
    }

    setFilteredData(filtered);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedCourse("");
    setSortField(null);
    setSortOrder("asc");
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
    setSortField(null);
    setSortOrder("asc");
  };

  const handleSort = (field: keyof Book) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    setRetryCount(2);
    fetchBooks();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-800">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Book list fetched successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRefresh}
          >
            <FaSync />
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-400">Library Book List</h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-64">
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search by book ID, name, author, or course"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
              onClick={() => navigate("/components/admin/add-library")}
            >
              Add Book
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all w-full md:w-auto"
              onClick={handleRefresh}
            >
              <FaSync className="inline mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600 text-center dark:text-gray-300">
            {selectedDepartment === "All Departments" && !selectedCourse
              ? "No books found in the library."
              : `No books found for ${selectedDepartment}${selectedCourse ? ` and course ${selectedCourse}` : ""}.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white dark:bg-blue-800">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("bookId")}
                  >
                    Book ID {sortField === "bookId" && <FaSort className="inline ml-1" />}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("bookName")}
                  >
                    Name {sortField === "bookName" && <FaSort className="inline ml-1" />}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("author")}
                  >
                    Author {sortField === "author" && <FaSort className="inline ml-1" />}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("department")}
                  >
                    Department {sortField === "department" && <FaSort className="inline ml-1" />}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("courseCode")}
                  >
                    Course {sortField === "courseCode" && <FaSort className="inline ml-1" />}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("publishedDate")}
                  >
                    Published Date {sortField === "publishedDate" && <FaSort className="inline ml-1" />}
                  </th>
                  <th className="px-4 py-2 text-left">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((book) => (
                  <tr key={book.bookId} className="border-b hover:bg-blue-50 dark:hover:bg-blue-900">
                    <td className="px-4 py-2 dark:text-gray-200">{book.bookId}</td>
                    <td className="px-4 py-2 dark:text-gray-200">{book.bookName}</td>
                    <td className="px-4 py-2 dark:text-gray-200">{book.author}</td>
                    <td className="px-4 py-2 dark:text-gray-200">{book.department}</td>
                    <td className="px-4 py-2 dark:text-gray-200">{book.courseCode || "None"}</td>
                    <td className="px-4 py-2 dark:text-gray-200">{new Date(book.publishedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {book.bookFile && (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${book.bookFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <FaFilePdf className="inline mr-1" /> PDF
                        </a>
                      )}
                      {book.bookFile && book.onlineUrl && " | "}
                      {book.onlineUrl && (
                        <a
                          href={book.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <FaLink className="inline mr-1" /> Online
                        </a>
                      )}
                      {!book.bookFile && !book.onlineUrl && (
                        <span className="text-gray-500 dark:text-gray-400">No access</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;

/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaBook, FaSearch, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Book {
  bookId: string;
  bookName: string;
  author: string;
  department: string;
  publishedDate: string;
  courseCode: string | null;
}

const departments = [
  "All Departments",
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [bookData, setBookData] = useState<Book[]>([]);
  const [filteredData, setFilteredData] = useState<Book[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<{ courseCode: string; courseName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sortField, setSortField] = useState<keyof Book | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBooks();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [selectedDepartment, selectedCourse, searchQuery, bookData]);

  const fetchBooks = async (retryCount = 2) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/booklist`);
      setBookData(response.data);
      setFilteredData(response.data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Failed to fetch books:", error);
      if (retryCount > 0) {
        console.log(`Retrying... (${retryCount} attempts left)`);
        setTimeout(() => fetchBooks(retryCount - 1), 1000);
      } else {
        setError(error.response?.data?.message || "Failed to fetch book list. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-list`);
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const filterBooks = () => {
    let filtered = [...bookData];
    
    // Filter by department
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((book) => book.department === selectedDepartment);
    }

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter((book) => book.courseCode === selectedCourse);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.bookId.toLowerCase().includes(query) ||
          book.bookName.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.courseCode && book.courseCode.toLowerCase().includes(query))
      );
    }

    setFilteredData(filtered);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSelectedCourse("");
    setSortField(null);
    setSortOrder("asc");
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
    setSortField(null);
    setSortOrder("asc");
  };

  const handleSort = (field: keyof Book) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[field] || "";
      const bValue = b[field] || "";
      return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });
    setFilteredData(sortedData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchBooks();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Book list fetched successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">Library Book List</h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-64">
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by book ID, name, author, or course"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
              onClick={() => navigate("/components/admin/add-book")}
            >
              Add Book
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all w-full md:w-auto"
              onClick={handleRefresh}
            >
              <FaSync className="inline mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600 text-center">
            {selectedDepartment === "All Departments" && !selectedCourse
              ? "No books found."
              : `No books found for ${selectedDepartment}${selectedCourse ? ` and course ${selectedCourse}` : ""}.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("bookId")}
                  >
                    Book ID {sortField === "bookId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("bookName")}
                  >
                    Name {sortField === "bookName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("author")}
                  >
                    Author {sortField === "author" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("department")}
                  >
                    Department {sortField === "department" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("courseCode")}
                  >
                    Course {sortField === "courseCode" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("publishedDate")}
                  >
                    Published Date {sortField === "publishedDate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((book) => (
                  <tr key={book.bookId} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">{book.bookId}</td>
                    <td className="px-4 py-2">{book.bookName}</td>
                    <td className="px-4 py-2">{book.author}</td>
                    <td className="px-4 py-2">{book.department}</td>
                    <td className="px-4 py-2">{book.courseCode || "None"}</td>
                    <td className="px-4 py-2">{new Date(book.publishedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
*/