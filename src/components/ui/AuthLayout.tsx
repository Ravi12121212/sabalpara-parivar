import React from "react";
interface AuthLayoutProps {
  children: React.ReactNode;
}
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
      <div className="auth-layout">
        <div className="auth-side brand" style={{ padding: "2.5rem 2.5rem 0 2.5rem" }}>
          <div className="brand-inner">
            <img
              src={"../../logo.png"}
              alt="Invitation"
              style={{ maxWidth: "40%", height: "auto" }}
            />
            <h2 className="brand-name">Sabalpara Parivar</h2>
            <p className="brand-tag">Connect & care for your loved ones</p>
          </div>
        </div>
        <div className="auth-side form-zone" style={{ padding: "2.5rem" }}>{children}</div>
      </div>
    );
};
