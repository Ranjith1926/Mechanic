import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../api/authService";
import { setOnSessionExpired } from "../api/apiClient";
import { LoginRequest, RegisterRequest, UserSummary } from "../types/auth";
import { clearTokens, getRefreshToken, getStoredUser, setStoredUser, setTokens } from "../utils/tokenStorage";

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

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Token may already be expired server-side; clearing locally is sufficient.
      }
    }
    await clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnSessionExpired(() => {
      clearTokens().then(() => setUser(null));
    });
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    await setTokens(response.accessToken, response.refreshToken);
    await setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    const response = await authService.register(request);
    await setTokens(response.accessToken, response.refreshToken);
    await setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
