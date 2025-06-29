import React from "react";
import { FaCog } from "react-icons/fa";

const Settings: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 flex items-center">
          <FaCog className="mr-2" /> Settings
        </h1>
        <p className="text-gray-600">Configure system settings here (e.g., user preferences, system configurations).</p>
        {/* Add settings form or options here */}
      </div>
    </div>
  );
};

export default Settings;