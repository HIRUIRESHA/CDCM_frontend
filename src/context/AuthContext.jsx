import React, { createContext, useContext, useState, useEffect } from 'react';
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Update user details
  const updateUser = (newDetails) => {
    const updatedUser = { ...user, ...newDetails };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ------------------- LOGIN -------------------
  const login = async (email, password) => {
  try {
    const response = await api.post(
      "/api/auth/login",
      {
        email,
        password,
      }
    );

    const data = response.data;

    const loggedInUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      verified: data.verified,
      mustChangePassword:
        data.mustChangePassword,
      profileImage: data.profileImage,
    };

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem(
      "userRole",
      data.role
    );

    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Login failed. Please try again.";

    return {
      success: false,
      message,
    };
  }
};

  // ------------------- REGISTER -------------------
  const register = async (endpoint, formData) => {
    try {
      const response = await fetch(`http://localhost:8082/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) return { success: true };

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return { success: false, message: json.message };
      } catch (e) {
        return { success: false, message: text };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // ------------------- LOGOUT -------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);