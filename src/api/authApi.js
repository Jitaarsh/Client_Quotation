// src/api/authApi.js
// All authentication-related API calls

import axiosInstance from './axiosInstance';

/**
 * Register a new user (multi-step form)
 * @param {Object} data - Full registration payload
 * @returns {Object} - { data, token }
 */
export const registerUser = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

/**
 * Login an existing user
 * @param {{ email: string, password: string }} credentials
 * @returns {Object} - { data, token }
 */
export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch the currently authenticated user's profile
 * @returns {Object} - { data: user }
 */
export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

/**
 * Update the currently authenticated user's profile
 * @param {Object} profileData
 * @returns {Object} - { data: updatedUser }
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Change the currently authenticated user's password
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Object} - { success: true, message: string }
 */
export const changePassword = async (data) => {
  const response = await axiosInstance.put('/auth/change-password', data);
  return response.data;
};

export const googleLoginUser = async (credential) => {
  const response = await axiosInstance.post('/auth/google', { credential });
  return response.data;
};
