// AUTH TYPES

export type UserRole = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT";

export interface User {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}
