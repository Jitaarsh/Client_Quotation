import axiosInstance from './axiosInstance';

const adminCompaniesApi = {
  getAllCompanies: async () => {
    const response = await axiosInstance.get('/admin/companies');
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await axiosInstance.get(`/admin/companies/${id}`);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await axiosInstance.put(`/admin/companies/${id}`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axiosInstance.delete(`/admin/companies/${id}`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await axiosInstance.post('/auth/register', companyData);
    return response.data;
  }
};

export default adminCompaniesApi;
