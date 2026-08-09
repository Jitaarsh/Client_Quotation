import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/help-center';

const helpCenterApi = {
    /**
     * Create a new support ticket
     * @param {Object} ticketData 
     */
    createTicket: async (formData) => {
        const response = await axiosInstance.post(API_ROOT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Get all tickets for the currently logged-in user
     */
    getMyTickets: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Get a single ticket by its ID
     * @param {string} id 
     */
    getTicketById: async (id) => {
        const response = await axiosInstance.get(`${API_ROOT}/${id}`);
        return response.data;
    },
};

export default helpCenterApi;
