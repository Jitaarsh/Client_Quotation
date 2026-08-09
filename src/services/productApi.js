import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/products';

const productApi = {
    /**
     * Create a new product
     * @param {Object|FormData} productData 
     */
    createProduct: async (productData) => {
        const config = productData instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const response = await axiosInstance.post(API_ROOT, productData, config);
        return response.data;
    },

    /**
     * Get all products for the current company
     */
    getProducts: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Get a single product by ID
     */
    getProductById: async (id) => {
        const response = await axiosInstance.get(`${API_ROOT}/${id}`);
        return response.data;
    },

    /**
     * Update an existing product
     * @param {string} id 
     * @param {Object|FormData} data 
     */
    updateProduct: async ({ id, data }) => {
        const config = data instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const response = await axiosInstance.put(`${API_ROOT}/${id}`, data, config);
        return response.data;
    },

    /**
     * Delete a product by ID
     * @param {string} id 
     */
    deleteProduct: async (id) => {
        const response = await axiosInstance.delete(`${API_ROOT}/${id}`);
        return response.data;
    },

    /**
     * Bulk create products
     * @param {FormData} formData
     */
    bulkCreateProducts: async (formData) => {
        const response = await axiosInstance.post(`${API_ROOT}/bulk`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default productApi;
