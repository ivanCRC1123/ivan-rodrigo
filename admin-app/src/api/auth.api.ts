import { http } from "./http";

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

export const getUsers = async (): Promise<UsuarioAuth[]> => {
  const res = await http.get("/api/v1/usuarios");
  return res.data;
};
