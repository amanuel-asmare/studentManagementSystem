
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSync, FaCheckCircle, FaChartBar, FaTasks } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';

interface OverviewData {
  totalCourses: number;
  totalStudents: number;
  pendingGrades: number;
}

interface Activity {
  id: string;
  student: string;
  course: string;
  action: string;
  date: string;
}

interface TeacherDashboardContentProps {
  userName: string;
}

const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({ userName }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData>({ totalCourses: 0, totalStudents: 0, pendingGrades: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(2);

  const fetchOverview = async (retries = retryCount) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching teacher overview, attempt ${3 - retries}`);
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('session_expired'));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      const [coursesRes, studentsRes, gradesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/pending-grades`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!Array.isArray(coursesRes.data) || !Array.isArray(studentsRes.data) || !Array.isArray(gradesRes.data)) {
        throw new Error(t('invalid_response_format'));
      }
      setOverview({
        totalCourses: coursesRes.data.length,
        totalStudents: studentsRes.data.length,
        pendingGrades: gradesRes.data.length,
      });
    } catch (error: any) {
      console.error('Failed to fetch overview:', error);
      if (error.response?.status === 401) {
        setError(t('session_expired'));
        setTimeout(() => navigate('/login'), 3000);
      } else if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchOverview(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage = error.response?.status === 404 ? t('data_not_found') : t('fetch_overview_failed');
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (retries = retryCount) => {
    try {
      console.log(`Fetching recent activities, attempt ${3 - retries}`);
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('session_expired'));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher-recent-activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(response.data)) {
        throw new Error(t('invalid_response_format'));
      }
      setActivities(response.data);
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      if (error.response?.status === 401) {
        setError(t('session_expired'));
        setTimeout(() => navigate('/login'), 3000);
      } else if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchActivities(retries - 1), 1000);
        setRetryCount(retries - 1);
      } else {
        const errorMessage = error.response?.status === 404 ? t('no_activities') : t('fetch_activities_failed');
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchActivities();
  }, [navigate, t]);

  const handleRefresh = () => {
    setRetryCount(2);
    fetchOverview();
    fetchActivities();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {t('welcome', { name: userName })}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t('manage_courses_grades_attendance')}
        </p>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
          {error}
          <button
            className="ml-2 px-2 py-1 bg-white text-red-500 rounded hover:bg-gray-200"
            onClick={handleRefresh}
            aria-label={t('retry')}
          >
            <FaSync />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6 dark:bg-gray-700 dark:text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('overview')}</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            onClick={handleRefresh}
            aria-label={t('refresh')}
          >
            <FaSync className="inline mr-2" />
            {t('refresh')}
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg dark:bg-blue-900">
              <h3 className="text-lg font-medium dark:text-gray-200">{t('total_courses')}</h3>
              <p className="text-2xl font-bold dark:text-gray-200">{overview.totalCourses}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg dark:bg-green-900">
              <h3 className="text-lg font-medium dark:text-gray-200">{t('total_students')}</h3>
              <p className="text-2xl font-bold dark:text-gray-200">{overview.totalStudents}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg dark:bg-yellow-900">
              <h3 className="text-lg font-medium dark:text-gray-200">{t('pending_grades')}</h3>
              <p className="text-2xl font-bold dark:text-gray-200">{overview.pendingGrades}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 dark:bg-gray-700 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4">{t('quick_actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/components/teacher/attendance')}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            aria-label={t('mark_attendance')}
          >
            <FaCheckCircle className="mr-2" />
            {t('mark_attendance')}
          </button>
          <button
            onClick={() => navigate('/components/teacher/grade-management')}
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            aria-label={t('grade_assignments')}
          >
            <FaChartBar className="mr-2" />
            {t('grade_assignments')}
          </button>
          <button
            onClick={() => navigate('/components/teacher/assignments')}
            className="flex items-center justify-center p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
            aria-label={t('create_assignment')}
          >
            <FaTasks className="mr-2" />
            {t('create_assignment')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-700 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4">{t('recent_activity')}</h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">{t('no_activities')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-600">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                    {t('student')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                    {t('course')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                    {t('action')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                    {t('date')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-blue-50 dark:hover:bg-blue-900">
                    <td className="px-6 py-3 whitespace-nowrap dark:text-gray-200">{activity.student}</td>
                    <td className="px-6 py-3 whitespace-nowrap dark:text-gray-200">{activity.course}</td>
                    <td className="px-6 py-3 whitespace-nowrap dark:text-gray-200">{activity.action}</td>
                    <td className="px-6 py-3 whitespace-nowrap dark:text-gray-200">
                      {new Date(activity.date).toLocaleDateString(undefined, {
                        timeZone: user?.settings?.timeZone || 'Africa/Addis_Ababa',
                      })}
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

export default TeacherDashboardContent;


/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync } from 'react-icons/fa';
import axios from 'axios';

interface OverviewData {
  assignedCourses: number;
  totalStudents: number;
  upcomingClasses: number;
}

interface Activity {
  course: string;
  action: string;
  date: string;
}

interface TeacherDashboardContentProps {
  userName: string;
}

function TeacherDashboardContent({ userName }: TeacherDashboardContentProps) {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData>({
    assignedCourses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(2);

  const fetchOverview = async (retries = retryCount) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching teacher overview data, attempt ${3 - retries}`);
      const [coursesRes, studentsRes, classesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/students`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/schedule`),
      ]);
      if (
        !Array.isArray(coursesRes.data) ||
        !Array.isArray(studentsRes.data) ||
        !Array.isArray(classesRes.data)
      ) {
        throw new Error('Invalid response format: Expected arrays');
      }
      setOverview({
        assignedCourses: coursesRes.data.length,
        totalStudents: studentsRes.data.length,
        upcomingClasses: classesRes.data.filter(
          (schedule: any) => new Date(schedule.date) > new Date()
        ).length,
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/recent-activities`);
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
      //{/* Error Toast }
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

    //  {/* Welcome Section }
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Welcome, {userName}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your courses, assignments, and student interactions at Woldia University.
        </p>
      </div>

      //{/* Quick Stats }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Assigned Courses</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.assignedCourses}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Courses this semester</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.totalStudents}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Students in your courses</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Upcoming Classes</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overview.upcomingClasses}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Classes this week</p>
        </div>
      </div>

     // {/* Recent Activity }
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
                      `/components/teacher/${
                        activity.action.toLowerCase().includes('assignment') ? 'assignments' : 'communication'
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

     // {/* Quick Actions }
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/components/teacher/assignments')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Assignment
          </button>
          <button
            onClick={() => navigate('/components/teacher/grades')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Grade Students
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardContent;*/