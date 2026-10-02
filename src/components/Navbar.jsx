import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const hospital = JSON.parse(localStorage.getItem("hospital") || "null");
  const isAuthenticated = Boolean(user || hospital);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getDashboardPath = () => {
    const role = user?.role?.toUpperCase();
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "HOSPITAL" || hospital) return "/hospital/dashboard";
    if (role === "DOCTOR") return "/doctor/dashboard";
    return "/patient/dashboard";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">HealthRoute</span>
          </Link>

          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to={getDashboardPath()}>
                <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/find-doctor">
                <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">
                  Channel Your Doctor
                </button>
              </Link>
            )}

            {!isAuthenticated && (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <Link 
              to={getDashboardPath()} 
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <button className="w-full px-6 py-2.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition font-medium text-center">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link 
                to="/find-doctor" 
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <button className="w-full px-6 py-2.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition font-medium text-center">
                  Channel Your Doctor
                </button>
              </Link>

              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <button className="w-full px-6 py-2.5 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition font-medium text-center">
                  Sign Up
                </button>
              </Link>

              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <button className="w-full px-6 py-2.5 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition font-medium text-center">
                  Log In
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;