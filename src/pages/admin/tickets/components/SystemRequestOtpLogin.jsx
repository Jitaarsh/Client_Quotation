import React, { useState } from 'react';
import { KeyRound, MessageSquare, Minimize2, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { systemRequestLogin } from '../../../../api/adminTicketApi';
import useAuthStore from '../../../../store/authStore';
import queryClient from '../../../../lib/queryClient';

const SystemRequestOtpLogin = ({
  ticket,
  defaultMinimized = false,
  onClose,
  showOpenChat = false,
}) => {
  const [otp, setOtp] = useState('');
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ id, code }) => systemRequestLogin(id, code),
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.data, response.token);
      toast.success(response.message || 'Logged in as company user');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!ticket?._id || otp.length !== 6) return;

    loginMutation.mutate({
      id: ticket._id,
      code: otp,
    });
  };

  const handleOpenChat = () => {
    navigate(`/admin/dashboard/tickets/${ticket._id}`, {
      state: { systemRequestOtpTicket: ticket },
    });
  };

  if (!ticket) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm bg-white border border-blue-100 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#145be9] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-black text-[#1a2b4b] truncate">OTP Login Active</p>
            <p className="text-xs font-bold text-gray-400 truncate">{ticket.createdBy?.email}</p>
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loginMutation.isPending}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-60"
            aria-label="Close OTP login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {showOpenChat && (
            <button
              type="button"
              onClick={handleOpenChat}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-black text-[#145be9] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className={`${showOpenChat ? '' : 'col-span-2'} px-3 py-2.5 text-xs font-black text-white bg-[#145be9] rounded-xl hover:bg-blue-700 transition-colors`}
          >
            Enter OTP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#145be9] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#1a2b4b] truncate">OTP Login</h2>
              <p className="text-xs font-bold text-gray-400 truncate">{ticket.createdBy?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              disabled={loginMutation.isPending}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-60"
              aria-label="Minimize OTP login"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loginMutation.isPending}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-60"
              aria-label="Close OTP login"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-sm font-bold text-[#1a2b4b] mb-1">{ticket.ticketId}</p>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Enter the OTP sent to this user to open their company dashboard.
            </p>
          </div>

          <input
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
            autoFocus
            className="w-full px-4 py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-center text-2xl font-black tracking-[0.25em] text-[#1a2b4b] focus:outline-none focus:border-[#145be9] focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            type="submit"
            disabled={otp.length !== 6 || loginMutation.isPending}
            className="w-full py-3.5 bg-[#145be9] text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loginMutation.isPending ? 'Verifying...' : 'Login as User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemRequestOtpLogin;
