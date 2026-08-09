import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { isManagementUser } from '../utils/managementUser';

/**
 * ProtectedRoute Component
 * Redirects to login page if user is not authenticated.
 * Used for dashboard and all account-related paths.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // replace={true} ensures the user cannot navigate back to the protected route after redirect
    return <Navigate to="/login" replace />;
  }

  // Prevent admins from accessing the company dashboard
  if (!isManagementUser(user) && (user?.role === 'admin' || user?.role === 'superadmin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Renders the child routes (Company Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
