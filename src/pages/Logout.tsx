import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const Logout: React.FC = () => {
  const { logout, finalLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout once after mount
    try {
      logout();
    } finally {
      // Fallback to full clear if needed
      finalLogout();
      navigate("/login", { replace: true });
    }
  }, [logout, finalLogout, navigate]);

  return null;
};

export default Logout;
