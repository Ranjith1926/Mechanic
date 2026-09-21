"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { LoginRequest, RegisterRequest, UserSummary } from "@/types/auth";
import { clearTokens, getRefreshToken, getStoredUser, setStoredUser, setTokens } from "@/utils/tokenStorage";

interface AuthContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<UserSummary>;
  register: (request: RegisterRequest) => Promise<UserSummary>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    setTokens(response.accessToken, response.refreshToken);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    const response = await authService.register(request);
    setTokens(response.accessToken, response.refreshToken);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Token may already be expired server-side; clearing locally is sufficient.
      }
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
