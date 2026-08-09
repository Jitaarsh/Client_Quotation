import React from 'react';
import { AlertCircle, LogOut, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { useLogout } from '../hooks/useAuth';
import useAuthStore from '../store/authStore';
import { getMe } from '../api/authApi';

const StatusRestrictionOverlay = () => {
  const { user, token, setAuth } = useAuthStore();
  const logout = useLogout();

  // Background polling to check status every 10 seconds
  React.useEffect(() => {
    if (!token) return;

    const checkStatus = async () => {
      try {
        const response = await getMe();
        if (response.success && response.data) {
          // Update the user in the store with latest status
          setAuth(response.data, token);
        }
      } catch (err) {
        console.error('Failed to poll account status:', err);
      }
    };

    // Initial check on mount
    checkStatus();

    // Set up interval
    const interval = setInterval(checkStatus, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [token, setAuth]);

  // If status is Active, don't show anything
  if (!user || user.status === 'Active') return null;

  const isSuspended = user.status === 'Suspended';
  const isPending = user.status === 'Pending';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl border-4 border-white overflow-hidden relative">
        {/* Background Decorative Element */}
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 ${isSuspended ? 'bg-red-500' : 'bg-orange-500'}`} />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${isSuspended ? 'bg-red-50 text-red-500 shadow-red-500/10' : 'bg-orange-50 text-orange-500 shadow-orange-500/10'}`}>
            {isSuspended ? <ShieldAlert className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
          </div>

          <h2 className="text-[#1a2b4b] text-3xl font-black mb-3">
            {isSuspended ? 'Account Suspended' : 'Account Not Active'}
          </h2>
          
          <p className="text-gray-500 font-medium text-lg mb-10 max-w-sm">
            {isSuspended 
              ? 'Your account access has been suspended by the administrator. Please contact our support team for assistance.'
              : 'Your account is currently pending approval. Once an administrator activates your account, you will have full access.', isPending}
          </p>

          <div className="flex items-center space-x-4 w-full">
            <div className="flex-1 bg-gray-50 rounded-2xl p-4 flex items-center space-x-3 border border-gray-100">
              <AlertCircle className={`w-5 h-5 ${isSuspended ? 'text-red-400' : 'text-orange-400'}`} />
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                Support: admin@unicrop.com
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center space-x-2 bg-[#1a2b4b] text-white px-8 py-4 rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95 group"
            >
              <span>Logout</span>
              <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusRestrictionOverlay;
