"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, ApiError, type RequestOptions } from "@/lib/api/client";
import type { AuthResponse, BloodGroup, Gender, User } from "@/lib/api/types";
import * as tokenStorage from "./token-storage";

export interface RegisterInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language?: string;
  gender?: Gender;
  city?: string;
  blood_group?: BloodGroup;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<void>;
  logout: () => void;
  authFetch: <T>(path: string, options?: RequestOptions) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) return null;

  try {
    const data = await apiFetch<{ access: string; refresh?: string }>(
      "/auth/token/refresh/",
      { method: "POST", body: { refresh } },
    );
    tokenStorage.setAccessToken(data.access);
    if (data.refresh) {
      tokenStorage.setTokens(data.access, data.refresh);
    }
    return data.access;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authFetch = useCallback(async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
    const token = tokenStorage.getAccessToken();
    try {
      return await apiFetch<T>(path, { ...options, token });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return await apiFetch<T>(path, { ...options, token: newToken });
        }
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authFetch<User>("/auth/me/");
        if (!cancelled) setUser(me);
      } catch {
        tokenStorage.clearTokens();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  const applyAuthResponse = useCallback((data: AuthResponse) => {
    tokenStorage.setTokens(data.access, data.refresh);
    setUser(data.user);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<AuthResponse>("/auth/login/", {
        method: "POST",
        body: { email, password },
      });
      applyAuthResponse(data);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await apiFetch<AuthResponse>("/auth/register/", {
        method: "POST",
        body: input,
      });
      applyAuthResponse(data);
    },
    [applyAuthResponse],
  );

  const requestOtp = useCallback(async (phone: string) => {
    await apiFetch("/auth/otp/request/", { method: "POST", body: { phone } });
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string, fullName?: string) => {
      const data = await apiFetch<AuthResponse>("/auth/otp/verify/", {
        method: "POST",
        body: { phone, code, full_name: fullName },
      });
      applyAuthResponse(data);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      loginWithEmail,
      register,
      requestOtp,
      verifyOtp,
      logout,
      authFetch,
    }),
    [user, isLoading, loginWithEmail, register, requestOtp, verifyOtp, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
