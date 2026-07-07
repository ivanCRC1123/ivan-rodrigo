import { http } from "../../../shared/services/api";

export interface RolReadSimple {
  id: number;
  nombre: string;
  codigo: string;
}

export interface UsuarioAuth {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  roles: RolReadSimple[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
}

// Real JWT login
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await http.post("/api/v1/auth/login", { email, password });
  return res.data;
};

// Verifica stored token
export const verifyToken = async (): Promise<{
  valid: boolean;
  user_id: number;
  email: string;
  roles: string[];
}> => {
  const res = await http.get("/api/v1/auth/verify");
  return res.data;
};

// Registra nuevo user (public, assigns CLIENT role)
export const register = async (data: {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
}): Promise<LoginResponse> => {
  const res = await http.post("/api/v1/auth/register", data);
  return res.data;
};
