import axiosInstance from "./axiosInstance";

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @returns {Promise} - API response
 */
export const sendOtpApi = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password/send-otp", {
    email,
  });
  return response.data;
};

/**
 * Verify OTP
 * @param {string} email - User's email address
 * @param {string} otp - OTP code
 * @returns {Promise} - API response
 */
export const verifyOtpApi = async (email, otp) => {
  const response = await axiosInstance.post("/auth/forgot-password/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

/**
 * Reset password
 * @param {string} email - User's email address
 * @param {string} newPassword - New password
 * @returns {Promise} - API response
 */
export const resetPasswordApi = async (email, newPassword) => {
  const response = await axiosInstance.post("/auth/forgot-password/reset", {
    email,
    newPassword,
  });
  return response.data;
};
