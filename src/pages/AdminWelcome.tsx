import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { api } from "../api/client";

const AdminWelcome: React.FC = () => {
  const { initialized, token, isAdmin, profileData, profileLoading } =
    useAuth();
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const retryFetch = useCallback(async () => {
    if (!token) return;
    setRetryError(null);
    setRetryLoading(true);
    try {
      const { data } = await api.get("/profile");
      // This component only shows data; AuthContext owns state, so we just reflect latest via context
      console.debug("[admin-welcome] retry fetched", data);
    } catch (e: any) {
      setRetryError(
        e?.response?.data?.message || e.message || "Failed to load profile"
      );
    } finally {
      setRetryLoading(false);
    }
  }, [token]);

  if (!initialized) return null;
  if (!token || !isAdmin)
    return <p style={{ padding: "1rem" }}>Unauthorized</p>;

  const profile = profileData?.profile || profileData || {};
  const hasProfile = !!profile && Object.keys(profile || {}).length > 0;

  // NOTE: App already wraps this route with MainLayout; don't wrap again to avoid duplicate headers
  return (
    <>
      <div className="card" style={{ padding: "1.25rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Welcome, Admin</h2>
        <p style={{ margin: 0, color: "#555", marginBottom: "0.75rem" }}>
          Quick actions
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          
          <Link
            to="/profile-manage"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 70  ,
              borderRadius: 999,
              background: "#2196f3",
              color: "white",
              fontWeight: 700,
              border: "1px solid #1976d2",
            }}
          >
            My Profile →
          </Link>
          <Link
            to="/village-list"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              borderRadius: 999,
              background: "#ffffff",
              color: "#333",
              fontWeight: 700,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            Village List →
          </Link>
          <Link
            to="/committee-members"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              borderRadius: 999,
              background: "#ffffff",
              color: "#333",
              fontWeight: 700,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            Committee Members →
          </Link>
          <Link
            to="/gallery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              borderRadius: 999,
              background: "#ffffff",
              color: "#333",
              fontWeight: 700,
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            Gallery →
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminWelcome;
