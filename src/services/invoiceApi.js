import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/invoice';

const invoiceApi = {
    /**
     * Create a new invoice
     * @param {Object} invoiceData 
     */
    createInvoice: async (invoiceData) => {
        const response = await axiosInstance.post(API_ROOT, invoiceData);
        return response.data;
    },

    /**
     * Update an existing invoice
     * @param {string} id
     * @param {Object} invoiceData
     */
    updateInvoice: async (id, invoiceData) => {
        const response = await axiosInstance.put(`${API_ROOT}/${id}`, invoiceData);
        return response.data;
    },

    /**
     * Get all invoices for the current company
     */
    getInvoices: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Get a single invoice by ID
     */
    getInvoiceById: async (id) => {
        const response = await axiosInstance.get(`${API_ROOT}/${id}`);
        return response.data;
    },

    /**
     * Save only the template settings for an invoice
     * @param {string} id - invoice ID
     * @param {{ templateId, bgImage, wmImage, wmOpacity, wmPosition }} settings
     */
    updateTemplateSettings: async (id, settings) => {
        const response = await axiosInstance.patch(`${API_ROOT}/${id}/template`, settings);
        return response.data;
    },

    /**
     * Delete an invoice
     * @param {string} id
     */
    deleteInvoice: async (id) => {
        const response = await axiosInstance.delete(`${API_ROOT}/${id}`);
        return response.data;
    },
};

export default invoiceApi;
