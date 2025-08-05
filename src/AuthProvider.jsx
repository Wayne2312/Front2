// src/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/auth/me/`);
        setUser(response.data);
        const realToken = response.data.access_token || response.data.token;
        if (realToken) {
          localStorage.setItem('token', realToken);
          setToken(realToken);
        }
      } catch (error) {
        console.error("Error fetching user during init:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login/`, { email, password });
      const { user: userData, access_token } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        setToken(access_token);
      }
      setUser(userData);
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, role = 'customer') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register/`, { email, password, name, role });
      const { user: userData, access_token } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        setToken(access_token);
      }
      setUser(userData);
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    axios.post(`${API}/auth/logout/`).catch(err => console.log("Logout error (ignored):", err));
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };

export default AuthProvider;
