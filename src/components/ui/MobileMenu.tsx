import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';

interface MobileMenuProps { open: boolean; onClose: () => void; }

export const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  const location = useLocation();
    const { token, isAdmin, finalLogout } = useAuth();
  const navigate = useNavigate();

    console.log('token', token);
    
  if (!open) return null;
  const isActive = (path: string) => location.pathname.startsWith(path);
  return (
    <div className="mobile-menu">
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <img src="/logo.png" alt="Logo" className="mobile-logo" />
          <button className="close-btn" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <nav className="mobile-nav">
            <>
              <Link to="/profile-manage" onClick={onClose} className={isActive('/profile-manage')? 'active':''}>Manage Profile</Link>
              <Link to="/village-list" onClick={onClose} className={isActive('/village-list')? 'active':''}>Village List</Link>
              <Link to="/committee-members" onClick={onClose} className={isActive('/committee-members')? 'active':''}>ANC Committee Members</Link>
              {isAdmin && <Link to="/admin-dashboard" onClick={onClose} className={isActive('/admin-dashboard')? 'active':''}>Admin</Link>}
          <Link to="/" onClick={onClose} className={isActive('/')? 'active':''}>Invitation</Link>
              <button type="button" className="accordion-btn" onClick={() => { finalLogout(); onClose(); navigate('/login'); }}>Logout</button>
            </>
        </nav>
      </div>
      <div className="mobile-menu-backdrop" onClick={onClose} />
    </div>
  );
};