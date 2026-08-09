import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/terms-conditions/automation';

const automationApi = {
  getRules: async () => {
    const response = await axiosInstance.get(API_ROOT);
    return response.data;
  },

  createRule: async (ruleData) => {
    const response = await axiosInstance.post(API_ROOT, ruleData);
    return response.data;
  },

  updateRule: async (id, ruleData) => {
    const response = await axiosInstance.put(`${API_ROOT}/${id}`, ruleData);
    return response.data;
  },

  deleteRule: async (id) => {
    const response = await axiosInstance.delete(`${API_ROOT}/${id}`);
    return response.data;
  }
};

export default automationApi;
