import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import type { User } from "@/lib/resume-types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  sendRegistrationOtp: (name: string, email: string, password: string) => Promise<void>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Try to restore the session from the httpOnly cookie / stored token.
    authService
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const sendRegistrationOtp = useCallback(async (name: string, email: string, password: string) => {
    await authService.sendRegistrationOtp(name, email, password);
  }, []);

  const verifyRegistrationOtp = useCallback(async (email: string, otp: string) => {
    const u = await authService.verifyRegistrationOtp(email, otp);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, sendRegistrationOtp, verifyRegistrationOtp, logout, setUser }),
    [user, loading, login, sendRegistrationOtp, verifyRegistrationOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
