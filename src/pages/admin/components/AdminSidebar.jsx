import React, { useEffect } from "react";
import { LayoutGrid, Settings, Users, Building, FileText, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import useAdminUIStore from "../../../store/adminUIStore";

const AdminSidebar = () => {
  const { isSidebarOpen, setSidebarOpen } = useAdminUIStore();
  const location = useLocation();
  
  // Auto-collapse sidebar on route change (ONLY for mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  const activeLinkStyle =
    "text-[#145be9] font-bold text-sm border-b-[2.5px] border-[#145be9] pb-1 inline-block transition-all";
  const inactiveLinkStyle =
    "text-gray-500 font-semibold hover:text-[#145be9] hover:bg-white/50 px-4 py-3 rounded-lg text-sm transition-all inline-block w-full";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a]/50 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-[#f4f7fe] h-screen flex flex-col fixed left-0 top-0 border-r border-gray-100/50 z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <h1 className="text-[#145be9] font-black text-xl tracking-tight leading-tight">
            QUICK QUOTE
          </h1>
          <p className="text-gray-500 text-[11px] font-medium tracking-wide">
            Admin Suite
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto w-full custom-scrollbar">
          <div className="pt-2 pb-1">
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span className={isActive ? activeLinkStyle : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")}>
                  Dashboard
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/admin/dashboard/companies"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span className={isActive ? activeLinkStyle : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")}>
                  Companies
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/admin/dashboard/pricing-setup"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span className={isActive ? activeLinkStyle : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")}>
                  Pricing Setup
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/admin/dashboard/tickets"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span className={isActive ? activeLinkStyle : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")}>
                  Support Tickets
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/admin/dashboard/system-settings"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span className={isActive ? activeLinkStyle : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")}>
                  System Settings
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* <div className="p-4 border-t border-gray-200/50">
          <button className="flex items-center justify-center space-x-2 bg-[#e0eafe] text-[#145be9] w-full py-3 rounded-xl font-bold hover:bg-[#d0e0fe] transition-colors text-sm">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div> */}
      </aside>
    </>
  );
};

export default AdminSidebar;
