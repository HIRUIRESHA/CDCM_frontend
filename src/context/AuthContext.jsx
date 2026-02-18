import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        
        // Backend sends: { message, userId, role, name }
        const userData = {
          id: data.userId, 
          email: email,    
          role: data.role, 
          // Use real name from backend, or fallback to email name if missing
          name: data.name || email.split('@')[0] 
        };
        

        // Save to State & LocalStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Server error or Invalid JSON response" };
    }
  };

  //  Register Function
  const register = async (endpoint, formData) => {
    try {
      
      const response = await fetch(`http://localhost:8082/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) return { success: true };
      
      // Handle text vs json error responses safely
      const text = await response.text();
      try {
          const json = JSON.parse(text);
          return { success: false, message: json.message };
      } catch (e) {
          return { success: false, message: text };
      }
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);