import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaUserPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import  {useAuth}  from '../AuthContext';

interface Student {
  studId: string;
  studName: string;
  email: string;
  phone: string;
  region: string;
  gradeLevel: string;
  gender: string;
  enrolledCourses: string[];
  registrationDate: string;
  department: string;
  batch: string;
  semester: string;
}

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const StudentList: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Student[]>([]);
  const [filteredData, setFilteredData] = useState<Student[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sortField, setSortField] = useState<keyof Student | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (selectedDepartment && isAuthenticated) {
      fetchStudentList();
    }
  }, [selectedDepartment, isAuthenticated]);

  const fetchStudentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${apiUrl}/api/student-list`, {
        params: { department: selectedDepartment },
      });
      setData(response.data);
      setFilteredData(response.data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(error.response?.data?.message || "Failed to fetch student list. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setSearchQuery("");
    setSortField(null);
    setSortOrder("asc");
    setFilteredData([]);
  };

  const handleSort = (field: keyof Student) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
    const sortedData = [...filteredData].sort((a, b) => {
      if (field === "enrolledCourses") {
        const aValue = a[field].join(", ");
        const bValue = b[field].join(", ");
        return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else if (field === "registrationDate") {
        const aValue = new Date(a[field]).getTime();
        const bValue = new Date(b[field]).getTime();
        return isAsc ? bValue - aValue : aValue - bValue;
      } else {
        const aValue = a[field] || "";
        const bValue = b[field] || "";
        return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
    setFilteredData(sortedData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter(
      (student) =>
        student.studName.toLowerCase().includes(query) ||
        student.studId.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaUserPlus className="mr-2" />
          Student list fetched successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">University Student List</h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="">Select Department</option>
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
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedDepartment}
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
              onClick={() => navigate("/components/admin/add-student")}
            >
              Add Student
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedDepartment ? (
          <p className="text-gray-600 text-center">Please select a department to view students.</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600 text-center">No students found for {selectedDepartment}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("studId")}
                  >
                    ID {sortField === "studId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("studName")}
                  >
                    Name {sortField === "studName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("phone")}
                  >
                    Phone {sortField === "phone" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("region")}
                  >
                    Region {sortField === "region" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("batch")}
                  >
                    Batch {sortField === "batch" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("semester")}
                  >
                    Semester {sortField === "semester" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("gradeLevel")}
                  >
                    Year Level {sortField === "gradeLevel" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("gender")}
                  >
                    Gender {sortField === "gender" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("enrolledCourses")}
                  >
                    Enrolled Courses {sortField === "enrolledCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("registrationDate")}
                  >
                    Registration Date {sortField === "registrationDate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((student) => (
                  <tr key={student.studId} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">{student.studId}</td>
                    <td className="px-4 py-2">{student.studName}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{student.phone}</td>
                    <td className="px-4 py-2">{student.region}</td>
                    <td className="px-4 py-2">{student.batch}</td>
                    <td className="px-4 py-2">{student.semester}</td>
                    <td className="px-4 py-2">{student.gradeLevel}</td>
                    <td className="px-4 py-2">{student.gender}</td>
                    <td className="px-4 py-2">{student.enrolledCourses.join(", ")}</td>
                    <td className="px-4 py-2">
                      {new Date(student.registrationDate).toLocaleDateString()}
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

export default StudentList;/*
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaUserPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Student {
  studId: string;
  studName: string;
  email: string;
  phone: string;
  region: string;
  gradeLevel: string;
  gender: string;
  enrolledCourses: string[];
  registrationDate: string;
  department: string;
  batch: string;
  semester: string;
}

const departments = [
  "Computer Science", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "Medicine", "Law", "Business Administration", "Economics", "Architecture", "Pharmacy",
  "Agriculture", "Public Health", "Social Work", "Education"
];

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Student[]>([]);
  const [filteredData, setFilteredData] = useState<Student[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sortField, setSortField] = useState<keyof Student | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedDepartment) {
      fetchStudentList();
    }
  }, [selectedDepartment]);

  const fetchStudentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`, {
        params: { department: selectedDepartment },
      });
      setData(response.data);
      setFilteredData(response.data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      setError(error.response?.data?.message || "Failed to fetch student list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setSearchQuery("");
    setSortField(null);
    setSortOrder("asc");
    setFilteredData([]);
  };

  const handleSort = (field: keyof Student) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
    const sortedData = [...filteredData].sort((a, b) => {
      if (field === "enrolledCourses") {
        const aValue = a[field].join(", ");
        const bValue = b[field].join(", ");
        return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      } else if (field === "registrationDate") {
        const aValue = new Date(a[field]).getTime();
        const bValue = new Date(b[field]).getTime();
        return isAsc ? bValue - aValue : aValue - bValue;
      } else {
        const aValue = a[field] || "";
        const bValue = b[field] || "";
        return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
    setFilteredData(sortedData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = data.filter(
      (student) =>
        student.studName.toLowerCase().includes(query) ||
        student.studId.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaUserPlus className="mr-2" />
          Student list fetched successfully!
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">University Student List</h1>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="">Select Department</option>
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
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedDepartment}
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto"
              onClick={() => navigate("/components/admin/add-student")}
            >
              Add Student
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedDepartment ? (
          <p className="text-gray-600 text-center">Please select a department to view students.</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600 text-center">No students found for {selectedDepartment}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("studId")}
                  >
                    ID {sortField === "studId" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("studName")}
                  >
                    Name {sortField === "studName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("phone")}
                  >
                    Phone {sortField === "phone" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("region")}
                  >
                    Region {sortField === "region" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("batch")}
                  >
                    Batch {sortField === "batch" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("semester")}
                  >
                    Semester {sortField === "semester" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("gradeLevel")}
                  >
                    Year Level {sortField === "gradeLevel" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("gender")}
                  >
                    Gender {sortField === "gender" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("enrolledCourses")}
                  >
                    Enrolled Courses {sortField === "enrolledCourses" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort("registrationDate")}
                  >
                    Registration Date {sortField === "registrationDate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((student) => (
                  <tr key={student.studId} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2">{student.studId}</td>
                    <td className="px-4 py-2">{student.studName}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{student.phone}</td>
                    <td className="px-4 py-2">{student.region}</td>
                    <td className="px-4 py-2">{student.batch}</td>
                    <td className="px-4 py-2">{student.semester}</td>
                    <td className="px-4 py-2">{student.gradeLevel}</td>
                    <td className="px-4 py-2">{student.gender}</td>
                    <td className="px-4 py-2">{student.enrolledCourses.join(", ")}</td>
                    <td className="px-4 py-2">
                      {new Date(student.registrationDate).toLocaleDateString()}
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

export default StudentList;
*/