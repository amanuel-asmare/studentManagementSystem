import React, { useState, useEffect, useRef, Component } from "react";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { FaBook, FaIdCard, FaUser, FaBuilding, FaCalendarAlt, FaBookOpen, FaSync, FaFilePdf, FaLink, FaTimes } from "react-icons/fa";

interface BookProperty {
  bookId: string;
  bookName: string;
  author: string;
  department: string;
  publishedDate: Date;
  courseCode: string;
  bookFile?: File;
  onlineUrl?: string;
}

interface Course {
  courseCode: string;
  courseName: string;
}

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center dark:bg-gray-800">
          <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700 dark:text-gray-200">
            <h1 className="text-3xl font-bold text-red-600 mb-8 text-center">Something went wrong</h1>
            <p className="text-gray-600 text-center dark:text-gray-300">
              An error occurred. Please try refreshing the page or contact support.
            </p>
            <button
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 dark:bg-blue-700 dark:hover:bg-blue-800"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AddLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [bookInfo, setBookInfo] = useState<BookProperty>({
    bookId: "",
    bookName: "",
    author: "",
    department: "Computer Science",
    publishedDate: new Date(),
    courseCode: "",
    bookFile: undefined,
    onlineUrl: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Partial<BookProperty>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = async (department: string, attempt: number = 1) => {
    if (!department) {
      setFetchError("Please select a department");
      setCourses([]);
      setLoadingCourses(false);
      return;
    }
    setLoadingCourses(true);
    setFetchError(null);
    try {
      console.log(`Fetching courses for ${department}, attempt ${attempt}`);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/api/course-list/department/${encodeURIComponent(department)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Courses fetched:", response.data);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      if (response.data.length === 0) {
        setFetchError(`No courses found for ${department}. Add courses via Add Course page.`);
        setCourses([]);
      } else {
        setCourses(response.data);
      }
      setBookInfo((prev) => ({ ...prev, courseCode: "" }));
    } catch (error: any) {
      console.error(`Failed to fetch courses for ${department} (attempt ${attempt}):`, error);
      if (error.response?.status === 401) {
        setFetchError("Unauthorized. Please log in again.");
        navigate("/");
        return;
      }
      if (attempt < maxRetries) {
        console.log(`Retrying... (${attempt + 1}/${maxRetries})`);
        setTimeout(() => fetchCourses(department, attempt + 1), 1000);
        setRetryCount(attempt);
      } else {
        const errorMessage = error.response?.status === 404
          ? `No courses found for ${department}. Add courses via Add Course page.`
          : `Failed to load courses for ${department}. Please check your connection or try again.`;
        setFetchError(errorMessage);
        setCourses([]);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setFetchError(null);
    fetchCourses(bookInfo.department || "Computer Science");
  };

  useEffect(() => {
    fetchCourses(bookInfo.department || "Computer Science");
  }, [bookInfo.department]);

  const validateForm = () => {
    const newErrors: Partial<BookProperty> = {};
    if (!bookInfo.bookId?.trim()) newErrors.bookId = "Book ID is required";
    else if (!/^[A-Z]{2,4}_BOOK_\d{3}$/.test(bookInfo.bookId)) newErrors.bookId = "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)";
    if (!bookInfo.bookName?.trim()) newErrors.bookName = "Book name is required";
    else if (bookInfo.bookName.length < 2) newErrors.bookName = "Book name must be at least 2 characters";
    if (!bookInfo.author?.trim()) newErrors.author = "Author is required";
    else if (bookInfo.author.length < 2) newErrors.author = "Author name must be at least 2 characters";
    if (!bookInfo.department) newErrors.department = "Department is required";
    if (!bookInfo.publishedDate) newErrors.publishedDate = "Published date is required";
    if (!bookInfo.bookFile && !bookInfo.onlineUrl?.trim()) newErrors.bookFile = "Either a PDF file or an online URL must be provided";
    if (bookInfo.onlineUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(bookInfo.onlineUrl)) newErrors.onlineUrl = "Invalid URL format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "department") {
      setCourses([]);
      setBookInfo((prev) => ({ ...prev, courseCode: "" }));
    }
    if (errors[name as keyof BookProperty]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, bookFile: "Only PDF files are allowed" }));
        setShowErrorToast("Only PDF files are allowed");
        setTimeout(() => setShowErrorToast(null), 5000);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, bookFile: "File size must be less than 5MB" }));
        setShowErrorToast("File size must be less than 5MB");
        setTimeout(() => setShowErrorToast(null), 5000);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setBookInfo((prev) => ({ ...prev, bookFile: file }));
        setErrors((prev) => ({ ...prev, bookFile: undefined }));
      }
    } else {
      setBookInfo((prev) => ({ ...prev, bookFile: undefined }));
      setErrors((prev) => ({ ...prev, bookFile: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setBookInfo((prev) => ({ ...prev, publishedDate: date }));
      if (errors.publishedDate) {
        setErrors((prev) => ({ ...prev, publishedDate: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      console.log("Submitting book:", bookInfo);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append("bookId", bookInfo.bookId || "");
      formData.append("bookName", bookInfo.bookName || "");
      formData.append("author", bookInfo.author || "");
      formData.append("department", bookInfo.department || "");
      formData.append("publishedDate", bookInfo.publishedDate ? format(bookInfo.publishedDate, "yyyy-MM-dd") : "");
      formData.append("courseCode", bookInfo.courseCode || "");
      if (bookInfo.bookFile) {
        formData.append("bookFile", bookInfo.bookFile);
      }
      if (bookInfo.onlineUrl) {
        formData.append("onlineUrl", bookInfo.onlineUrl);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(`${apiUrl}/api/addBook`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setShowSuccessToast(true);
      setBookInfo({
        bookId: "",
        bookName: "",
        author: "",
        department: "Computer Science",
        publishedDate: new Date(),
        courseCode: "",
        bookFile: undefined,
        onlineUrl: "",
      });
      setCourses([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        setShowSuccessToast(false);
        try {
          navigate("/components/admin/book-list");
        } catch (navError) {
          console.error("Navigation error:", navError);
          setShowErrorToast("Failed to navigate. Please go to Book List manually.");
          setTimeout(() => setShowErrorToast(null), 5000);
        }
      }, 3000);
      console.log("Book added:", response.data);
    } catch (error: any) {
      console.error("Error adding book:", error);
      const errorMessage = error.response?.data?.message || "Failed to add book. Please check your input or try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 5000);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookInfo({
      bookId: "",
      bookName: "",
      author: "",
      department: "Computer Science",
      publishedDate: new Date(),
      courseCode: "",
      bookFile: undefined,
      onlineUrl: "",
    });
    setErrors({});
    setCourses([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    try {
      navigate("/components/admin");
    } catch (navError) {
      console.error("Navigation error:", navError);
      setShowErrorToast("Failed to navigate. Please go back manually.");
      setTimeout(() => setShowErrorToast(null), 5000);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center dark:bg-gray-800">
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
            <FaBook className="mr-2" />
            Book added successfully!
          </div>
        )}
        {showErrorToast && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
            {showErrorToast}
            <button
              className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
              onClick={() => setShowErrorToast(null)}
            >
              <FaTimes />
            </button>
          </div>
        )}
        {fetchError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
            {fetchError}
            <button
              className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
              onClick={handleRetry}
            >
              <FaSync />
            </button>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 dark:text-blue-400">Confirm Submission</h2>
              <p className="text-gray-600 mb-6 dark:text-gray-300">Are you sure you want to add this book?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all dark:bg-blue-700 dark:hover:bg-blue-800"
                  onClick={confirmSubmission}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl dark:bg-gray-700 dark:text-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center dark:text-blue-400">Add New Library Book</h1>
          {loadingCourses ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                    <FaIdCard className="mr-2 text-blue-600" /> Book ID
                  </label>
                  <input
                    id="bookId"
                    name="bookId"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                      errors.bookId ? "border-red-500" : "border-gray-300"
                    }`}
                    value={bookInfo.bookId || ""}
                    onChange={handleChange}
                    placeholder="Enter unique book ID (e.g., CS_BOOK_001)"
                    required
                  />
                  {errors.bookId && <p className="text-red-500 text-sm mt-1">{errors.bookId}</p>}
                </div>
                <div>
                  <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                    <FaBook className="mr-2 text-blue-600" /> Book Name
                  </label>
                  <input
                    id="bookName"
                    name="bookName"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                      errors.bookName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={bookInfo.bookName || ""}
                    onChange={handleChange}
                    placeholder="Enter book name"
                    required
                  />
                  {errors.bookName && <p className="text-red-500 text-sm mt-1">{errors.bookName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                    <FaUser className="mr-2 text-blue-600" /> Author
                  </label>
                  <input
                    id="author"
                    name="author"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                      errors.author ? "border-red-500" : "border-gray-300"
                    }`}
                    value={bookInfo.author || ""}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    required
                  />
                  {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                    <FaBuilding className="mr-2 text-blue-600" /> Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                    value={bookInfo.department || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                  <FaBookOpen className="mr-2 text-blue-600" /> Associated Course (Optional)
                </label>
                <select
                  id="courseCode"
                  name="courseCode"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                    errors.courseCode ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.courseCode || ""}
                  onChange={handleChange}
                  disabled={courses.length === 0 || loadingCourses}
                >
                  <option value="">Select course (optional)</option>
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
                {courses.length === 0 && !loadingCourses && !fetchError && (
                  <p className="text-gray-600 text-sm mt-1 dark:text-gray-300">No courses available for {bookInfo.department}. Add courses via Add Course page.</p>
                )}
              </div>
              <div>
                <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                  <FaFilePdf className="mr-2 text-blue-600" /> Upload PDF (Optional)
                </label>
                <input
                  id="bookFile"
                  name="bookFile"
                  type="file"
                  accept="application/pdf"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                    errors.bookFile ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {errors.bookFile && <p className="text-red-500 text-sm mt-1">{errors.bookFile}</p>}
              </div>
              <div>
                <label htmlFor="onlineUrl" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                  <FaLink className="mr-2 text-blue-600" /> Online URL (Optional)
                </label>
                <input
                  id="onlineUrl"
                  name="onlineUrl"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                    errors.onlineUrl ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.onlineUrl || ""}
                  onChange={handleChange}
                  placeholder="Enter online book URL (e.g., https://example.com/book)"
                />
                {errors.onlineUrl && <p className="text-red-500 text-sm mt-1">{errors.onlineUrl}</p>}
              </div>
              <div>
                <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 flex items-center dark:text-gray-200">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Published Date
                </label>
                <DatePicker
                  id="publishedDate"
                  selected={bookInfo.publishedDate}
                  onChange={handleDateChange}
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 ${
                    errors.publishedDate ? "border-red-500" : "border-gray-300"
                  }`}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  required
                />
                {errors.publishedDate && <p className="text-red-500 text-sm mt-1">{errors.publishedDate}</p>}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingCourses}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 dark:bg-blue-700 dark:hover:bg-blue-800 ${
                    (isSubmitting || loadingCourses) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Add Book"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddLibrary;



/*import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { FaBook, FaIdCard, FaUser, FaBuilding, FaCalendarAlt, FaBookOpen, FaSync, FaFilePdf, FaLink } from "react-icons/fa";

interface BookProperty {
  bookId: string;
  bookName: string;
  author: string;
  department: string;
  publishedDate: Date;
  courseCode: string;
  bookFile?: File; // Add file input
  onlineUrl?: string; // Add online URL
}

interface Course {
  courseCode: string;
  courseName: string;
}

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const AddLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [bookInfo, setBookInfo] = useState<BookProperty>({
    bookId: "",
    bookName: "",
    author: "",
    department: "Computer Science",
    publishedDate: new Date(),
    courseCode: "",
    bookFile: undefined,
    onlineUrl: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Partial<BookProperty>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchCourses = async (department: string, attempt: number = 1) => {
    setLoadingCourses(true);
    setFetchError(null);
    try {
      console.log(`Fetching courses for ${department}, attempt ${attempt}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-list/department/${encodeURIComponent(department)}`);
      console.log("Courses fetched:", response.data);
      if (response.data.length === 0) {
        setFetchError(`No courses found for ${department}. Add courses via Add Course page.`);
        setCourses([]);
      } else {
        setCourses(response.data);
      }
      setBookInfo((prev) => ({ ...prev, courseCode: "" }));
    } catch (error: any) {
      console.error(`Failed to fetch courses for ${department} (attempt ${attempt}):`, error);
      if (attempt < maxRetries) {
        console.log(`Retrying... (${attempt + 1}/${maxRetries})`);
        setTimeout(() => fetchCourses(department, attempt + 1), 1000);
      } else {
        const errorMessage = error.response?.status === 404
          ? `No courses found for ${department}. Add courses via Add Course page.`
          : `Failed to load courses for ${department}. Please try again.`;
        setFetchError(errorMessage);
        setCourses([]);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchCourses(bookInfo.department || "Computer Science");
  };

  useEffect(() => {
    fetchCourses(bookInfo.department || "Computer Science");
  }, [bookInfo.department]);

  const validateForm = () => {
    const newErrors: Partial<BookProperty> = {};
    if (!bookInfo.bookId?.trim()) newErrors.bookId = "Book ID is required";
    else if (!/^[A-Z]{2,4}_BOOK_\d{3}$/.test(bookInfo.bookId)) newErrors.bookId = "Book ID must be in format DEPT_BOOK_XXX (e.g., CS_BOOK_001)";
    if (!bookInfo.bookName?.trim()) newErrors.bookName = "Book name is required";
    if (!bookInfo.author?.trim()) newErrors.author = "Author is required";
    if (!bookInfo.department) newErrors.department = "Department is required";
    if (!bookInfo.publishedDate) newErrors.publishedDate = "Published date is required";
    if (!bookInfo.bookFile && !bookInfo.onlineUrl?.trim()) newErrors.bookFile = "Either a PDF file or an online URL must be provided";
    if (bookInfo.onlineUrl && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(bookInfo.onlineUrl)) newErrors.onlineUrl = "Invalid URL format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "department") {
      setCourses([]);
      setBookInfo((prev) => ({ ...prev, courseCode: "" }));
    }
    if (errors[name as keyof BookProperty]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, bookFile: "Only PDF files are allowed" }));
      } else {
        setBookInfo((prev) => ({ ...prev, bookFile: file }));
        setErrors((prev) => ({ ...prev, bookFile: undefined }));
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setBookInfo((prev) => ({ ...prev, publishedDate: date }));
      if (errors.publishedDate) {
        setErrors((prev) => ({ ...prev, publishedDate: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      console.log("Submitting book:", bookInfo);
      const formData = new FormData();
      formData.append("bookId", bookInfo.bookId);
      formData.append("bookName", bookInfo.bookName);
      formData.append("author", bookInfo.author);
      formData.append("department", bookInfo.department);
      formData.append("publishedDate", format(bookInfo.publishedDate, "yyyy-MM-dd"));
      formData.append("courseCode", bookInfo.courseCode || "");
      if (bookInfo.bookFile) {
        formData.append("bookFile", bookInfo.bookFile);
      }
      if (bookInfo.onlineUrl) {
        formData.append("onlineUrl", bookInfo.onlineUrl);
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/addBook`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccessToast(true);
      setBookInfo({
        bookId: "",
        bookName: "",
        author: "",
        department: "Computer Science",
        publishedDate: new Date(),
        courseCode: "",
        bookFile: undefined,
        onlineUrl: "",
      });
      setCourses([]);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Error adding book:", error);
      const errorMessage = error.response?.data?.message || "Failed to add book. Please try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookInfo({
      bookId: "",
      bookName: "",
      author: "",
      department: "Computer Science",
      publishedDate: new Date(),
      courseCode: "",
      bookFile: undefined,
      onlineUrl: "",
    });
    setErrors({});
    setCourses([]);
    navigate("/components/admin");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Book added successfully!
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {showErrorToast}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {fetchError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {fetchError}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRetry}
          >
            <FaSync />
          </button>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to add this book?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                onClick={confirmSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Add New Library Book</h1>
        {loadingCourses ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaIdCard className="mr-2 text-blue-600" /> Book ID
                </label>
                <input
                  id="bookId"
                  name="bookId"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.bookId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.bookId}
                  onChange={handleChange}
                  placeholder="Enter unique book ID (e.g., CS_BOOK_001)"
                  required
                />
                {errors.bookId && <p className="text-red-500 text-sm mt-1">{errors.bookId}</p>}
              </div>
              <div>
                <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBook className="mr-2 text-blue-600" /> Book Name
                </label>
                <input
                  id="bookName"
                  name="bookName"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.bookName ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.bookName}
                  onChange={handleChange}
                  placeholder="Enter book name"
                  required
                />
                {errors.bookName && <p className="text-red-500 text-sm mt-1">{errors.bookName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Author
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.author ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  required
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" /> Department
                </label>
                <select
                  id="department"
                  name="department"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  value={bookInfo.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaBookOpen className="mr-2 text-blue-600" /> Associated Course (Optional)
              </label>
              <select
                id="courseCode"
                name="courseCode"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.courseCode ? "border-red-500" : "border-gray-300"
                }`}
                value={bookInfo.courseCode}
                onChange={handleChange}
                disabled={courses.length === 0 || loadingCourses}
              >
                <option value="">Select course (optional)</option>
                {courses.map((course) => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
              {courses.length === 0 && !loadingCourses && !fetchError && (
                <p className="text-gray-600 text-sm mt-1">No courses available for {bookInfo.department}. Add courses via Add Course page.</p>
              )}
            </div>
            <div>
              <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaFilePdf className="mr-2 text-blue-600" /> Upload PDF (Optional)
              </label>
              <input
                id="bookFile"
                name="bookFile"
                type="file"
                accept="application/pdf"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.bookFile ? "border-red-500" : "border-gray-300"
                }`}
                onChange={handleFileChange}
              />
              {errors.bookFile && <p className="text-red-500 text-sm mt-1">{errors.bookFile}</p>}
            </div>
            <div>
              <label htmlFor="onlineUrl" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaLink className="mr-2 text-blue-600" /> Online URL (Optional)
              </label>
              <input
                id="onlineUrl"
                name="onlineUrl"
                type="text"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.onlineUrl ? "border-red-500" : "border-gray-300"
                }`}
                value={bookInfo.onlineUrl}
                onChange={handleChange}
                placeholder="Enter online book URL (e.g., https://example.com/book)"
              />
              {errors.onlineUrl && <p className="text-red-500 text-sm mt-1">{errors.onlineUrl}</p>}
            </div>
            <div>
              <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Published Date
              </label>
              <DatePicker
                id="publishedDate"
                selected={bookInfo.publishedDate}
                onChange={handleDateChange}
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.publishedDate ? "border-red-500" : "border-gray-300"
                }`}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                required
              />
              {errors.publishedDate && <p className="text-red-500 text-sm mt-1">{errors.publishedDate}</p>}
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loadingCourses}
                className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${
                  (isSubmitting || loadingCourses) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Add Book"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddLibrary;*/