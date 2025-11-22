import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';

interface MainLayoutProps { children: React.ReactNode }

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggle = () => setOpen(o => !o);
  const linkStyle: React.CSSProperties = { textDecoration:'none', padding:'0.5rem 0.75rem', borderRadius:6, display:'block', color:'var(--color-text)', fontSize:'0.9rem', fontWeight:500 };
  const activeBg = 'rgba(0,0,0,0.06)';
  const hideHeader = location.pathname === '/previous-result';
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--color-bg)' }}>
      {!hideHeader && (
        <header className="site-header">
          <div className="site-header-left">
            <button onClick={toggle} aria-label="Open menu" className="hamburger-btn">
              <span className="hamburger-lines" />
            </button>
          </div>
          <div className="logo-circle">
            <img src="/logo.png" alt="Logo" />
          </div>
        </header>
      )}
      {!hideHeader && <MobileMenu open={open} onClose={()=>setOpen(false)} />}
      <main style={{ flex:1, padding:'1rem', display:'flex', flexDirection:'column' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>{children}</div>
      </main>
    </div>
  );
};