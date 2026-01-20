import React from 'react';
import { Link } from "react-router-dom";


const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">HealthRoute</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/find-doctor">
  <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition">
    Channel Your Doctor
  </button>
</Link>
            <Link to="/register">
  <button className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition">
    Sign Up
  </button>
</Link>

<Link to="/login">
  <button className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition">
    Log In
  </button>
</Link>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;