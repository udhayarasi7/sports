import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route protection gate validating authentication state, approval status, and allowed roles.
 */
export default function RoleBasedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // 1. Not Authenticated Gate
  if (!isAuthenticated || !user) {
    return <Navigate to="/login/selection" replace />;
  }

  // 2. Pending / Rejected Status Gate
  // Allow navigation to the status splash warning itself, but block all other dashboards
  if (user.status !== 'approved') {
    return <Navigate to="/status" replace />;
  }

  // 3. Allowed Roles Authorization Gate
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Graceful redirect to the user's correct dashboard
    if (user.role === 'player') return <Navigate to="/player/dashboard" replace />;
    if (user.role === 'coach') return <Navigate to="/coach/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/login/selection" replace />;
  }

  // Authenticated, Approved, and Authorized -> Render children routes
  return <Outlet />;
}
