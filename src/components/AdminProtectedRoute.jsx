import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { isManagementUser } from '../utils/managementUser';

/**
 * AdminProtectedRoute Component
 * Redirects to login page if user is not authenticated.
 * Redirects to company dashboard if user is authenticated but not an admin.
 * Used for all admin-related dashboard paths.
 */
const AdminProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // If not logged in, redirect to main login
    return <Navigate to="/login" replace />;
  }

  if (isManagementUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has admin or superadmin role
  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    // If authenticated but not an admin, redirect to company dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Renders the child routes (Admin Dashboard)
  return <Outlet />;
};

export default AdminProtectedRoute;
