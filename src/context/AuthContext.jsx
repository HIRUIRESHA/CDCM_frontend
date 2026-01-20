import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real app, you would initialize this from localStorage or an API call upon refresh.
  // For now, we will mock the initial state.
  // Change 'role' to 'PATIENT', 'DOCTOR', or 'HOSPITAL' to test different views.
  const [user, setUser] = useState({
    name: 'Test User',
    role: 'ADMIN', // <--- CHANGE THIS VALUE TO TEST DIFFERENT SIDEBARS
    email: 'test@example.com'
  });

  // Mock login function (replace with real API call later)
  const login = (role) => {
    setUser({ name: 'Demo User', role: role, email: 'demo@example.com' });
  };

  // Mock logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};