import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import Dashboard from './Dashboard';
import {useAuth}  from '../AuthContext';

const StudentDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isDashboardRoute = location.pathname === '/components/student';

  const asideClassName = [
    'fixed inset-y-0 left-0 w-64 bg-blue-800 text-white flex flex-col p-4',
    'transition-transform duration-300 ease-in-out z-30',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    'dark:bg-blue-900',
  ].join(' ');

  const navItems = [
    { path: '/components/student', label: 'Dashboard', icon: '🏠' },
    { path: '/components/student/course-registration', label: 'Course Registration', icon: '📝' },
    { path: '/components/student/grades', label: 'View Grades', icon: '📊' },
    { path: '/components/student/assignments', label: 'Assignments', icon: '📋' },
    { path: '/components/student/attendance', label: 'View Attendance', icon: '✅' },
    { path: '/components/student/exam-schedule', label: 'Exam Schedule', icon: '📚' },
    { path: '/components/student/schedule', label: 'Class Schedule', icon: '🕒' },
    { path: '/components/student/chat', label: 'Communication', icon: '💬' },
    { path: '/components/student/settings-profile', label: 'Settings & Profile', icon: '⚙️' },
    { path: '/logout', label: 'Logout', icon: '🚪' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      <aside className={asideClassName}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Student Dashboard</h2>
          <button onClick={toggleSidebar} className="md:hidden text-white">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center text-left py-2 px-4 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-200 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-800 dark:text-gray-200"
            >
              <FaBars className="text-2xl" />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Student Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <FaUserCircle className="w-10 h-10 text-gray-600 dark:text-gray-300" />
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-700">
          {isDashboardRoute ? (
            <Dashboard userName={user.name || 'Student'} studId={user.id} />
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="bg-gray-800 dark:bg-gray-900 text-white p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 Student Management System. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard;
/*import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import Dashboard from './Dashboard';
import { useAuth } from '../useAuth';

function StudentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isDashboardRoute = location.pathname === '/components/student';

  const asideClassName = [
    'fixed inset-y-0 left-0 w-64 bg-blue-800 text-white flex flex-col p-4',
    'transition-transform duration-300 ease-in-out z-30',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    'dark:bg-blue-900',
  ].join(' ');

  const navItems = [
    { path: '/components/student', label: 'Dashboard', icon: '🏠' },
    { path: '/components/student/course-registration', label: 'Course Registration', icon: '📝' },
    { path: '/components/student/grades', label: 'View Grades', icon: '📊' },
    { path: '/components/student/assignments', label: 'Assignments', icon: '📋' },
    { path: '/components/student/attendance', label: 'View Attendance', icon: '✅' },
    { path: '/components/student/exam-schedule', label: 'Exam Schedule', icon: '📚' },
    { path: '/components/student/schedule', label: 'Class Schedule', icon: '🕒' },
    { path: '/components/student/chat', label: 'Communication', icon: '💬' },
    { path: '/components/student/settings-profile', label: 'Settings & Profile', icon: '⚙️' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800">
      //{/* Sidebar }
      <aside className={asideClassName}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Student Dashboard</h2>
          <button onClick={toggleSidebar} className="md:hidden text-white">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center text-left py-2 px-4 rounded-md transition-colors
                ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-200 hover:bg-blue-700 hover:text-white'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      //{/* Main Content }
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-800 dark:text-gray-200"
            >
              <FaBars className="text-2xl" />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Student Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <FaUserCircle className="w-10 h-10 text-gray-600 dark:text-gray-300" />
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-700">
          {isDashboardRoute ? <Dashboard userName={user?.name || 'Student'} /> : <Outlet />}
        </main>

        <footer className="bg-gray-800 dark:bg-gray-900 text-white p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 Student Management System. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default StudentDashboard;*/