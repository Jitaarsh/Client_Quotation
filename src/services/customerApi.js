import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/customers';

const customerApi = {
    /**
     * Create a new customer
     * @param {Object} customerData 
     */
    createCustomer: async (customerData) => {
        const response = await axiosInstance.post(API_ROOT, customerData);
        return response.data;
    },

    /**
     * Bulk create customers from array
     * @param {Object} data - { customers: Array }
     */
    bulkCreateCustomers: async (data) => {
        const response = await axiosInstance.post(`${API_ROOT}/bulk`, data);
        return response.data;
    },

    /**
     * Get all customers for the current company
     */
    getCustomers: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Get a single customer by ID
     */
    getCustomerById: async (id) => {
        const response = await axiosInstance.get(`${API_ROOT}/${id}`);
        return response.data;
    },

    /**
     * Update an existing customer
     * @param {string} id 
     * @param {Object} customerData 
     */
    updateCustomer: async ({ id, data }) => {
        const response = await axiosInstance.put(`${API_ROOT}/${id}`, data);
        return response.data;
    },

    /**
     * Delete a customer by ID
     * @param {string} id 
     */
    deleteCustomer: async (id) => {
        const response = await axiosInstance.delete(`${API_ROOT}/${id}`);
        return response.data;
    }
};

export default customerApi;
