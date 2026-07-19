import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, User, Wallet, Settings as SettingsIcon, Lock, HelpCircle, Power, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { useLogout } from '../../../hooks/useAuth';
import useAdminUIStore from '../../../store/adminUIStore';

const AdminTopbar = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { toggleSidebar } = useAdminUIStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-[50] sticky top-0">
      {/* Hamburger Menu (Mobile & Desktop) */}
      <div>
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <SettingsIcon className="w-5 h-5" />
        </button>

        {/* User Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 cursor-pointer transition-colors ${isDropdownOpen ? 'border-[#145be9]' : 'border-transparent hover:border-gray-200'} focus:outline-none`}
            style={{ padding: '2px' }}
          >
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {user ? (
                <span className="text-[#1a2b4b] font-bold text-sm">
                  {user.ownerName ? user.ownerName.charAt(0).toUpperCase() : 'A'}
                </span>
              ) : (
                <img src="https://i.pravatar.cc/100?img=8" alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Header */}
              <div className="px-5 py-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user ? (
                    <span className="text-[#1a2b4b] font-bold text-sm">
                      {user.ownerName ? user.ownerName.charAt(0).toUpperCase() : 'A'}
                    </span>
                  ) : (
                    <img src="https://i.pravatar.cc/100?img=8" alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[#1a2b4b] font-bold text-[15px] leading-tight">
                    {user?.ownerName || 'Admin User'}
                  </span>
                  <span className="text-[#94a3b8] font-medium text-[13px]">
                    System Administrator
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1 w-full"></div>

              {/* Account Section */}
              <div className="px-5 py-2">
                <span className="text-[#94a3b8] font-bold text-[11px] uppercase tracking-wider block mb-2">Account</span>
                <button
                  onClick={() => {
                    navigate('/admin/dashboard/profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 text-[#334155] font-semibold text-[14px] hover:text-[#1a2b4b] transition-colors py-2 group"
                >
                  <User className="w-[18px] h-[18px] text-[#64748b] group-hover:text-[#145be9] transition-colors" />
                  <span>Profile</span>
                </button>
              </div>

              <div className="h-px bg-gray-100 my-1 w-full shadow-sm"></div>

              {/* Settings Section */}
              <div className="px-5 py-2" onClick={()=>{
                navigate("")
              }}>
                <span className="text-[#94a3b8] font-bold text-[11px] uppercase tracking-wider block mb-2">Settings</span>
                <button
                  onClick={() => {
                    navigate('/admin/dashboard/system-settings');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 text-[#334155] font-semibold text-[14px] hover:text-[#1a2b4b] transition-colors py-2 group"
                >
                  <SettingsIcon className="w-[18px] h-[18px] text-[#64748b] group-hover:text-[#145be9] transition-colors" />
                  <span>System Settings</span>
                </button>
              </div>

              <div className="h-px bg-gray-100 my-2 w-full"></div>

              {/* Logout Button */}
              <div className="px-3 pb-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 text-red-500 font-bold text-[14px] hover:bg-red-50 transition-colors py-2.5 px-2 rounded-xl"
                >
                  <Power className="w-[18px] h-[18px]" />
                  <span>Logout</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
