import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/quotation';

const quotationApi = {
    /**
     * Create a new quotation
     * @param {Object} quotationData 
     */
    createQuotation: async (quotationData) => {
        const response = await axiosInstance.post(API_ROOT, quotationData);
        return response.data;
    },

    /**
     * Update an existing quotation
     * @param {string} id
     * @param {Object} quotationData
     */
    updateQuotation: async (id, quotationData) => {
        const response = await axiosInstance.put(`${API_ROOT}/${id}`, quotationData);
        return response.data;
    },

    /**
     * Get all quotations for the current company
     */
    getQuotations: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Get a single quotation by ID
     */
    getQuotationById: async (id) => {
        const response = await axiosInstance.get(`${API_ROOT}/${id}`);
        return response.data;
    },

    /**
     * Save only the template settings for a quotation
     * @param {string} id - quotation ID
     * @param {{ templateId, bgImage, wmImage, wmOpacity, wmPosition }} settings
     */
    updateTemplateSettings: async (id, settings) => {
        const response = await axiosInstance.patch(`${API_ROOT}/${id}/template`, settings);
        return response.data;
    },

    /**
     * Email selected quotations to their customers
     */
    shareQuotations: async (quotationIds) => {
        const response = await axiosInstance.post(`${API_ROOT}/share`, { quotationIds });
        return response.data;
    },

    /**
     * Get all available quotation templates
     */
    getTemplates: async () => {
        const response = await axiosInstance.get('/company/templates');
        return response.data;
    },
};

export default quotationApi;

