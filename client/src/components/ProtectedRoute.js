import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Store the current path in localStorage when mounting


  if (loading) {
    return <div>Loading...</div>;
  }

  // if (!token) {
    // Store the attempted path before redirecting
    localStorage.setItem('lastPath', location.pathname);
    // return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  if (!user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 