import { http } from "../../../shared/services/api";
import type { UsuarioAuth, RolReadSimple } from "../../auth/services/auth";

export const getUsers = async (): Promise<UsuarioAuth[]> => {
  const res = await http.get("/api/v1/usuarios");
  return res.data;
};

// Crear user (ADMIN only)
export const createUser = async (data: {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  activo?: boolean;
}): Promise<UsuarioAuth> => {
  const res = await http.post("/api/v1/usuarios", data);
  return res.data;
};

// Get all roles
export const getRoles = async (): Promise<RolReadSimple[]> => {
  const res = await http.get("/api/v1/roles");
  return res.data;
};

// Asignar rol al usuario
export const assignRole = async (
  usuarioId: number,
  rolId: number,
): Promise<void> => {
  await http.post(`/api/v1/usuarios/${usuarioId}/roles/${rolId}`);
};

// Desasignar rol del usuario
export const unassignRole = async (
  usuarioId: number,
  rolId: number,
): Promise<void> => {
  await http.delete(`/api/v1/usuarios/${usuarioId}/roles/${rolId}`);
};
