import apiClient from "../../../shared/services/apiClient";

export interface LoginResponse {
  access_token: string;
  user_id: number;
  email: string;
  nombre: string;
  apellido: string;
}

export const loginApi = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post("/api/v1/auth/login", {
    email,
    password,
  });
  return data;
};

export const registerApi = async (
  email: string,
  nombre: string,
  apellido: string,
  password: string,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post("/api/v1/auth/register", {
    email,
    nombre,
    apellido,
    password,
  });
  return data;
};
