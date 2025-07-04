import React, { useState, useEffect, Component } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  {useAuth}  from '../AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaBook, FaVenusMars, FaCalendarAlt, FaLock, FaBuilding, FaCalendar, FaSync, FaTimes } from "react-icons/fa";

interface StudInfo {
  studId?: string;
  studName?: string;
  email?: string;
  phone?: string;
  region?: string;
  gradeLevel?: string;
  gender?: string;
  enrolledCourses?: string[];
  registrationDate?: Date;
  password?: string;
  department?: string;
  batch?: string;
  semester?: string;
  role?: string;
}

interface Course {
  courseCode: string;
  courseName: string;
}

const ethiopianRegions = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela",
  "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "Southwest Ethiopia", "Tigray"
];

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const batches = ["2013 E.C.", "2014 E.C.", "2015 E.C.", "2016 E.C.", "2017 E.C.", "2018 E.C.", "Other"];
const semesters = ["Semester 1", "Semester 2"];

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center dark:bg-gray-800">
          <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700 dark:text-gray-200">
            <h1 className="text-3xl font-bold text-red-600 mb-8 text-center">Something went wrong</h1>
            <p className="text-gray-600 text-center dark:text-gray-300">
              An error occurred: {this.state.error}. Please try refreshing the page or contact support.
            </p>
            <button
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 dark:bg-blue-700 dark:hover:bg-blue-800"
              onClick={() => window.location.reload()}
            >
              <FaSync className="inline mr-2" /> Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AddStudent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [studInfo, setStudInfo] = useState<StudInfo>({
    studId: "",
    studName: "",
    email: "",
    phone: "",
    region: "",
    gradeLevel: "",
    gender: "",
    enrolledCourses: [],
    registrationDate: new Date(),
    password: "",
    department: "",
    batch: "",
    semester: "",
    role: "student",
  });
  const [customBatch, setCustomBatch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Partial<StudInfo & { customBatch?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/course-list`);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format: Expected an array");
        }
        setCourses(response.data);
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setFetchError(error.response?.data?.message || "Failed to load course list. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated, logout, navigate]);

  // Form validation
  const validateForm = () => {
    const newErrors: Partial<StudInfo & { customBatch?: string }> = {};
    if (!studInfo.studId?.trim()) newErrors.studId = "Student ID is required";
    else if (!/^[A-Z]{2,4}_STU_\d{3}$/.test(studInfo.studId)) newErrors.studId = "Student ID must be in format DEPT_STU_XXX (e.g., CS_STU_001)";
    if (!studInfo.studName?.trim()) newErrors.studName = "Student name is required";
    if (!studInfo.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studInfo.email)) newErrors.email = "Invalid email format";
    if (!studInfo.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(studInfo.phone)) newErrors.phone = "Invalid phone number (10-15 digits)";
    if (!studInfo.region) newErrors.region = "Region is required";
    if (!studInfo.gradeLevel) newErrors.gradeLevel = "Year level is required";
    if (!studInfo.gender) newErrors.gender = "Gender is required";
    if (!studInfo.enrolledCourses || studInfo.enrolledCourses.length === 0)
      newErrors.enrolledCourses = "At least one course must be selected";
    if (!studInfo.registrationDate) newErrors.registrationDate = "Registration date is required";
    if (!studInfo.password?.trim()) newErrors.password = "Password is required";
    else if (studInfo.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!studInfo.department) newErrors.department = "Department is required";
    if (!studInfo.batch) newErrors.batch = "Batch is required";
    else if (studInfo.batch === "Other" && !customBatch.trim()) newErrors.customBatch = "Custom batch is required";
    else if (studInfo.batch === "Other" && !/^\d{4}\sE\.C\.$/.test(customBatch)) newErrors.customBatch = "Custom batch must be in format 'YYYY E.C.'";
    if (!studInfo.semester) newErrors.semester = "Semester is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "batch" && value !== "Other") {
      setCustomBatch("");
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
    if (errors[name as keyof StudInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle custom batch input
  const handleCustomBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBatch(value);
    if (errors.customBatch) {
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
  };

  // Handle course selection
  const handleCoursesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setStudInfo((prev) => ({ ...prev, enrolledCourses: selectedOptions }));
    if (errors.enrolledCourses) {
      setErrors((prev) => ({ ...prev, enrolledCourses: undefined }));
    }
  };

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setStudInfo((prev) => ({ ...prev, registrationDate: date }));
      if (errors.registrationDate) {
        setErrors((prev) => ({ ...prev, registrationDate: undefined }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  // Confirm and submit form data
  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formattedData = {
        ...studInfo,
        batch: studInfo.batch === "Other" ? customBatch : studInfo.batch,
        registrationDate: studInfo.registrationDate ? format(studInfo.registrationDate, "yyyy-MM-dd") : "",
        enrolledCourses: studInfo.enrolledCourses || [],
        role: "student",
      };
      await axios.post(`${apiUrl}/api/addStudent`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      setShowSuccessToast(true);
      setStudInfo({
        studId: "",
        studName: "",
        email: "",
        phone: "",
        region: "",
        gradeLevel: "",
        gender: "",
        enrolledCourses: [],
        registrationDate: new Date(),
        password: "",
        department: "",
        batch: "",
        semester: "",
        role: "student",
      });
      setCustomBatch("");
      setErrors({});
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/components/admin");
      }, 3000);
    } catch (error: any) {
      console.error("Error adding student:", error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setShowErrorToast(error.response?.data?.message || "Failed to add student. Please try again.");
        setTimeout(() => setShowErrorToast(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and navigate back
  const resetForm = () => {
    setStudInfo({
      studId: "",
      studName: "",
      email: "",
      phone: "",
      region: "",
      gradeLevel: "",
      gender: "",
      enrolledCourses: [],
      registrationDate: new Date(),
      password: "",
      department: "",
      batch: "",
      semester: "",
      role: "student",
    });
    setCustomBatch("");
    setErrors({});
    navigate("/components/admin");
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center dark:bg-gray-800">
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
            <FaUser className="mr-2" />
            Student added successfully!
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
              onClick={() => window.location.reload()}
            >
              <FaSync />
            </button>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 dark:text-blue-400">Confirm Submission</h2>
              <p className="text-gray-600 mb-6 dark:text-gray-300">
                Are you sure you want to add this student?
              </p>
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
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 dark:bg-gray-700 dark:text-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center dark:text-blue-400">
            Add New Student
          </h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student ID
                  </label>
                  <input
                    id="studId"
                    name="studId"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studId ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studId}
                    onChange={handleChange}
                    placeholder="e.g., CS_STU_001"
                    required
                  />
                  {errors.studId && <p className="text-red-500 text-sm mt-1">{errors.studId}</p>}
                </div>
                <div>
                  <label htmlFor="studName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student Name
                  </label>
                  <input
                    id="studName"
                    name="studName"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studName}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />
                  {errors.studName && <p className="text-red-500 text-sm mt-1">{errors.studName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-600" /> Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaPhone className="mr-2 text-blue-600" /> Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.phone}
                    onChange={handleChange}
                    placeholder="e.g., +251912345678"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaLock className="mr-2 text-blue-600" /> Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 8 characters)"
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaGlobe className="mr-2 text-blue-600" /> Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.region ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.region}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select region</option>
                    {ethiopianRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Year Level
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gradeLevel ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gradeLevel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select year level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                  {errors.gradeLevel && <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>}
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaVenusMars className="mr-2 text-blue-600" /> Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBuilding className="mr-2 text-blue-600" /> Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Batch
                  </label>
                  <select
                    id="batch"
                    name="batch"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.batch ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.batch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                  {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                  {studInfo.batch === "Other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                          errors.customBatch ? "border-red-500" : "border-gray-300"
                        }`}
                        value={customBatch}
                        onChange={handleCustomBatchChange}
                        placeholder="Enter custom batch (e.g., 2019 E.C.)"
                      />
                      {errors.customBatch && <p className="text-red-500 text-sm mt-1">{errors.customBatch}</p>}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.semester ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                  {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
                </div>
                <div>
                  <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-600" /> Registration Date
                  </label>
                  <DatePicker
                    id="registrationDate"
                    selected={studInfo.registrationDate}
                    onChange={handleDateChange}
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.registrationDate ? "border-red-500" : "border-gray-300"
                    }`}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    required
                  />
                  {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaBook className="mr-2 text-blue-600" /> Enrolled Courses
                </label>
                <select
                  id="enrolledCourses"
                  name="enrolledCourses"
                  multiple
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                    errors.enrolledCourses ? "border-red-500" : "border-gray-300"
                  }`}
                  value={studInfo.enrolledCourses}
                  onChange={handleCoursesChange}
                >
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
                {errors.enrolledCourses && <p className="text-red-500 text-sm mt-1">{errors.enrolledCourses}</p>}
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses
                </p>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all dark:bg-blue-700 dark:hover:bg-blue-800 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddStudent;

