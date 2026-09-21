import { apiClient } from "@/services/apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/api/auth/login", request);
    return data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/api/auth/register", request);
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/api/auth/logout", { refreshToken });
  },
};
