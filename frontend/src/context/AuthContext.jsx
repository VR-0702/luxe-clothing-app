import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('luxe_token');
    const savedUser = localStorage.getItem('luxe_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid by fetching fresh user data
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('luxe_user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login'/* 'http://localhost:5007/api/auth/login' */, { email, password });
    localStorage.setItem('luxe_token', data.token);
    localStorage.setItem('luxe_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('luxe_token', data.token);
    localStorage.setItem('luxe_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('luxe_token');
    localStorage.removeItem('luxe_user');
    setUser(null);
  }, []);

  const updateProfile = async (formData) => {
    const { data } = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUser(data.user);
    localStorage.setItem('luxe_user', JSON.stringify(data.user));
    return data;
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post(`/auth/wishlist/${productId}`);
      await fetchMe(); // Refresh user with updated wishlist
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  // Helper: check if product is in wishlist
  const isInWishlist = (productId) => {
    return user?.wishlist?.some(id =>
      (typeof id === 'object' ? id._id : id)?.toString() === productId?.toString()
    );
  };

  const value = {
    user, loading,
    login, register, logout, updateProfile,
    toggleWishlist, isInWishlist, fetchMe,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
    isCustomer: user?.role === 'customer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