/*import React, { useState, useEffect, Component } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaBook, FaVenusMars, FaCalendarAlt, FaLock, FaBuilding, FaCalendar, FaSync, FaTimes } from "react-icons/fa";

interface StudInfo {
  studId?: string;
  studName?: string;
  email?: string;
  phone?: string;
  region?: string;
  gradeLevel?: string;
  gender?: string;
  enrolledCourses?: string[];
  registrationDate?: Date;
  password?: string;
  department?: string;
  batch?: string;
  semester?: string;
  role?: string; // Added role
}

interface Course {
  courseCode: string;
  courseName: string;
}

const ethiopianRegions = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela",
  "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "Southwest Ethiopia", "Tigray"
];

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const batches = ["2013 E.C.", "2014 E.C.", "2015 E.C.", "2016 E.C.", "2017 E.C.", "2018 E.C.", "Other"];
const semesters = ["Semester 1", "Semester 2"];

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

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const [studInfo, setStudInfo] = useState<StudInfo>({
    studId: "",
    studName: "",
    email: "",
    phone: "",
    region: "",
    gradeLevel: "",
    gender: "",
    enrolledCourses: [],
    registrationDate: new Date(),
    password: "",
    department: "",
    batch: "",
    semester: "",
    role: "student", // Default role
  });
  const [customBatch, setCustomBatch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Partial<StudInfo & { customBatch?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/course-list`);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format: Expected an array");
        }
        console.log("Courses fetched:", response.data);
        setCourses(response.data);
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        setFetchError("Failed to load course list. Please check your connection or try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<StudInfo & { customBatch?: string }> = {};
    if (!studInfo.studId?.trim()) newErrors.studId = "Student ID is required";
    else if (!/^[A-Z]{2,4}_STU_\d{3}$/.test(studInfo.studId)) newErrors.studId = "Student ID must be in format DEPT_STU_XXX (e.g., CS_STU_001)";
    if (!studInfo.studName?.trim()) newErrors.studName = "Student name is required";
    if (!studInfo.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studInfo.email)) newErrors.email = "Invalid email format";
    if (!studInfo.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(studInfo.phone)) newErrors.phone = "Invalid phone number";
    if (!studInfo.region) newErrors.region = "Region is required";
    if (!studInfo.gradeLevel) newErrors.gradeLevel = "Year level is required";
    if (!studInfo.gender) newErrors.gender = "Gender is required";
    if (!studInfo.enrolledCourses || studInfo.enrolledCourses.length === 0)
      newErrors.enrolledCourses = "At least one course must be selected";
    if (!studInfo.registrationDate) newErrors.registrationDate = "Registration date is required";
    if (!studInfo.password?.trim()) newErrors.password = "Password is required";
    else if (studInfo.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!studInfo.department) newErrors.department = "Department is required";
    if (!studInfo.batch) newErrors.batch = "Batch is required";
    else if (studInfo.batch === "Other" && !customBatch.trim()) newErrors.customBatch = "Custom batch is required";
    else if (studInfo.batch === "Other" && !/^\d{4}\sE\.C\.$/.test(customBatch)) newErrors.customBatch = "Custom batch must be in format 'YYYY E.C.'";
    if (!studInfo.semester) newErrors.semester = "Semester is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "batch" && value !== "Other") {
      setCustomBatch("");
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
    if (errors[name as keyof StudInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBatch(value);
    if (errors.customBatch) {
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
  };

  const handleCoursesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setStudInfo((prev) => ({ ...prev, enrolledCourses: selectedOptions }));
    if (errors.enrolledCourses) {
      setErrors((prev) => ({ ...prev, enrolledCourses: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setStudInfo((prev) => ({ ...prev, registrationDate: date }));
      if (errors.registrationDate) {
        setErrors((prev) => ({ ...prev, registrationDate: undefined }));
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formattedData = {
        ...studInfo,
        batch: studInfo.batch === "Other" ? customBatch : studInfo.batch,
        registrationDate: studInfo.registrationDate ? format(studInfo.registrationDate, "yyyy-MM-dd") : "",
        enrolledCourses: studInfo.enrolledCourses || [],
        role: "student", // Ensure role is included
      };
      const response = await axios.post(`${apiUrl}/api/addStudent`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Student added:", response.data.student);
      setShowSuccessToast(true);
      setStudInfo({
        studId: "",
        studName: "",
        email: "",
        phone: "",
        region: "",
        gradeLevel: "",
        gender: "",
        enrolledCourses: [],
        registrationDate: new Date(),
        password: "",
        department: "",
        batch: "",
        semester: "",
        role: "student",
      });
      setCustomBatch("");
      setTimeout(() => {
        setShowSuccessToast(false);
        try {
          navigate("/components/admin");
        } catch (navError) {
          console.error("Navigation error:", navError);
          setShowErrorToast("Failed to navigate. Please go back manually.");
          setTimeout(() => setShowErrorToast(null), 5000);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Error adding student:", error);
      const errorMessage = error.response?.data?.message || "Failed to add student. Please check your input or try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudInfo({
      studId: "",
      studName: "",
      email: "",
      phone: "",
      region: "",
      gradeLevel: "",
      gender: "",
      enrolledCourses: [],
      registrationDate: new Date(),
      password: "",
      department: "",
      batch: "",
      semester: "",
      role: "student",
    });
    setCustomBatch("");
    setErrors({});
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
            <FaUser className="mr-2" />
            Student added successfully!
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
              onClick={() => window.location.reload()}
            >
              <FaSync />
            </button>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 dark:text-blue-400">Confirm Submission</h2>
              <p className="text-gray-600 mb-6 dark:text-gray-300">Are you sure you want to add this student?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
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
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl dark:bg-gray-700 dark:text-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center dark:text-blue-400">Add New University Student</h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student ID
                  </label>
                  <input
                    id="studId"
                    name="studId"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studId ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studId || ""}
                    onChange={handleChange}
                    placeholder="e.g., CS_STU_001"
                    required
                  />
                  {errors.studId && <p className="text-red-500 text-sm mt-1">{errors.studId}</p>}
                </div>
                <div>
                  <label htmlFor="studName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student Name
                  </label>
                  <input
                    id="studName"
                    name="studName"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studName || ""}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />
                  {errors.studName && <p className="text-red-500 text-sm mt-1">{errors.studName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-600" /> Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.email || ""}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaPhone className="mr-2 text-blue-600" /> Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.phone || ""}
                    onChange={handleChange}
                    placeholder="e.g., +251912345678"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaLock className="mr-2 text-blue-600" /> Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.password || ""}
                    onChange={handleChange}
                    placeholder="Enter password (min 8 characters)"
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaGlobe className="mr-2 text-blue-600" /> Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.region ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.region || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select region</option>
                    {ethiopianRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBuilding className="mr-2 text-blue-600" /> Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.department || ""}
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
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Batch (Year)
                  </label>
                  <select
                    id="batch"
                    name="batch"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.batch ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.batch || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                  {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                  {studInfo.batch === "Other" && (
                    <div className="mt-2">
                      <input
                        id="customBatch"
                        type="text"
                        className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                          errors.customBatch ? "border-red-500" : "border-gray-300"
                        }`}
                        value={customBatch}
                        onChange={handleCustomBatchChange}
                        placeholder="e.g., 2012 E.C."
                        required
                      />
                      {errors.customBatch && <p className="text-red-500 text-sm mt-1">{errors.customBatch}</p>}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.semester ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.semester || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                  {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
                </div>
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Year Level
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gradeLevel ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gradeLevel || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select year level</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                  {errors.gradeLevel && <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaVenusMars className="mr-2 text-blue-600" /> Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gender || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Enrolled Courses
                  </label>
                  <select
                    id="enrolledCourses"
                    name="enrolledCourses"
                    multiple
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.enrolledCourses ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.enrolledCourses || []}
                    onChange={handleCoursesChange}
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.courseCode} value={course.courseCode}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                  {errors.enrolledCourses && <p className="text-red-500 text-sm mt-1">{errors.enrolledCourses}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Registration Date
                </label>
                <DatePicker
                  id="registrationDate"
                  selected={studInfo.registrationDate}
                  onChange={handleDateChange}
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                    errors.registrationDate ? "border-red-500" : "border-gray-300"
                  }`}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  required
                />
                {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
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
                  disabled={isSubmitting || loading}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 dark:bg-blue-700 dark:hover:bg-blue-800 ${
                    (isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Add Student"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddStudent;
*/

