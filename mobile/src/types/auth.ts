export type UserRole = "Mechanic" | "Client";

export interface UserSummary {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  clientId?: number | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserSummary;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  address?: string;
}
