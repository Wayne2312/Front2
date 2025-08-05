// src/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Enable credentials globally
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up axios interceptor to attach token to every request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API}/auth/me/`);
        const userData = response.data.user || response.data; // adjust depending on backend response shape
        setUser(userData);

        const realToken = userData.access_token || storedToken;
        if (realToken) {
          localStorage.setItem('token', realToken);
          setToken(realToken);
        }
      } catch (error) {
        console.error('Error fetching user during init:', error);
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

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');

      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name, role = 'customer') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register/`, {
        email,
        password,
        name,
        role,
      });

      const { user: userData, access_token } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        setToken(access_token);
      }

      setUser(userData);

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');

      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout/`);
    } catch (err) {
      console.log('Logout error (ignored):', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthProvider;
