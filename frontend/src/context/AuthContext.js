import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth token in axios default headers
  const setAuthHeader = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("socialAppUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setAuthHeader(parsed.token);
      } catch {
        localStorage.removeItem("socialAppUser");
      }
    }
    setLoading(false);
  }, [setAuthHeader]);

  // Signup
  const signup = async (username, email, password) => {
    const { data } = await axios.post(`${API}/auth/signup`, { username, email, password });
    localStorage.setItem("socialAppUser", JSON.stringify(data));
    setAuthHeader(data.token);
    setUser(data);
    return data;
  };

  // Login
  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("socialAppUser", JSON.stringify(data));
    setAuthHeader(data.token);
    setUser(data);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("socialAppUser");
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
