
import React, { useState, useEffect, useRef } from "react";
import { FaUserCog, FaCog, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle dropdown item click
  const handleMenuItemClick = (path: string) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-blue-800 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wolaita Sodo University</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 focus:outline-none"
            onClick={toggleDropdown}
          >
            <FaUserCog className="mr-2" />
            Settings & Profile
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 animate-fade-in">
              <ul className="py-2">
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-800 hover:bg-blue-100 transition-all duration-200"
                    onClick={() => handleMenuItemClick("/components/admin/settings")}
                  >
                    <FaCog className="mr-2 text-blue-600" />
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center px-4 py-2 text-gray-800 hover:bg-blue-100 transition-all duration-200"
                    onClick={() => handleMenuItemClick("/components/admin/profile")}
                  >
                    <FaUser className="mr-2 text-blue-600" />
                    Profile
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
