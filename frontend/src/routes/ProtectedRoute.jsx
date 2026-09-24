import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ROLES } from '../constants';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to matching role dashboard
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    if (user.role === ROLES.RECRUITER) return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};
