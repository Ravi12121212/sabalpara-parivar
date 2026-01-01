import React, { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Dashboard from "./Dashboard";
import UserDetailsForm from "./UserDetailsForm";
import ProfileView from "./ProfileView";
import ProfileManage from "./ProfileManage";
import { useAuth } from "../hooks/AuthContext";
import { AuthLayout } from "../components/ui/AuthLayout";
import { MainLayout } from "../components/ui/MainLayout";
import { AuthCard } from "../components/ui/AuthCard";
import { Button } from "../components/ui/Button";
import VillageList from "./VillageList";
import VillagePeople from "./VillagePeople";
import UserDetail from "./UserDetail";
import InvitationPage from "./invitation";
import PreviousResultForm from "./PreviousResultForm";
import AdminDashboard from "./AdminDashboard";
import AdminWelcome from "./AdminWelcome";
import PreviousYearResult from "./PreviousYearResult";
import CommitteeMembers from "./CommitteeMembers";
import GalleryPage from "./Gallery";
import Businesses from "./Businesses";
import BusinessUsers from "./BusinessUsers";
import Notifications from "./Notifications";
import Logout from "./Logout";
import RequireAdmin from "../components/RequireAdmin";

const App: React.FC = () => {
  const { token, logout, finalLogout, isAdmin, initialized } = useAuth();
  const location = useLocation();

  // Central redirect: when authenticated and profile status known, move user
  // Simplify redirect logic and exclude profile-manage so it doesn't bounce back
  // Early guard is fine (no state updates here)
  if (initialized && token && ["/", "/login", "/signup"].includes(location.pathname)) {
    return <Navigate to={isAdmin ? "/admin-welcome" : "/profile-manage"} replace />;
  }

  useEffect(() => {
    if (!initialized) return;
    if (token && isAdmin && location.pathname === "/profile-manage") {
      window.location.replace("/admin-dashboard");
    }
  }, [initialized, token, isAdmin, location.pathname]);

  const isAuthRoute = [
    "/",
    "/previous-year-result",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  // If initialization complete and there's no token, redirect to login for non-auth routes
  if (initialized && !token && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }
  const Layout = isAuthRoute ? AuthLayout : MainLayout;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/previous-result" element={<PreviousResultForm />} />
        <Route path="/previous-year-result" element={<PreviousYearResult />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProfileView />} />
        <Route path="/profile-manage" element={<ProfileManage />} />
        <Route path="/village-list" element={<VillageList />} />
        <Route path="/villages/:villageName" element={<VillagePeople />} />
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="/user-details" element={<UserDetailsForm />} />
        <Route path="/committee-members" element={<CommitteeMembers />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:name" element={<BusinessUsers />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/admin-dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin-welcome"
          element={
            <RequireAdmin>
              <AdminWelcome />
              {/* <p>Welcome to the Admin Dashboard</p> */}
            </RequireAdmin>
          }
        />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Layout>
  );
};
export default App;

{
  /* <Route
  path="/"
  element={
    token ? (
      hasProfile === null ? (
        <p>Loading...</p>
      ) : (
        <Navigate to={hasProfile ? "/dashboard" : "/user-details"} replace />
      )
    ) : (
      <AuthCard title="early bird." subtitle="Your local discount mate">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Button as-child full>
          </Button>
          <Link to="/signup" className="btn btn-primary btn-full">
            Sign Up →
          </Link>
          <Link to="/login" className="btn btn-ghost btn-full">
            Login →
          </Link>
        </div>
      </AuthCard>
    )
  }
/>; */
}
