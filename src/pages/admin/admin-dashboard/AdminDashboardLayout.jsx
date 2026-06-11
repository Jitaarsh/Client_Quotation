import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import useAdminUIStore from '../../../store/adminUIStore';

const AdminDashboardLayout = () => {
  const { isSidebarOpen, setSidebarOpen } = useAdminUIStore();

  // Update based on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex bg-white min-h-screen font-sans">
      {/* Sidebar - fixed width */}
      <AdminSidebar />

      {/* Main Content Area - pushed to the right based on sidebar width */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen relative transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <AdminTopbar />

        {/* Page Content injected via Outlet */}
        <main className="flex-1 bg-white overflow-x-hidden overflow-y-auto h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
