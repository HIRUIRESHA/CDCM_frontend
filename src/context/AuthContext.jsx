import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in (on page refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Function (Connects to Backend)
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Normalize Role: Backend sends "ROLE_PATIENT", Frontend expects "PATIENT"
        const cleanRole = data.role.replace('ROLE_', '');
        
        const userData = {
          id: data.id,
          email: data.email,
          role: cleanRole, 
          name: data.email.split('@')[0] // Temporary name from email
        };

        // Save to State & LocalStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        
        return { success: true };
      } else {
        return { success: false, message: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Server error. Is Backend running?" };
    }
  };

  // 3. Register Function (Optional helper, mainly used in Register.jsx)
  const register = async (endpoint, formData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) return { success: true };
      const errorText = await response.text();
      return { success: false, message: errorText };
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  // 4. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login'; // Force redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);