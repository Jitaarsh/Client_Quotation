// src/store/authStore.js
// Zustand store for global authentication state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore - Global auth state manager using Zustand
 *
 * Persists user + token to localStorage so state survives page refresh.
 * Actions:
 *   - setAuth(user, token): Call after successful login/register
 *   - clearAuth():          Call on logout
 *   - setUser(user):        Update user data (e.g., after profile update)
 */
const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────

      /**
       * Set user and token after successful login or registration
       * Also writes token to localStorage for Axios interceptor use
       */
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      /**
       * Update only the user object (e.g., after profile update)
       */
      setUser: (user) => set({ user }),

      /**
       * Clear all auth state and remove token from localStorage
       */
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user and token, not functions
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
