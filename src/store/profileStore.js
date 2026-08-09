import { create } from 'zustand';
import profileSettingsApi from '../services/profileSettingsApi';

/**
 * useProfileStore - Global store for company profile settings
 * Manages document numbering, tax rates, and branding.
 */
const useProfileStore = create((set, get) => ({
    // ── State ──────────────────────────────────────────────
    settings: null,
    isLoading: false,
    error: null,

    // ── Actions ────────────────────────────────────────────

    /**
     * Fetch settings from the backend
     */
    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await profileSettingsApi.getSettings();
            if (response.success) {
                set({ settings: response.data, isLoading: false });
            } else {
                set({ error: 'Failed to fetch settings', isLoading: false });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    /**
     * Update settings in the store and backend
     * @param {Object} updateData - Partial or full settings object
     */
    updateSettings: async (updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await profileSettingsApi.updateSettings(updateData);
            if (response.success) {
                set({ settings: response.data, isLoading: false });
            } else {
                set({ error: 'Failed to update settings', isLoading: false });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    /**
     * Get a specific setting with a fallback
     */
    getSetting: (key, fallback) => {
        const { settings } = get();
        return settings?.[key] ?? fallback;
    }
}));

export default useProfileStore;
