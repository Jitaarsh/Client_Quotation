import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * PublicRoute Component
 * Redirects to dashboard if user is already authenticated.
 * Used for Login and Register pages.
 */
const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    if (location.pathname === '/register') {
      return <Outlet />;
    }

    // If logged in, don't allow access to Login/Register pages
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Renders the child routes (Login/Register)
  return <Outlet />;
};

export default PublicRoute;
