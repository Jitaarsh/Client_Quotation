import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTickets, updateTicketStatus, sendSystemRequestOtp, systemRequestLogin } from '../api/adminTicketApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const useAdminTickets = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Fetch all tickets
  const ticketsQuery = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: getAllTickets,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTicketStatus(id, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: ['admin-ticket', response.data._id] });
      }
      toast.success(response.message || 'Ticket status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const systemRequestOtpMutation = useMutation({
    mutationFn: (id) => sendSystemRequestOtp(id),
    onSuccess: (response) => {
      toast.success(response.message || 'OTP sent to user email');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  const systemRequestLoginMutation = useMutation({
    mutationFn: ({ id, otp }) => systemRequestLogin(id, otp),
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

  return {
    tickets: ticketsQuery.data?.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    sendSystemRequestOtp: systemRequestOtpMutation.mutate,
    isSendingSystemRequestOtp: systemRequestOtpMutation.isPending,
    sendingSystemRequestTicketId: systemRequestOtpMutation.variables,
    loginWithSystemRequestOtp: systemRequestLoginMutation.mutate,
    isLoggingInWithSystemRequestOtp: systemRequestLoginMutation.isPending,
  };
};
