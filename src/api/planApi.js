// src/api/planApi.js
// Public plan fetching API call

import axiosInstance from './axiosInstance';

/**
 * Fetch all active plans from the server
 * @returns {Object} - { data: plans[] }
 */
export const getPlans = async () => {
  const response = await axiosInstance.get('/plans');
  return response.data;
};
