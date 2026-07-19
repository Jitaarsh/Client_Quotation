import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/terms-conditions';

const termsApi = {
  /**
   * Create a new T&C version
   * @param {Object} data - { versionLabel, content, status, isDefault, isReadOnly }
   */
  createTerms: async (data) => {
    const response = await axiosInstance.post(API_ROOT, data);
    return response.data;
  },

  /**
   * Get all T&C versions for the current user
   */
  getAllTerms: async () => {
    const response = await axiosInstance.get(API_ROOT);
    return response.data;
  },

  /**
   * Get a single T&C version by ID
   * @param {string} id
   */
  getTermsById: async (id) => {
    const response = await axiosInstance.get(`${API_ROOT}/${id}`);
    return response.data;
  },

  /**
   * Update an existing T&C version
   * @param {string} id
   * @param {Object} data
   */
  updateTerms: async ({ id, data }) => {
    const response = await axiosInstance.put(`${API_ROOT}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a T&C version by ID
   * @param {string} id
   */
  deleteTerms: async (id) => {
    const response = await axiosInstance.delete(`${API_ROOT}/${id}`);
    return response.data;
  },

  /**
   * Set a version as the active/default version
   * @param {string} id
   */
  setActiveTerms: async (id) => {
    const response = await axiosInstance.patch(`${API_ROOT}/${id}/set-active`);
    return response.data;
  },
};

export default termsApi;
