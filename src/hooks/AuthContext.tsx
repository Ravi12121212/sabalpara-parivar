import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  hasProfile: boolean | null; // null = checking/unknown
  setHasProfile: (v: boolean | null) => void;
  profileError: string | null;
  clearProfileError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const clearProfileError = () => setProfileError(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (typeof window !== "undefined" && t) {
      localStorage.setItem('token', t);
    }
    if (t) {
      console.log(t,"dsdsfsdf");
      localStorage.setItem('token', t);
      console.log("After setting:", localStorage.getItem('token'));
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
      setHasProfile(null); // reset; will re-fetch
    } else {
      // localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      setHasProfile(null);
    }
  };

  // On mount, ensure header if token existed
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, []);

  // Whenever token present and hasProfile unknown, fetch profile with retry
  useEffect(() => {
    if (!token || hasProfile !== null) return;
    clearProfileError();
    let attempts = 0;
    console.log('[auth] fetching /profile due to token presence');

    const fetchProfile = () => {
      attempts++;
      const hdrToken = api.defaults.headers.common.Authorization || '(none)';
      console.log(`[auth] fetching /profile attempt ${attempts} header:`, hdrToken);
      api.get('/profile',{ headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(r => {
          console.debug('[auth] /profile response:', r.status, r.data);
          setHasProfile(!!r.data.profile);
        })
        .catch(err => {
          const msg = err.response?.data?.message || err.message;
          console.warn('[auth] /profile error:', msg);
          if (attempts < 3 && /network|timeout/i.test(msg)) {
            setTimeout(fetchProfile, 500 * attempts); // backoff
          } else {
            setHasProfile(false);
            setProfileError(msg);
          }
        });
    };
    fetchProfile();
  }, [token, hasProfile]);

  const logout = () => setToken(null);

  return <AuthContext.Provider value={{ token, setToken, logout, hasProfile, setHasProfile, profileError, clearProfileError }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
