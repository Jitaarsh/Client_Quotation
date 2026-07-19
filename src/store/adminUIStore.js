import { create } from 'zustand';

const useAdminUIStore = create((set) => ({
  isSidebarOpen: window.innerWidth >= 1024,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

export default useAdminUIStore;