/*import React, { useState, useEffect, Component, ComponentType } from "react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaBook, FaVenusMars, FaCalendarAlt, FaLock, FaBuilding, FaCalendar, FaSync, FaTimes } from "react-icons/fa";

interface StudInfo {
  studId?: string;
  studName?: string;
  email?: string;
  phone?: string;
  region?: string;
  gradeLevel?: string;
  gender?: string;
  enrolledCourses?: string[];
  registrationDate?: Date;
  password?: string;
  department?: string;
  batch?: string;
  semester?: string;
}

interface Course {
  courseCode: string;
  courseName: string;
}

const ethiopianRegions = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela",
  "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "Southwest Ethiopia", "Tigray"
];

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const batches = ["2013 E.C.", "2014 E.C.", "2015 E.C.", "2016 E.C.", "2017 E.C.", "2018 E.C.", "Other"];
const semesters = ["Semester 1", "Semester 2"];

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

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const [studInfo, setStudInfo] = useState<StudInfo>({
    studId: "",
    studName: "",
    email: "",
    phone: "",
    region: "",
    gradeLevel: "",
    gender: "",
    enrolledCourses: [],
    registrationDate: new Date(),
    password: "",
    department: "",
    batch: "",
    semester: "",
  });
  const [customBatch, setCustomBatch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Partial<StudInfo & { customBatch?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiUrl}/api/course-list`);
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format: Expected an array");
        }
        console.log("Courses fetched:", response.data);
        setCourses(response.data);
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        setFetchError("Failed to load course list. Please check your connection or try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<StudInfo & { customBatch?: string }> = {};
    if (!studInfo.studId?.trim()) newErrors.studId = "Student ID is required";
    else if (!/^[A-Z]{2,4}_STU_\d{3}$/.test(studInfo.studId)) newErrors.studId = "Student ID must be in format DEPT_STU_XXX (e.g., CS_STU_001)";
    if (!studInfo.studName?.trim()) newErrors.studName = "Student name is required";
    if (!studInfo.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studInfo.email)) newErrors.email = "Invalid email format";
    if (!studInfo.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(studInfo.phone)) newErrors.phone = "Invalid phone number";
    if (!studInfo.region) newErrors.region = "Region is required";
    if (!studInfo.gradeLevel) newErrors.gradeLevel = "Year level is required";
    if (!studInfo.gender) newErrors.gender = "Gender is required";
    if (!studInfo.enrolledCourses || studInfo.enrolledCourses.length === 0)
      newErrors.enrolledCourses = "At least one course must be selected";
    if (!studInfo.registrationDate) newErrors.registrationDate = "Registration date is required";
    if (!studInfo.password?.trim()) newErrors.password = "Password is required";
    else if (studInfo.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!studInfo.department) newErrors.department = "Department is required";
    if (!studInfo.batch) newErrors.batch = "Batch is required";
    else if (studInfo.batch === "Other" && !customBatch.trim()) newErrors.customBatch = "Custom batch is required";
    else if (studInfo.batch === "Other" && !/^\d{4}\sE\.C\.$/.test(customBatch)) newErrors.customBatch = "Custom batch must be in format 'YYYY E.C.'";
    if (!studInfo.semester) newErrors.semester = "Semester is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "batch" && value !== "Other") {
      setCustomBatch("");
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
    if (errors[name as keyof StudInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBatch(value);
    if (errors.customBatch) {
      setErrors((prev) => ({ ...prev, customBatch: undefined }));
    }
  };

  const handleCoursesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setStudInfo((prev) => ({ ...prev, enrolledCourses: selectedOptions }));
    if (errors.enrolledCourses) {
      setErrors((prev) => ({ ...prev, enrolledCourses: undefined }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setStudInfo((prev) => ({ ...prev, registrationDate: date }));
      if (errors.registrationDate) {
        setErrors((prev) => ({ ...prev, registrationDate: undefined }));
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formattedData = {
        ...studInfo,
        batch: studInfo.batch === "Other" ? customBatch : studInfo.batch,
        registrationDate: studInfo.registrationDate ? format(studInfo.registrationDate, "yyyy-MM-dd") : "",
        enrolledCourses: studInfo.enrolledCourses || [],
      };
      const response = await axios.post(`${apiUrl}/api/addStudent`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Student added:", response.data.student);
      setShowSuccessToast(true);
      setStudInfo({
        studId: "",
        studName: "",
        email: "",
        phone: "",
        region: "",
        gradeLevel: "",
        gender: "",
        enrolledCourses: [],
        registrationDate: new Date(),
        password: "",
        department: "",
        batch: "",
        semester: "",
      });
      setCustomBatch("");
      setTimeout(() => {
        setShowSuccessToast(false);
        try {
          navigate("/components/admin");
        } catch (navError) {
          console.error("Navigation error:", navError);
          setShowErrorToast("Failed to navigate. Please go back manually.");
          setTimeout(() => setShowErrorToast(null), 5000);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Error adding student:", error);
      const errorMessage = error.response?.data?.message || "Failed to add student. Please check your input or try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudInfo({
      studId: "",
      studName: "",
      email: "",
      phone: "",
      region: "",
      gradeLevel: "",
      gender: "",
      enrolledCourses: [],
      registrationDate: new Date(),
      password: "",
      department: "",
      batch: "",
      semester: "",
    });
    setCustomBatch("");
    setErrors({});
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
            <FaUser className="mr-2" />
            Student added successfully!
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
              onClick={() => window.location.reload()}
            >
              <FaSync />
            </button>
          </div>
        )}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl dark:bg-gray-700 dark:text-gray-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 dark:text-blue-400">Confirm Submission</h2>
              <p className="text-gray-600 mb-6 dark:text-gray-300">Are you sure you want to add this student?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
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
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 transform transition-all hover:shadow-2xl dark:bg-gray-700 dark:text-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center dark:text-blue-400">Add New University Student</h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student ID
                  </label>
                  <input
                    id="studId"
                    name="studId"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studId ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studId || ""}
                    onChange={handleChange}
                    placeholder="e.g., CS_STU_001"
                    required
                  />
                  {errors.studId && <p className="text-red-500 text-sm mt-1">{errors.studId}</p>}
                </div>
                <div>
                  <label htmlFor="studName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-600" /> Student Name
                  </label>
                  <input
                    id="studName"
                    name="studName"
                    type="text"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.studName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.studName || ""}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />
                  {errors.studName && <p className="text-red-500 text-sm mt-1">{errors.studName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-600" /> Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.email || ""}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaPhone className="mr-2 text-blue-600" /> Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.phone || ""}
                    onChange={handleChange}
                    placeholder="e.g., +251912345678"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaLock className="mr-2 text-blue-600" /> Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.password || ""}
                    onChange={handleChange}
                    placeholder="Enter password (min 8 characters)"
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaGlobe className="mr-2 text-blue-600" /> Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.region ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.region || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select region</option>
                    {ethiopianRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBuilding className="mr-2 text-blue-600" /> Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.department || ""}
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
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Batch (Year)
                  </label>
                  <select
                    id="batch"
                    name="batch"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.batch ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.batch || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                  {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                  {studInfo.batch === "Other" && (
                    <div className="mt-2">
                      <input
                        id="customBatch"
                        type="text"
                        className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                          errors.customBatch ? "border-red-500" : "border-gray-300"
                        }`}
                        value={customBatch}
                        onChange={handleCustomBatchChange}
                        placeholder="e.g., 2012 E.C."
                        required
                      />
                      {errors.customBatch && <p className="text-red-500 text-sm mt-1">{errors.customBatch}</p>}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaCalendar className="mr-2 text-blue-600" /> Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.semester ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.semester || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                  {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
                </div>
                <div>
                  <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Year Level
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gradeLevel ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gradeLevel || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select year level</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                  {errors.gradeLevel && <p className="text-red-500 text-sm mt-1">{errors.gradeLevel}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaVenusMars className="mr-2 text-blue-600" /> Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.gender || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label htmlFor="enrolledCourses" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                    <FaBook className="mr-2 text-blue-600" /> Enrolled Courses
                  </label>
                  <select
                    id="enrolledCourses"
                    name="enrolledCourses"
                    multiple
                    className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                      errors.enrolledCourses ? "border-red-500" : "border-gray-300"
                    }`}
                    value={studInfo.enrolledCourses || []}
                    onChange={handleCoursesChange}
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.courseCode} value={course.courseCode}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                  {errors.enrolledCourses && <p className="text-red-500 text-sm mt-1">{errors.enrolledCourses}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Registration Date
                </label>
                <DatePicker
                  id="registrationDate"
                  selected={studInfo.registrationDate}
                  onChange={handleDateChange}
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 ${
                    errors.registrationDate ? "border-red-500" : "border-gray-300"
                  }`}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  required
                />
                {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
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
                  disabled={isSubmitting || loading}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 dark:bg-blue-700 dark:hover:bg-blue-800 ${
                    (isSubmitting || loading) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Add Student"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddStudent;*/

