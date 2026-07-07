import { http } from "../../../shared/services/api";

import type {
  CategoriaRead,
  CategoriaCreate,
  CategoriaUpdate,
} from "../types/categoria.types";

export interface CategoriaPublicItem {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoriaPublicResponse {
  items: CategoriaPublicItem[];
  total: number;
  limit: number;
  offset: number;
}

export const searchPublicCategories = async (params: {
  search?: string;
  parent_id?: number;
  limit?: number;
  offset?: number;
}): Promise<CategoriaPublicResponse> => {
  const res = await http.get("/api/v1/categorias/public", { params });
  return res.data;
};

/**
 * GET /api/v1/categorias
 */
export const getCategories = async (): Promise<CategoriaRead[]> => {
  const res = await http.get("/api/v1/categorias/");
  return res.data;
};

/**
 * GET /api/v1/categorias/{id}
 */
export const getCategoryById = async (id: number): Promise<CategoriaRead> => {
  const res = await http.get(`/api/v1/categorias/${id}`);
  return res.data;
};

/**
 * POST /api/v1/categorias
 */
export const createCategory = async (
  data: CategoriaCreate,
): Promise<CategoriaRead> => {
  const res = await http.post("/api/v1/categorias/", data);
  return res.data;
};

/**
 * PUT /api/v1/categorias/{id}
 */
export const updateCategory = async (
  id: number,
  data: CategoriaUpdate,
): Promise<CategoriaRead> => {
  const res = await http.put(`/api/v1/categorias/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/categorias/{id}
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await http.delete(`/api/v1/categorias/${id}`);
};
