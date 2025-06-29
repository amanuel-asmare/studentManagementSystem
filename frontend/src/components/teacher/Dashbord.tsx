import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Welcome, Teacher!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your classes, track student progress, and stay organized with the Student Management System, Woldia University.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Active Classes</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Ongoing courses this semester</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pending Grades</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Assignments to be graded</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attendance Rate</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">92%</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Average student attendance</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Recent Activity
        </h3>
        <ul className="space-y-4">
          <li className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-gray-800暗:text-gray-200">Submitted Assignment: Math 101</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">By John Doe • 2 hours ago</p>
            </div>
            <button
              onClick={() => navigate('/components/teacher/assignments')}
              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              View
            </button>
          </li>
          <li className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-gray-800 dark:text-gray-200">Attendance Recorded: CS 202</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today • 9:00 AM</p>
            </div>
            <button
              onClick={() => navigate('/components/teacher/attendance')}
              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              View
            </button>
          </li>
          <li className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-gray-200">New Message: Parent Inquiry</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">From Jane Smith • Yesterday</p>
            </div>
            <button
              onClick={() => navigate('/components/teacher/chat')}
              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              View
            </button>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/components/teacher/attendance')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Record Attendance
          </button>
          <button
            onClick={() => navigate('/components/teacher/assignments')}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;