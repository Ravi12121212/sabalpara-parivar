import React from 'react';
interface AuthCardProps { title: string; subtitle?: string; children: React.ReactNode; backTo?: string; }
import { Link } from 'react-router-dom';
export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, backTo }) => {
  return (
    <div className="auth-card fade-in">
      {backTo && <Link to={backTo} className="back-btn" aria-label="Back"/>}
      <div className="brand-bird" aria-hidden="true">🐦</div>
      <h1 className="auth-title">{title}</h1>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      <div className="auth-content">{children}</div>
    </div>
  );
};
