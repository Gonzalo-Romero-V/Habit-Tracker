"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, setStoredToken, getStoredToken } from "@/lib/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  timezone: string;
  created_at: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getStoredToken()) {
      setIsLoading(false);
      return;
    }
    apiFetch<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => setStoredToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { user, token } = await apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(token);
    setUser(user);
  }

  async function register(input: RegisterInput) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { user, token } = await apiFetch<{ user: AuthUser; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...input, timezone }),
    });
    setStoredToken(token);
    setUser(user);
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
