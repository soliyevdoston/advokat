import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Faqat login bo'lgan userlar kira oladigan route
export default function PrivateRoute({
  children,
  requireRole = null,
  redirectTo = '/auth',
  unauthorizedTo = '/dashboard',
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  return children;
}
