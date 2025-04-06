import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token and user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Register (Optional - Local Storage based)
  const register = async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];

      if (users.some(user => user.email === userData.email)) {
        throw new Error('Email already exists');
      }

      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Login using axios + update state + storage
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setCurrentUser(data.user);
      setToken(data.token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setToken(null);
  };

  const updateUser = async (formData) => {
    const token = localStorage.getItem('token'); // Assuming auth token is stored here
  
    try {
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await res.json();
  
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user');
      }
  
      // ✅ Save updated user in state and localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
  
      return data.user;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  };    

  const contextValue = useMemo(() => ({
    currentUser,
    token,
    loading,
    isAuthenticated: !!currentUser,
    register,
    login,
    logout,
    updateUser,
  }), [currentUser, token, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}     
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
