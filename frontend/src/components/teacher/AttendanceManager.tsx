import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSync, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Student {
  studId: string;
  studName: string;
  gender: string;
  enrolledCourses: { courseCode: string }[];
  department: string;
}

interface Course {
  courseCode: string;
  courseName: string;
  department: string;
}

interface AttendanceRecord {
  studId: string;
  status: "Present" | "Absent" | "Absent with Apology";
}

const AttendanceManager: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/unauthorized");
      return;
    }

    const fetchAssignedData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assigned-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCourses(response.data.courses);
        setStudents(response.data.students);
        if (response.data.courses.length > 0) {
          setSelectedCourse(response.data.courses[0].courseCode);
        }
      } catch (error: any) {
        console.error("Error fetching assigned data:", error);
        if (error.response?.status === 401) {
          setError("Session expired. Please log in again.");
          logout();
          navigate("/login");
        } else {
          setError(error.response?.data?.message || "Failed to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedData();
  }, [user, navigate, logout]);

  useEffect(() => {
    if (selectedCourse) {
      const filteredStudents = students.filter((student) =>
        student.enrolledCourses.some((course) => course.courseCode === selectedCourse)
      );
      setAttendanceRecords(
        filteredStudents.map((student) => ({
          studId: student.studId,
          status: "Present" as const,
        }))
      );
    }
  }, [selectedCourse, students]);

  const handleStatusChange = (studId: string, status: "Present" | "Absent" | "Absent with Apology") => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studId === studId ? { ...record, status } : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !selectedDate) {
      setError("Please select a course and date.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/save-attendance`,
        {
          courseCode: selectedCourse,
          date: selectedDate.toISOString(),
          attendanceRecords,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Attendance saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        logout();
        navigate("/login");
      } else {
        setError(error.response?.data?.message || "Failed to save attendance. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          <FaCheckCircle className="mr-2" />
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={() => setError(null)}
          >
            <FaTimesCircle />
          </button>
        </div>
      )}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-400 mb-6">
          Attendance Management
        </h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaBook className="mr-2 text-blue-600" /> Select Course
                </label>
                <select
                  id="courseSelect"
                  className="w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course.courseCode} value={course.courseCode}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <FaCalendar className="mr-2 text-blue-600" /> Select Date
                </label>
                <DatePicker
                  id="dateSelect"
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  className="w-full px-4 py-3 mt-1 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                />
              </div>
            </div>
            {selectedCourse && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-blue-600 text-white dark:bg-blue-700">
                    <tr>
                      <th className="px-4 py-2">Student ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Gender</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter((student) =>
                        student.enrolledCourses.some((course) => course.courseCode === selectedCourse)
                      )
                      .map((student) => (
                        <tr
                          key={student.studId}
                          className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <td className="px-4 py-2 dark:text-gray-200">{student.studId}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{student.studName}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{student.gender}</td>
                          <td className="px-4 py-2 dark:text-gray-200">{student.department}</td>
                          <td className="px-4 py-2">
                            <select
                              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
                              value={
                                attendanceRecords.find((record) => record.studId === student.studId)?.status ||
                                "Present"
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  student.studId,
                                  e.target.value as "Present" | "Absent" | "Absent with Apology"
                                )
                              }
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Absent with Apology">Absent with Apology</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
                onClick={handleSaveAttendance}
                disabled={loading || !selectedCourse || !selectedDate}
              >
                {loading ? (
                  <FaSync className="animate-spin inline mr-2" />
                ) : (
                  <FaCheckCircle className="inline mr-2" />
                )}
                Save Attendance
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;
