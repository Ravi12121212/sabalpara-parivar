import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const RequireAdmin: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token, isAdmin, initialized } = useAuth() as any;
  const location = useLocation();

  console.log(!initialized, token);

  if (!initialized) return <div style={{ padding: "1rem" }}>Loading…</div>;
  console.log("2");

  if (!token) {
    // If token exists in localStorage, allow AuthContext to hydrate instead of bouncing
    try {
      const lsToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log("lsToken:", lsToken);

      if (lsToken) return <>{children}</>;
    } catch {}
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    // If localStorage already marks admin, wait one tick for isAdmin to derive
    try {
      const lsAdmin =
        typeof window !== "undefined" ? localStorage.getItem("isAdmin") : null;
      if (lsAdmin === "true")
        return <div style={{ padding: "1rem" }}>Loading…</div>;
    } catch {}
    return <Navigate to="/profile-manage" replace />;
  }
  return <>{children}</>;
};

export default RequireAdmin;
