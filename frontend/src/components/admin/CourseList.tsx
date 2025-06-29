
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaBook, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Course {
  courseCode: string;
  courseName: string;
  description: string;
  teacherId: string;
  department: string;
  enrolledStudents: string[];
}

const departments = [
  "All Departments", // Added for viewing all courses
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<Course[]>([]);
  const [filteredData, setFilteredData] = useState<Course[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sortField, setSortField] = useState<keyof Course | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [selectedDepartment, searchQuery, courseData]);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-list`);
      setCourseData(response.data);
      setFilteredData(response.data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      setError(error.response?.data?.message || "Failed to fetch course list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courseData];
    
    // Filter by department
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((course) => course.department === selectedDepartment);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.courseCode.toLowerCase().includes(query) ||
          course.courseName.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setSortField(null);
    setSortOrder("asc");
  };

  const handleSort = (field: keyof Course) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[field] || "";
      const bValue = b[field] || "";
      if (field === "enrolledStudents") {
        const aCount = a[field].length;
        const bCount = b[field].length;
        return isAsc ? bCount - aCount : aCount - bCount;
      }
      return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });
    setFilteredData(sortedData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaBook className="mr-2" />
          Course list fetched successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">University Course List</h1>
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
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by course code or name"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
              onClick={() => navigate("/components/admin/add-course")}
            >
              Add Course
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600 text-center">
            {selectedDepartment === "All Departments"
              ? "No courses found."
              : `No courses found for ${selectedDepartment}.`}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("courseCode")}
                  >
                    Code {sortField === "courseCode" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("courseName")}
                  >
                    Name {sortField === "courseName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("description")}
                  >
                    Description {sortField === "description" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("department")}
                  >
                    Department {sortField === "department" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("teacherId")}
                  >
                    Teacher ID {sortField === "teacherId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("enrolledStudents")}
                  >
                    Enrolled Students {sortField === "enrolledStudents" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((course) => (
                  <tr key={course.courseCode} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">{course.courseCode}</td>
                    <td className="px-4 py-2">{course.courseName}</td>
                    <td className="px-4 py-2">{course.description}</td>
                    <td className="px-4 py-2">{course.department}</td>
                    <td className="px-4 py-2">{course.teacherId}</td>
                    <td className="px-4 py-2">{course.enrolledStudents.length} students</td>
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

export default CourseList;
