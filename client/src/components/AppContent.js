import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./Login";
import Register from "./Register";
import Unauthorized from "./Unauthorized";
import CombinedDashboard from "./dashboards/CombinedDashboard";
import ManageRoles from "./ManageRoles";
import ManageRights from "./ManageRights";
import UserManagement from "./UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import LeadManagement from "./LeadManagement";
import EditLead from "./EditLead";
import LeadManagementUser from "./LeadManagementUser";
import Layout from "./Layout";

const AppContent = () => {
  const { user, token, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const getDefaultRoute = () => {
    // Check for stored path first
    const lastPath = localStorage.getItem("lastPath");
    if (lastPath && token && user) {
      return lastPath;
    }

    // If no stored path, retuclrn default dashboard based on role
    if (!user || !user.role) {
      return "/login";
    }
    // console.log(window.location)
    return "/dashboard"; // Redirect to the combined dashboard
  };

  // Clear lastPath when logging out
  React.useEffect(() => {
    if (!token) {
      localStorage.removeItem("lastPath");
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const canAccessDashbord = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "/dashbord" && m.action === "view"
  );
  const canAccessManageroles = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "manage roles" && m.action === "view"
  );
  const canAccessManagerights = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "user management" && m.action === "view"
  );
  const canAccessLeads = user?.role?.assignedModules?.some(
    (m) => m.moduleName === "lead management" && m.action === "view"
  );

  return (
    <Layout showNavbar={!["/login", "/register"].includes(location.pathname)}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            token && user ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            token && user ? (
              <Navigate to={getDefaultRoute()} replace />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CombinedDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-roles"
          element={
            <ProtectedRoute>
              <ManageRoles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-rights/:roleId"
          element={
            <ProtectedRoute >
              <ManageRights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute >
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <LeadManagement />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/leads_user" element={<LeadManagementUser />} /> */}

        {/* <Route path="/leads/edit/:leadId" element={<EditLead />} /> */}

        {/* Root Route */}
        <Route
          path="/"
          element={
            !token || !user ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to={getDefaultRoute()} replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppContent;
