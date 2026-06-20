"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  mobile: string;
  role: string;
  orgId: string | null;
  orgName: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

const TOKEN_KEY = "autobat.token";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  requestOtp: (mobile: string) => Promise<{ devCode?: string }>;
  verifyOtp: (mobile: string, code: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((u: AuthUser) => setUser(u))
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const requestOtp = async (mobile: string) => {
    const res = await fetch(`${API_BASE}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile })
    });
    if (!res.ok) throw new Error("Could not send OTP");
    return res.json();
  };

  const verifyOtp = async (mobile: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, code })
    });
    if (!res.ok) throw new Error("Invalid or expired code");
    const data = (await res.json()) as { token: string; user: AuthUser };
    window.localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, ready, requestOtp, verifyOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Authenticated mutation helper for write endpoints.
export async function apiMutate<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}
