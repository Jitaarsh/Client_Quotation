import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Pencil, 
  Eye,
  LogIn,
  ShieldAlert,
  History,
  X,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle
} from 'lucide-react';

import useAuthStore from '../../../store/authStore';
import { useUpdateProfile, useChangePassword } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Update Hook
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  // Password Change Hook
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  // State for Personal Info
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
  });

  // State for Passwords
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sync form data when user is loaded or updated
  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user.ownerName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  


  const adminName = user?.ownerName || "Admin User";
  const adminEmail = user?.email || "admin@unicrop.com";
  const adminPhone = user?.phone || "9876543210";
  const adminRoleLabel = user?.role === 'superadmin' ? 'Super Admin' : 'Administrator';

  // Handle Profile Update
  const handleProfileUpdate = () => {
    if (!formData.ownerName.trim()) return toast.error('Name is required');
    if (!formData.phone.trim()) return toast.error('Phone is required');

    updateProfile({
      ownerName: formData.ownerName,
      phone: formData.phone,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  // Handle Password Change
  const handlePasswordChange = () => {
    if (!passwordData.currentPassword) return toast.error('Current password is required');
    if (passwordData.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');

    changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }, {
      onSuccess: () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    });
  };

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 lg:gap-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                <span className="text-[#145be9] text-3xl font-black">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#145be9] text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1a2b4b] mb-2">{adminName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-[#145be9] text-[10px] font-black uppercase tracking-widest rounded-full">
                  {adminRoleLabel}
                </span>
                <span className="px-3 py-1 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  <ShieldAlert className="w-3 h-3" />
                  Identity Verified
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#dbeafe] text-[#145be9] font-bold rounded-xl text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </button>
            <button 
              onClick={handleProfileUpdate}
              disabled={isUpdatingProfile}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#145be9] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className={`bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border ${isEditing ? 'border-[#145be9]' : 'border-gray-100'} transition-all duration-300`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-[#1a2b4b]">Personal Information</h3>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleProfileUpdate}
                    disabled={isUpdatingProfile}
                    className="px-4 py-1.5 bg-[#145be9] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-[#145be9] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Pencil className="w-5 h-5" />
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-transparent border-b border-gray-100 py-1 font-bold text-[#1a2b4b] focus:border-[#145be9] outline-none transition-colors"
                  autoFocus
                />
              ) : (
                <p className="text-[15px] font-bold text-[#1a2b4b] py-1 border-b border-transparent">{adminName}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
              <p className="text-[15px] font-bold text-[#1a2b4b] py-1 opacity-60 cursor-not-allowed border-b border-transparent">{adminEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-gray-100 py-1 font-bold text-[#1a2b4b] focus:border-[#145be9] outline-none transition-colors"
                />
              ) : (
                <p className="text-[15px] font-bold text-[#1a2b4b] py-1 border-b border-transparent">{adminPhone}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Access Role</p>
              <p className="text-[15px] font-bold text-[#1a2b4b] py-1 opacity-60 cursor-not-allowed border-b border-transparent">{adminRoleLabel}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1a2b4b] mb-6">Change Password</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-[#edf2f7] text-[#1a2b4b] px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#145be9]/20 transition-all text-lg tracking-[0.2em]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-[#edf2f7] text-[#1a2b4b] px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#145be9]/20 transition-all text-lg tracking-[0.2em]"
                />
                <p className="text-[11px] text-gray-400 font-medium mt-2">
                  Must be at least 8 characters long with a mix of letters and numbers.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-[#edf2f7] text-[#1a2b4b] px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#145be9]/20 transition-all text-lg tracking-[0.2em]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="px-6 py-2.5 bg-[#145be9] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-[#1a2b4b] mb-8">Recent Activity Log</h3>
          
          <div className="space-y-6 flex-1">
            {/* Activity Item */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#145be9] shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[#1a2b4b] text-[15px]">Successful login</p>
                  <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-4">Just now</span>
                </div>
                <p className="text-[13px] font-medium text-gray-500">Chrome on MacOS (192.168.1.1)</p>
              </div>
            </div>

            {/* Activity Item */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[#1a2b4b] text-[15px]">Updated Quotation Policy</p>
                  <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-4">2 hours ago</span>
                </div>
                <p className="text-[13px] font-medium text-gray-500">Global tax rules adjustment applied</p>
              </div>
            </div>

            {/* Activity Item */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[#1a2b4b] text-[15px]">Changed Security Credentials</p>
                  <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-4">Yesterday</span>
                </div>
                <p className="text-[13px] font-medium text-gray-500">Recovery email updated successfully</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button className="text-[11px] font-black text-[#145be9] uppercase tracking-widest hover:text-blue-700 transition-colors">
              View Full History
            </button>
          </div>
        </div>

      </div>

      {/* Public Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            {/* Header / Cover Area */}
            <div className="h-32 bg-gradient-to-r from-[#145be9] to-blue-400 relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar (Overlapping) */}
            <div className="px-8 -mt-12 relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[1.25rem] bg-blue-100 flex items-center justify-center overflow-hidden">
                  <span className="text-[#145be9] text-3xl font-black">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-black text-[#1a2b4b] flex items-center justify-center gap-2">
                  {adminName}
                  <CheckCircle className="w-5 h-5 text-[#145be9] fill-[#145be9]/10" />
                </h2>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">
                  {adminRoleLabel} @ UniCrop
                </p>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#145be9]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-[#1a2b4b]">{adminEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#145be9]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-sm font-bold text-[#1a2b4b]">{adminPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#145be9]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-[#1a2b4b]">Mumbai, India (UniCrop HQ)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#145be9]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</p>
                    <p className="text-sm font-bold text-[#1a2b4b]">March 2026</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="flex-[2] py-3.5 bg-[#145be9] text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Visit Directory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
