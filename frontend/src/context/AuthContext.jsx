import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "carebridge-session";

function readStoredSession() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback((payload) => {
    const nextSession = {
      token: payload.access_token,
      role: payload.role,
      profile: payload.profile
    };
    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((profile) => {
    setSession((current) => {
      if (!current) {
        return current;
      }
      const updated = { ...current, profile };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      login,
      logout,
      updateProfile,
      isAuthenticated: Boolean(session?.token),
      isDonor: session?.role === "donor",
      isNgo: session?.role === "ngo"
    }),
    [login, logout, session, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
