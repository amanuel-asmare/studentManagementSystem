
import React, { useState, useEffect } from "react";
import { FaTimes, FaBars, FaSync } from "react-icons/fa";
import { FcSettings } from "react-icons/fc";
import axios from "axios";
import adminprofil from "../../assets/myAt_aa.jpg";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

interface OverviewData {
  totalStudents: number;
  totalCourses: number;
  activeTeachers: number;
}

interface Activity {
  student: string;
  course: string;
  status: string;
  date: string;
}

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [overview, setOverview] = useState<OverviewData>({ totalStudents: 0, totalCourses: 0, activeTeachers: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(2);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const hideSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isDashboardRoute = location.pathname === "/components/admin";

  const fetchOverview = async (retries = retryCount) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching overview data, attempt ${3 - retries}`);
      const [studentsRes, coursesRes, teachersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/student-list`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/course-list`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-list`),
      ]);
      if (!Array.isArray(studentsRes.data) || !Array.isArray(coursesRes.data) || !Array.isArray(teachersRes.data)) {
        throw new Error("Invalid response format: Expected arrays");
      }
      setOverview({
        totalStudents: studentsRes.data.length,
        totalCourses: coursesRes.data.length,
        activeTeachers: teachersRes.data.length,
      });
    } catch (error: any) {
      console.error("Failed to fetch overview:", error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchOverview(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage = error.response?.status === 404
          ? "No data found for overview."
          : "Failed to fetch overview data. Please check your connection or try again.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (retries = retryCount) => {
    try {
      console.log(`Fetching recent activities, attempt ${3 - retries}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recent-activities`);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      console.log("Activities fetched:", response.data);
      setActivities(response.data);
    } catch (error: any) {
      console.error("Failed to fetch activities:", error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchActivities(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage = error.response?.status === 404
          ? "No recent activities found."
          : "Failed to fetch recent activities. Please try again.";
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (isDashboardRoute) {
      fetchOverview();
      fetchActivities();
    }
  }, [isDashboardRoute]);

  const handleRefresh = () => {
    setRetryCount(2);
    fetchOverview();
    fetchActivities();
  };

  const asideClassName = [
    "fixed inset-y-0 left-0 w-64 bg-blue-800 text-white flex flex-col p-4",
    "transition-transform duration-300 ease-in-out z-20",
    isSidebarOpen ? "translate-x-0 block" : "-translate-x-full md:hidden",
    "dark:bg-blue-900",
  ].join(" ");

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Error Toast */}
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
      {/* Sidebar */}
      <aside className={asideClassName}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaBars className="text-2xl mr-2" />
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <button className="text-white md:hidden" onClick={hideSidebar}>
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex-1">
          <button
            className="w-full text-left py-2 px-4 mb-2 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors dark:bg-blue-800 dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin")}
          >
            Dashboard
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/add-student")}
          >
            Add Student
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/student-list")}
          >
            Student List
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/course-list")}
          >
            Course List
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/add-course")}
          >
            Add Course
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/add-library")}
          >
            Add Library Book
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/book-list")}
          >
            Book List
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/teacher-management")}
          >
            Teacher Management
          </button>
          <button
            className="w-full text-left py-2 px-4 mb-2 hover:bg-blue-600 rounded-md transition-colors flex items-center dark:hover:bg-blue-700"
            onClick={() => navigate("/components/admin/profile")}
          >
            <FcSettings className="mr-2" /> <span>Settings & Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-0"}`}>
        <header className="bg-white shadow p-4 flex items-center justify-between dark:bg-gray-700 dark:text-gray-200">
          <div className="flex items-center">
            <button className="text-gray-800 dark:text-gray-200 mr-4" onClick={toggleSidebar}>
              <FaBars className="text-2xl" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Student Management System</h1>
          </div>
          <div className="flex items-center">
            <img
              src={adminprofil}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/fallback-image.png";
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-6">
          {isDashboardRoute ? (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-6 dark:bg-gray-700 dark:text-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Overview</h2>
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    onClick={handleRefresh}
                  >
                    <FaSync className="inline mr-2" />
                    Refresh
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-100 p-4 rounded-lg dark:bg-blue-900">
                      <h3 className="text-lg font-medium dark:text-gray-200">Total Students</h3>
                      <p className="text-2xl font-bold dark:text-gray-200">{overview.totalStudents}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg dark:bg-green-900">
                      <h3 className="text-lg font-medium dark:text-gray-200">Total Courses</h3>
                      <p className="text-2xl font-bold dark:text-gray-200">{overview.totalCourses}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg dark:bg-yellow-900">
                      <h3 className="text-lg font-medium dark:text-gray-200">Active Teachers</h3>
                      <p className="text-2xl font-bold dark:text-gray-200">{overview.activeTeachers}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-700 dark:text-gray-200">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">No recent activities found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                        {activities.map((activity, index) => (
                          <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900">
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{activity.student}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{activity.course}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{activity.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">
                              {new Date(activity.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </main>

        <footer className="bg-gray-800 text-white p-4 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Student Management System. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-blue-400">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-400">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-400">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
