import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load user on startup
    const storedUser = localStorage.getItem('queueless_user');
    const storedToken = localStorage.getItem('queueless_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('queueless_token', data.token);
      
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        collegeId: data.collegeId,
      };
      
      localStorage.setItem('queueless_user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role, collegeId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        collegeId,
      });

      localStorage.setItem('queueless_token', data.token);
      
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        collegeId: data.collegeId,
      };
      
      localStorage.setItem('queueless_user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('queueless_token');
    localStorage.removeItem('queueless_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
