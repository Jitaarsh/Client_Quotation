import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, updateProfile, changePassword, googleLoginUser } from '../api/authApi';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { isManagementUser } from '../utils/managementUser';
import queryClient from '../lib/queryClient';

/**
 * useLogin - React Query mutation hook for user login
 *
 * On success: saves auth to Zustand store and redirects to dashboard
 */
export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.data, response.token);

      if (isManagementUser(response.data)) {
        navigate('/dashboard');
        return;
      }
      
      // Redirect based on role
      const role = response.data.role;
      if (role === 'admin' || role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    },
  });
};

export const useGoogleLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: googleLoginUser,
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.data, response.token);

      if (isManagementUser(response.data)) {
        navigate('/dashboard');
      } else if (response.data.role === 'admin' || response.data.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    },
  });
};

/**
 * useRegister - React Query mutation hook for user registration
 */
export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.data, response.token);
      navigate('/dashboard');
    },
  });
};

/**
 * useUpdateProfile - Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const { setAuth, token } = useAuthStore();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      setAuth(response.data, token);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

/**
 * useChangePassword - Hook for changing user password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      toast.success(response.message || 'Password updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

/**
 * useLogout - Simple logout action (no API call needed)
 */
export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };
};
