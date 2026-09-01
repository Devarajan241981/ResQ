import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiFetch, ApiError, type RequestOptions } from "./api";
import type { AuthResponse, RegisterInput, User } from "./types";

const ACCESS_KEY = "resq.access";
const REFRESH_KEY = "resq.refresh";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, options?: RequestOptions) => Promise<T>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function setTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) return null;
    try {
      const data = await apiFetch<{ access: string; refresh?: string }>("/auth/token/refresh/", {
        method: "POST",
        body: { refresh: refreshToken },
      });
      await SecureStore.setItemAsync(ACCESS_KEY, data.access);
      if (data.refresh) await SecureStore.setItemAsync(REFRESH_KEY, data.refresh);
      return data.access;
    } catch {
      await clearTokens();
      return null;
    }
  }, []);

  // Authenticated fetch: attach the access token and transparently refresh once on 401.
  const authFetch = useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      let token = await SecureStore.getItemAsync(ACCESS_KEY);
      try {
        return await apiFetch<T>(path, { ...options, token });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          token = await refreshAccessToken();
          if (token) return apiFetch<T>(path, { ...options, token });
        }
        throw err;
      }
    },
    [refreshAccessToken],
  );

  const loadMe = useCallback(async () => {
    try {
      const me = await authFetch<User>("/auth/me/");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, [authFetch]);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(ACCESS_KEY);
      if (token) await loadMe();
      setIsLoading(false);
    })();
  }, [loadMe]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>("/auth/login/", {
      method: "POST",
      body: { email, password },
    });
    await setTokens(data.access, data.refresh);
    setUser(data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await apiFetch<AuthResponse>("/auth/register/", { method: "POST", body: input });
    await setTokens(data.access, data.refresh);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      loginWithEmail,
      register,
      logout,
      authFetch,
      refresh: loadMe,
    }),
    [user, isLoading, loginWithEmail, register, logout, authFetch, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
