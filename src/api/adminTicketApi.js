import axiosInstance from './axiosInstance';

/**
 * Fetch all tickets from all companies (Admin only)
 */
export const getAllTickets = async () => {
  const response = await axiosInstance.get('/admin/tickets');
  return response.data;
};

/**
 * Fetch a single ticket by ID (Admin only)
 * @param {string} id - Ticket ID
 */
export const getTicketById = async (id) => {
  const response = await axiosInstance.get(`/admin/tickets/${id}`);
  return response.data;
};

/**
 * Update a ticket's status
 * @param {string} id - Ticket ID
 * @param {string} status - New status ('OPEN', 'IN PROGRESS', 'RESOLVED')
 */
export const updateTicketStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/admin/tickets/${id}/status`, { status });
  return response.data;
};

/**
 * Send a system request OTP to the ticket owner
 * @param {string} id - Ticket ID
 */
export const sendSystemRequestOtp = async (id) => {
  const response = await axiosInstance.post(`/admin/tickets/${id}/system-request-otp`);
  return response.data;
};

/**
 * Verify a system request OTP and login as the ticket owner
 * @param {string} id - Ticket ID
 * @param {string} otp - OTP sent to ticket owner
 */
export const systemRequestLogin = async (id, otp) => {
  const response = await axiosInstance.post(`/admin/tickets/${id}/system-request-login`, { otp });
  return response.data;
};
