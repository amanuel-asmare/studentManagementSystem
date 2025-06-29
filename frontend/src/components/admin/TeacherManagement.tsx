
import React, { useState, useEffect, ComponentType, ReactNode } from "react";
import axios from "axios";
import { FaUserPlus, FaList, FaSearch, FaSort, FaTrash, FaSync, FaBuilding, FaUser, FaEnvelope, FaPhone, FaMoneyBill, FaCalendar, FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Teacher {
  teacherId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  hireDate: string;
  position: string;
  coursesAssigned: string[];
  status: string;
}

interface TeacherForm {
  teacherId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  salary: string;
  hireDate: string;
  position: string;
  coursesAssigned: string[];
  status: string;
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

const positions = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];
const statuses = ["Active", "On Leave", "Retired"];

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: string | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-center p-4">
          <p>Error rendering teacher list: {this.state.error}</p>
          <p>Please refresh or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const TeacherManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    teacherId: "",
    name: "",
    department: "Computer Science",
    email: "",
    phone: "",
    salary: "",
    hireDate: "",
    position: "Lecturer",
    coursesAssigned: [],
    status: "Active",
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Teacher | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [errors, setErrors] = useState<Partial<TeacherForm>>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const normalizeTeacherData = (data: any[]): Teacher[] => {
    return data.map((item) => ({
      teacherId: item.teacherId || "",
      name: item.name || "",
      department: item.department || "",
      email: item.email || "",
      phone: item.phone || "",
      salary: Number(item.salary) || 0,
      hireDate: item.hireDate ? new Date(item.hireDate).toISOString().split("T")[0] : "",
      position: item.position || "",
      coursesAssigned: Array.isArray(item.coursesAssigned) ? item.coursesAssigned : [],
      status: item.status || "",
    }));
  };

  const fetchTeachers = async (attempt: number = 1) => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log(`Fetching teachers, attempt ${attempt}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-list`);
      console.log("Teachers fetched:", response.data);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format: Expected an array");
      }
      const normalizedTeachers = normalizeTeacherData(response.data);
      setTeachers(normalizedTeachers);
      setFilteredTeachers(normalizedTeachers);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error(`Failed to fetch teachers (attempt ${attempt}):`, error);
      if (attempt < maxRetries) {
        console.log(`Retrying... (${attempt + 1}/${maxRetries})`);
        setTimeout(() => fetchTeachers(attempt + 1), 1000);
      } else {
        const errorMessage = error.response?.status === 404
          ? "No teachers found."
          : `Failed to fetch teacher list: ${error.message}`;
        setFetchError(errorMessage);
        setTeachers([]);
        setFilteredTeachers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-list`);
      console.log("Courses fetched:", response.data);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid course data format: Expected an array");
      }
      setCourses(response.data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      setShowErrorToast(`Failed to fetch courses: ${error.message}`);
      setTimeout(() => setShowErrorToast(null), 3000);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchTeachers();
    } else {
      fetchCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    let filtered = [...teachers];
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((teacher) => teacher.department === selectedDepartment);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (teacher) =>
          teacher.teacherId?.toLowerCase().includes(query) ||
          teacher.name?.toLowerCase().includes(query) ||
          teacher.email?.toLowerCase().includes(query)
      );
    }
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = sortField === "coursesAssigned" ? (a[sortField]?.join(", ") || "") : (a[sortField] || "");
        const bValue = sortField === "coursesAssigned" ? (b[sortField]?.join(", ") || "") : (b[sortField] || "");
        if (sortField === "salary" && typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortOrder === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
      });
    }
    setFilteredTeachers(filtered);
  }, [selectedDepartment, searchQuery, sortField, sortOrder, teachers]);

  const validateForm = () => {
    const newErrors: Partial<TeacherForm> = {};
    if (!teacherForm.teacherId?.trim()) newErrors.teacherId = "Teacher ID is required";
    else if (!/^T\d{3}$/.test(teacherForm.teacherId)) newErrors.teacherId = "Teacher ID must be in format TXXX (e.g., T001)";
    if (!teacherForm.name?.trim()) newErrors.name = "Name is required";
    if (!teacherForm.department) newErrors.department = "Department is required";
    if (!teacherForm.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherForm.email)) newErrors.email = "Invalid email format";
    if (!teacherForm.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?\d{10,12}$/.test(teacherForm.phone)) newErrors.phone = "Phone number must be 10-12 digits";
    if (!teacherForm.salary?.trim()) newErrors.salary = "Salary is required";
    else if (isNaN(Number(teacherForm.salary)) || Number(teacherForm.salary) <= 0) newErrors.salary = "Salary must be a positive number";
    if (!teacherForm.hireDate?.trim()) newErrors.hireDate = "Hire date is required";
    if (!teacherForm.position) newErrors.position = "Position is required";
    if (!teacherForm.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeacherForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof TeacherForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCoursesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourses = Array.from(e.target.selectedOptions, (option) => option.value);
    setTeacherForm((prev) => ({ ...prev, coursesAssigned: selectedCourses }));
    if (errors.coursesAssigned) {
      setErrors((prev) => ({ ...prev, coursesAssigned: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        console.log("Submitting teacher:", { ...teacherForm, salary: Number(teacherForm.salary) });
        await axios.post(`${import.meta.env.VITE_API_URL}/api/addTeacher`, {
          ...teacherForm,
          salary: Number(teacherForm.salary),
        });
        setShowSuccessToast(true);
        setTeacherForm({
          teacherId: "",
          name: "",
          department: "Computer Science",
          email: "",
          phone: "",
          salary: "",
          hireDate: "",
          position: "Lecturer",
          coursesAssigned: [],
          status: "Active",
        });
        setTimeout(() => setShowSuccessToast(false), 3000);
      } catch (error: any) {
        console.error("Error adding teacher:", error);
        const errorMessage = error.response?.data?.message || "Failed to add teacher. Please try again.";
        setShowErrorToast(errorMessage);
        setTimeout(() => setShowErrorToast(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (teacherId: string) => {
    setLoading(true);
    try {
      console.log(`Deleting teacher: ${teacherId}`);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/deleteTeacher/${teacherId}`);
      setTeachers((prev) => prev.filter((teacher) => teacher.teacherId !== teacherId));
      setFilteredTeachers((prev) => prev.filter((teacher) => teacher.teacherId !== teacherId));
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete teacher. Please try again.";
      setShowErrorToast(errorMessage);
      setTimeout(() => setShowErrorToast(null), 3000);
    } finally {
      setShowDeleteModal(null);
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Teacher) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchTeachers();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaUserPlus className="mr-2" />
          {activeTab === "add" ? "Teacher added successfully!" : "Teacher list fetched successfully!"}
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
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete teacher {showDeleteModal}?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                onClick={() => handleDelete(showDeleteModal)}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${activeTab === "add" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("add")}
          >
            Add Teacher
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold ${activeTab === "list" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("list")}
          >
            Teacher List
          </button>
        </div>

        {activeTab === "add" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Teacher ID
                </label>
                <input
                  id="teacherId"
                  name="teacherId"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.teacherId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.teacherId}
                  onChange={handleChange}
                  placeholder="Enter teacher ID (e.g., T001)"
                  required
                />
                {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.name}
                  onChange={handleChange}
                  placeholder="Enter teacher name"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  value={teacherForm.department}
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaEnvelope className="mr-2 text-blue-600" /> Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaPhone className="mr-2 text-blue-600" /> Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number (e.g., +251912345678)"
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaMoneyBill className="mr-2 text-blue-600" /> Salary (ETB)
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.salary ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.salary}
                  onChange={handleChange}
                  placeholder="Enter salary (e.g., 50000)"
                  required
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaCalendar className="mr-2 text-blue-600" /> Hire Date
                </label>
                <input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.hireDate ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.hireDate}
                  onChange={handleChange}
                  required
                />
                {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FaChalkboardTeacher className="mr-2 text-blue-600" /> Position
                </label>
                <select
                  id="position"
                  name="position"
                  className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.position ? "border-red-500" : "border-gray-300"
                  }`}
                  value={teacherForm.position}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select position</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="coursesAssigned" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaChalkboardTeacher className="mr-2 text-blue-600" /> Courses Assigned
              </label>
              <select
                id="coursesAssigned"
                name="coursesAssigned"
                multiple
                className="w-full px-4 py-3 mt-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                value={teacherForm.coursesAssigned}
                onChange={handleCoursesChange}
              >
                {courses.map((course) => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
              {errors.coursesAssigned && <p className="text-red-500 text-sm mt-1">{errors.coursesAssigned}</p>}
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                <FaUser className="mr-2 text-blue-600" /> Status
              </label>
              <select
                id="status"
                name="status"
                className={`w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
                value={teacherForm.status}
                onChange={handleChange}
                required
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300"
                onClick={() => navigate("/components/admin")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Submitting..." : "Add Teacher"}
              </button>
            </div>
          </form>
        ) : (
          <ErrorBoundary>
            <div>
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-blue-800">Teacher List</h2>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <select
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    >
                      <option value="All Departments">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-full md:w-64">
                    <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by ID, name, or email"
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all w-full md:w-auto"
                    onClick={handleRetry}
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
              ) : filteredTeachers.length === 0 ? (
                <p className="text-gray-600 text-center">
                  {selectedDepartment === "All Departments" ? "No teachers found." : `No teachers found for ${selectedDepartment}.`}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("teacherId")}>
                          Teacher ID {sortField === "teacherId" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("name")}>
                          Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("department")}>
                          Department {sortField === "department" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("email")}>
                          Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("phone")}>
                          Phone {sortField === "phone" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("salary")}>
                          Salary {sortField === "salary" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("hireDate")}>
                          Hire Date {sortField === "hireDate" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("position")}>
                          Position {sortField === "position" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("coursesAssigned")}>
                          Courses {sortField === "coursesAssigned" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort("status")}>
                          Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.teacherId} className="border-b hover:bg-blue-50">
                          <td className="px-4 py-2">{teacher.teacherId || "N/A"}</td>
                          <td className="px-4 py-2">{teacher.name || "N/A"}</td>
                          <td className="px-4 py-2">{teacher.department || "N/A"}</td>
                          <td className="px-4 py-2">{teacher.email || "N/A"}</td>
                          <td className="px-4 py-2">{teacher.phone || "N/A"}</td>
                          <td className="px-4 py-2">{typeof teacher.salary === "number" ? teacher.salary.toLocaleString() + " ETB" : "N/A"}</td>
                          <td className="px-4 py-2">{teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : "N/A"}</td>
                          <td className="px-4 py-2">{teacher.position || "N/A"}</td>
                          <td className="px-4 py-2">{Array.isArray(teacher.coursesAssigned) && teacher.coursesAssigned.length > 0 ? teacher.coursesAssigned.join(", ") : "None"}</td>
                          <td className="px-4 py-2">{teacher.status || "N/A"}</td>
                          <td className="px-4 py-2">
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setShowDeleteModal(teacher.teacherId)}
                              disabled={!teacher.teacherId}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
