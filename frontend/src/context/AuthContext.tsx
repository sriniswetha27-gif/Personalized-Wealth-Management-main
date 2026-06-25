import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: { email: string; full_name: string; password: string; risk_profile: string }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("pwma_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("pwma_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      async signIn(email, password) {
        const response = await api.login(email, password);
        localStorage.setItem("pwma_token", response.access_token);
        setToken(response.access_token);
        setUser(await api.me(response.access_token));
      },
      async signUp(payload) {
        await api.register(payload);
        const response = await api.login(payload.email, payload.password);
        localStorage.setItem("pwma_token", response.access_token);
        setToken(response.access_token);
        setUser(await api.me(response.access_token));
      },
      signOut() {
        localStorage.removeItem("pwma_token");
        setToken(null);
        setUser(null);
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
