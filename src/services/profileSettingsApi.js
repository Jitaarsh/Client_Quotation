import axiosInstance from '../api/axiosInstance';

const API_ROOT = '/company/profile-settings';

/**
 * ProfileSettings API Service
 * Handles company-specific configuration like numbering, defaults, and branding.
 */
const profileSettingsApi = {
    /**
     * Get settings for the current company
     * If no settings exist, the backend initializes them with defaults.
     */
    getSettings: async () => {
        const response = await axiosInstance.get(API_ROOT);
        return response.data;
    },

    /**
     * Update or create profile settings
     * @param {Object} settingsData - The settings to persist
     */
    updateSettings: async (settingsData) => {
        const response = await axiosInstance.put(API_ROOT, settingsData);
        return response.data;
    }
};

export default profileSettingsApi;
