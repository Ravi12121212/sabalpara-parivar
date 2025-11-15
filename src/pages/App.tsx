import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Dashboard from "./Dashboard";
import UserDetailsForm from "./UserDetailsForm";
import ProfileView from "./ProfileView";
import { useAuth } from "../hooks/AuthContext";
import { AuthLayout } from "../components/ui/AuthLayout";
import { AuthCard } from "../components/ui/AuthCard";
import { Button } from "../components/ui/Button";
import VillageList from "./VillageList";
import InvitationPage from "./invitation";

const App: React.FC = () => {
  const { token, logout, hasProfile } = useAuth();
  const location = useLocation();

  // Central redirect: when authenticated and profile status known, move user
  if (token && hasProfile !== null) {
    const target = hasProfile ? "/dashboard" : "/user-details";
    if (
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/signup"
    ) {
      return <Navigate to={target} replace />;
    }
  }

  console.log(token, "dd");
  console.log(hasProfile, "dhdhdhdh");

  return (
    <AuthLayout>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProfileView />} />
        <Route path="/village-list" element={<VillageList />} />
        {/* <Route path="/dashboard" element={token ? (hasProfile ? <ProfileView /> : <Navigate to="/user-details" replace />) : <Navigate to="/login" replace />} /> */}
        <Route path="/user-details" element={<UserDetailsForm />} />
        {/* <Route path="/user-details" element={token ? (!hasProfile ? <UserDetailsForm /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />} /> */}
        <Route
          path="/logout"
          element={
            <>
              {logout()}
              <Navigate to="/login" replace />
            </>
          }
        />
      </Routes>
    </AuthLayout>
  );
};
export default App;

{/* <Route
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
/>; */}
