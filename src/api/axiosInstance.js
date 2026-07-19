// src/api/axiosInstance.js
// Centralized Axios instance with base URL and auth token injection

import axios from 'axios';

import useAuthStore from '../store/authStore';
import queryClient from '../lib/queryClient';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ── Request Interceptor ──────────────────────────────────────
// Automatically attach the JWT token to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
// Automatically handle 401 errors (expired/invalid token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Clear Zustand store (which also clears localStorage via persist)
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      
      // 2. Clear individual items just in case
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 3. Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
