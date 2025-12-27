import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api/client";

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  finalLogout: () => void;
  hasProfile: boolean | null;
  setHasProfile: (v: boolean | null) => void;
  profileError: string | null;
  clearProfileError: () => void;
  profileData: any | null;
  profileLoading: boolean;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  initialized: boolean;
  refetchProfile: () => Promise<void>;
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

  console.log(token, "nahi mila ");

  // Avoid repeated /profile calls for the same token
  const [profileFetchedToken, setProfileFetchedToken] = useState<string | null>(
    null
  );
  const profileRequestedRef = useRef(false);

  const clearProfileError = () => setProfileError(null);

  const setToken = (t: string | null) => {
    console.log("aas", token);
    console.log("aas2", t);

    if (token === t) return;
    setTokenState(t);
    if (t) {
      console.log("avyu to khara");

      localStorage.setItem("token", t);
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
      setHasProfile(null);
      setProfileData(null);
      setProfileFetchedToken(null);
      // Derive admin from JWT
      try {
        const parts = t.split(".");
        if (parts.length === 3) {
          const payloadStr = atob(
            parts[1].replace(/-/g, "+").replace(/_/g, "/")
          );
          const payload = JSON.parse(payloadStr);
          const flag =
            payload?.isAdmin === true ||
            /admin/i.test(String(payload?.role || ""));
          if (typeof flag === "boolean") {
            setIsAdmin(flag);
            localStorage.setItem("isAdmin", flag ? "true" : "false");
          }
        }
      } catch {}
      profileRequestedRef.current = false;
    } else {
      delete api.defaults.headers.common.Authorization;
      setHasProfile(null);
      setProfileData(null);
      setIsAdmin(false);
      localStorage.removeItem("isAdmin");
      setProfileFetchedToken(null);
      profileRequestedRef.current = false;
    }
  };

  console.log(token, "km lage avse");

  // Hydrate on mount
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log(stored, "stored");

    if (stored) {
      setToken(stored);
      const a = localStorage.getItem("isAdmin");
      if (a === "true") setIsAdmin(true);
    }
    console.log(1, 2);

    setInitialized(true);
  }, []);

  console.log(token, 1, 2, 3);

  // Fetch profile once per token
  useEffect(() => {
    if (!initialized) return;
    if (!token) return;
    if (profileFetchedToken === token) return;

    if (profileRequestedRef.current) return;
    profileRequestedRef.current = true;

    clearProfileError();
    setProfileLoading(true);
    try {
      console.debug("[auth] GET /profile start");
    } catch {}

    api
      .get("/profile")
      .then((r) => {
        setHasProfile(!!r.data?.profile);
        setProfileData(r.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || String(err);
        setHasProfile(false);
        setProfileError(msg);
      })
      .finally(() => {
        setProfileLoading(false);
        setProfileFetchedToken(token);
        profileRequestedRef.current = false;
      });
  }, [initialized, token, profileFetchedToken]);
  console.log(token, "final log1");

  const refetchProfile = async () => {
    if (!token) return;
    clearProfileError();
    setProfileLoading(true);
    try {
      const r = await api.get('/profile');
      setHasProfile(!!r.data?.profile);
      setProfileData(r.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || String(err);
      setHasProfile(false);
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
      setProfileFetchedToken(token);
    }
  };

  const logout = () => setToken(null);
  const finalLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  };

  // Keep isAdmin in localStorage (only when authenticated)
  useEffect(() => {
    if (!token) return;
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  }, [isAdmin, token]);

  console.log(token, "final log");

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
  refetchProfile,
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
