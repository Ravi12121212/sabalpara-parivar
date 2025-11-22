import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { api } from "../api/client";

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  finalLogout: () => void;
  hasProfile: boolean | null; // null = checking/unknown
  setHasProfile: (v: boolean | null) => void;
  profileError: string | null;
  clearProfileError: () => void;
  profileData: any | null;
  profileLoading: boolean; // true while /profile request in-flight
  isAdmin: boolean; // admin flag
  setIsAdmin: (v: boolean) => void;
  initialized: boolean; // hydration complete
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const clearProfileError = () => setProfileError(null);

  const setToken = (t: string | null) => {
    // Prevent unnecessary resets if token unchanged
    if (token === t) return;
    setTokenState(t);
    if (t) {
      localStorage.setItem("token", t);
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
      setHasProfile(null);
      setProfileData(null);
      profileRequestedRef.current = false; // allow fresh profile fetch for new token
    } else {
      delete api.defaults.headers.common.Authorization;
      setHasProfile(null);
      setProfileData(null);
      setIsAdmin(false);
      localStorage.removeItem("isAdmin");
      profileRequestedRef.current = false;
    }
  };

  // On mount ensure token hydration and header setup (covers direct deep link case)
  // On mount: hydrate token once
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (stored) {
      setToken(stored);
      const a = localStorage.getItem("isAdmin");
      if (a === "true") setIsAdmin(true);
    }
    setInitialized(true);
  }, []);

  // Whenever token present and hasProfile unknown, fetch profile with retry
  const profileRequestedRef = useRef(false);

  useEffect(() => {
    if (!initialized) return; // wait for hydration
    if (!token) return;
    if (hasProfile !== null) return;
    if (profileRequestedRef.current) return;
    profileRequestedRef.current = true;
    clearProfileError();
    setProfileLoading(true);
    api
      .get("/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        setHasProfile(!!r.data.profile);
        setProfileData(r.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message;
        setHasProfile(false);
        setProfileError(msg);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [initialized, token, hasProfile]);

  const logout = () => setToken(null);
  const finalLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        logout,
        finalLogout,
        hasProfile,
        setHasProfile,
        profileError,
        clearProfileError,
        profileData,
        profileLoading,
        isAdmin,
        setIsAdmin,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
