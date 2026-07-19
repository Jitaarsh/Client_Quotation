import axiosInstance from '../api/axiosInstance';

const inquiryApi = {
  /**
   * Fetch all inquiries
   */
  getInquiries: async () => {
    const response = await axiosInstance.get('/company/inquiries');
    return response.data;
  },

  /**
   * Create a single inquiry
   */
  createInquiry: async (inquiryData) => {
    const response = await axiosInstance.post('/company/inquiries', inquiryData);
    return response.data;
  },

  /**
   * Bulk create inquiries from CSV
   */
  bulkCreateInquiries: async (inquiries) => {
    const response = await axiosInstance.post('/company/inquiries/bulk', { inquiries });
    return response.data;
  },

  /**
   * Update inquiry status (e.g., to 'Converted')
   */
  updateInquiryStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/company/inquiries/${id}`, { status });
    return response.data;
  },

  /**
   * Proxy fetch from an external URL
   */
  fetchExternal: async (url, token) => {
    const response = await axiosInstance.post('/company/inquiries/fetch-external', { url, token });
    return response.data;
  },

  /**
   * Delete an inquiry
   */
  deleteInquiry: async (id) => {
    const response = await axiosInstance.delete(`/company/inquiries/${id}`);
    return response.data;
  }
};

export default inquiryApi;
