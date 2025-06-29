import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync } from 'react-icons/fa';
import axios from 'axios';

interface OverviewData {
  enrolledCourses: number;
  upcomingAssignments: number;
  attendanceRate: number;
}

interface Activity {
  course: string;
  action: string;
  date: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData>({
    enrolledCourses: 0,
    upcomingAssignments: 0,
    attendanceRate: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(2);

  const fetchOverview = async (retries = retryCount) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching student overview data, attempt ${3 - retries}`);
      const [coursesRes, assignmentsRes, attendanceRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/student/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/student/assignments`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/student/attendance`),
      ]);
      if (
        !Array.isArray(coursesRes.data) ||
        !Array.isArray(assignmentsRes.data) ||
        !Array.isArray(attendanceRes.data)
      ) {
        throw new Error('Invalid response format: Expected arrays');
      }
      setOverview({
        enrolledCourses: coursesRes.data.length,
        upcomingAssignments: assignmentsRes.data.filter(
          (assignment: any) => new Date(assignment.dueDate) > new Date()
        ).length,
        attendanceRate: attendanceRes.data.length
          ? Math.round(
              (attendanceRes.data.filter((record: any) => record.present).length /
                attendanceRes.data.length) *
                100
            )
          : 0,
      });
    } catch (error: any) {
      console.error('Failed to fetch overview:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchOverview(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage =
          error.response?.status === 404
            ? 'No data found for overview.'
            : 'Failed to fetch overview data. Please check your connection or try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (retries = retryCount) => {
    try {
      console.log(`Fetching recent activities, attempt ${3 - retries}`);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/recent-activities`);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: Expected an array');
      }
      console.log('Activities fetched:', response.data);
      setActivities(response.data);
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchActivities(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage =
          error.response?.status === 404
            ? 'No recent activities found.'
            : 'Failed to fetch recent activities. Please try again.';
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchActivities();
  }, []);

  const handleRefresh = () => {
    setRetryCount(2);
    fetchOverview();
    fetchActivities();
  };

  return (
    <div className="space-y-6">
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

      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Welcome, Student!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Track your courses, assignments, and progress at Woldia University.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Enrolled Courses</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.enrolledCourses}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Courses this semester</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Upcoming Assignments</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.upcomingAssignments}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Assignments due soon</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attendance Rate</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.attendanceRate}%</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Overall attendance this semester</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h3>
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
        ) : activities.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No recent activities found.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li
                key={index}
                className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-600"
              >
                <div>
                  <p className="text-gray-800 dark:text-gray-200">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.course} • {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/components/student/${
                        activity.action.toLowerCase().includes('assignment') ? 'assignments' : 'chat'
                      }`
                    )
                  }
                  className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/components/student/assignments')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit Assignment
          </button>
          <button
            onClick={() => navigate('/components/student/course-registration')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Register for Courses
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;