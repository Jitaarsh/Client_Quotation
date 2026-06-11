import React, { useEffect } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  // Auto-collapse sidebar on route change (ONLY for mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

  const activeLinkStyle =
    "text-[#145be9] font-bold text-sm border-b-[2.5px] border-[#145be9] pb-1 inline-block transition-all";
  const inactiveLinkStyle =
    "text-gray-500 font-semibold hover:text-[#145be9] hover:bg-white/50 px-4 py-3 rounded-lg text-sm transition-all inline-block w-full";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a]/50 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-[#f4f7fe] h-screen flex flex-col fixed left-0 top-0 border-r border-gray-100/50 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <h1 className="text-[#145be9] font-black text-xl tracking-tight leading-tight">
            QUICK QUOTE
          </h1>
          <p className="text-gray-500 text-[11px] font-medium tracking-wide">
            Management Suite
          </p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto w-full custom-scrollbar">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                isActive
                  ? "bg-white text-[#145be9] shadow-sm border border-transparent"
                  : "text-gray-500 hover:text-[#145be9] hover:bg-white/50"
              }`
            }
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Overview</span>
          </NavLink>

          <div className="pt-2 pb-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Dashboard
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/customers"
              className={({ isActive }) => {
                return `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`;
              }}
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Customers
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/products"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Product/Service
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/quotation-format"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Quotation Format
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/create-quotation"
              className={({ isActive }) => {
                const isQuotationActive =
                  isActive ||
                  location.pathname.startsWith("/dashboard/edit-template");
                return `px-4 py-2 w-full flex justify-start ${isQuotationActive ? "" : "hover:bg-white/50 rounded-lg"}`;
              }}
            >
              {({ isActive }) => {
                const isQuotationActive =
                  isActive ||
                  location.pathname.startsWith("/dashboard/edit-template");
                return (
                  <span
                    className={
                      isQuotationActive
                        ? activeLinkStyle
                        : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                    }
                  >
                    Create Quotation
                  </span>
                );
              }}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/quotation-preview"
              className={({ isActive }) => {
                const isListActive = 
                  isActive || 
                  location.pathname === "/dashboard/quotation-preview" ||
                  (location.pathname.startsWith("/dashboard/quotation-preview/") && !location.pathname.includes("/edit"));
                return `px-4 py-2 w-full flex justify-start ${isListActive ? "" : "hover:bg-white/50 rounded-lg"}`;
              }}
            >
              {({ isActive }) => {
                const isListActive = 
                  isActive || 
                  location.pathname === "/dashboard/quotation-preview" ||
                  (location.pathname.startsWith("/dashboard/quotation-preview/") && !location.pathname.includes("/edit"));
                return (
                  <span
                    className={
                      isListActive
                        ? activeLinkStyle
                        : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                    }
                  >
                    List of Quotation
                  </span>
                );
              }}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/invoice"
              className={({ isActive }) => {
                const isInvoiceActive = isActive || location.pathname === "/dashboard/invoices";
                return `px-4 py-2 w-full flex justify-start ${isInvoiceActive ? "" : "hover:bg-white/50 rounded-lg"}`;
              }}
            >
              {({ isActive }) => {
                const isInvoiceActive = isActive || location.pathname === "/dashboard/invoices";
                return (
                  <span
                    className={
                      isInvoiceActive
                        ? activeLinkStyle
                        : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                    }
                  >
                    Invoice
                  </span>
                );
              }}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/inquiries"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Inquiries
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/terms"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Terms & Conditions
                </span>
              )}
            </NavLink>
          </div>

          <div className="pt-1 pb-1">
            <NavLink
              to="/dashboard/help-center"
              className={({ isActive }) =>
                `px-4 py-2 w-full flex justify-start ${isActive ? "" : "hover:bg-white/50 rounded-lg"}`
              }
            >
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle.replace("px-4 py-3", "px-0 py-0")
                  }
                >
                  Help Center
                </span>
              )}
            </NavLink>
          </div>
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
