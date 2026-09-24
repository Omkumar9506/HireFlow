import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hireflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hireflow_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('hireflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('hireflow_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Session verification failed, cleared state');
          localStorage.removeItem('hireflow_token');
          localStorage.removeItem('hireflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;

    localStorage.setItem('hireflow_token', accessToken);
    localStorage.setItem('hireflow_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { user: userData, accessToken } = res.data.data;

    localStorage.setItem('hireflow_token', accessToken);
    localStorage.setItem('hireflow_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const sendOtp = async (email, name, purpose = 'REGISTRATION') => {
    const res = await api.post('/auth/send-otp', { email, name, purpose });
    return res.data;
  };

  const verifyOtp = async (email, otp, purpose = 'REGISTRATION') => {
    const res = await api.post('/auth/verify-otp', { email, otp, purpose });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('hireflow_token');
      localStorage.removeItem('hireflow_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('hireflow_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
