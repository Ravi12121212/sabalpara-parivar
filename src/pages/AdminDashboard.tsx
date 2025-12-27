import React from "react";
import { useAuth } from "../hooks/AuthContext";
import { Navigate } from "react-router-dom";
import ProfileManage from "./ProfileManage";

// Admin should see the same UI as a normal user.
// We keep the route admin-only, but render the regular user profile manager.
const AdminDashboard: React.FC = () => {
  const { token, isAdmin, initialized } = useAuth();

  // Wait for hydration
  console.log(token, isAdmin, initialized, "raja ram");
  
  if (!initialized) return null;
  // Auth guard
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/profile-manage" replace />;

  // Admin sees the same UI as a normal user
  return <ProfileManage />;
};

export default AdminDashboard;
