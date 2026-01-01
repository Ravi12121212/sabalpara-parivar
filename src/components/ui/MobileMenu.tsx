import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { token, isAdmin, finalLogout } = useAuth();
  const navigate = useNavigate();

  console.log("token,aa", token);

  if (!open) return null;
  const isActive = (path: string) => location.pathname.startsWith(path);
  return (
    <div className="mobile-menu">
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <img src="/logo.png" alt="Logo" className="mobile-logo" />
          <button className="close-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <nav className="mobile-nav">
          <>
            <Link
              to="/profile-manage"
              onClick={onClose}
              className={isActive("/profile-manage") ? "active" : ""}
            >
              પ્રોફાઇલ મેનેજ કરો
            </Link>
            <Link
              to="/businesses"
              onClick={onClose}
              className={isActive("/businesses") ? "active" : ""}
            >
              વ્યવસાયો
            </Link>
            <Link
              to="/village-list"
              onClick={onClose}
              className={isActive("/village-list") ? "active" : ""}
            >
              ગામડાની યાદી
            </Link>
            <Link
              to="/committee-members"
              onClick={onClose}
              className={isActive("/committee-members") ? "active" : ""}
            >
              સમિતિના સભ્યો
            </Link>
            <Link
              to="/notifications"
              onClick={onClose}
              className={isActive("/notifications") ? "active" : ""}
            >
              સૂચનાઓ
            </Link>
            <Link
              to="/gallery"
              onClick={onClose}
              className={isActive("/gallery") ? "active" : ""}
            >
              ગેલેરી
            </Link>
            {isAdmin && (
              <Link
                to="/admin-welcome"
                onClick={onClose}
                className={isActive("/admin-welcome") ? "active" : ""}
              >
                એડમિન
              </Link>
            )}
            <button
              type="button"
              className="accordion-btn"
              onClick={() => {
                finalLogout();
                onClose();
                navigate("/login");
              }}
            >
              લોગઆઉટ 
            </button>
          </>
        </nav>
      </div>
      <div className="mobile-menu-backdrop" onClick={onClose} />
    </div>
  );
};
