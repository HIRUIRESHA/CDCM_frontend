import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save token first
        localStorage.setItem('token', data.token);

        // Build profile URL based on role
        let profileUrl = null;
        if (data.role === 'PATIENT') {
          profileUrl = `http://localhost:8082/api/auth/patients/${data.userId}`;
        } else if (data.role === 'DOCTOR') {
          profileUrl = `http://localhost:8082/api/auth/doctors/${data.userId}`;
        } else if (data.role === 'HOSPITAL') {
          profileUrl = `http://localhost:8082/api/hospital/doctors/all-hospitals/${data.userId}`; 
          // If your backend is like the controller we just fixed, the hospital endpoint might simply be `/api/hospitals/{id}`
          // double-check that
          profileUrl = `http://localhost:8082/api/hospitals/${data.userId}`;
        }

        // Fetch full profile safely
        let profile = null;
        if (profileUrl) {
          try {
            const profileRes = await fetch(profileUrl, {
              headers: { Authorization: `Bearer ${data.token}` },
            });
            if (profileRes.ok) {
              profile = await profileRes.json();
            } else {
              console.warn('Failed to fetch profile:', profileRes.status);
            }
          } catch (e) {
            console.warn('Profile fetch failed after login:', e);
          }
        }

        // Build user object
        const userData = {
          id: data.userId,
          email,
          role: data.role,
          name: profile?.name || data.name || email.split('@')[0],
          profileImage: profile?.profileImage || null,
        };

        // Update state and localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'Server error or invalid JSON response' };
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