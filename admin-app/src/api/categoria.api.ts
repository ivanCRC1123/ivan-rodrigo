import { http } from "../api/http";

import type { CategoriaRead } from "../types/CategoriaRead";
import type { CategoriaCreate } from "../types/CategoriaCreate";
import type { CategoriaUpdate } from "../types/CategoriaUpdate";

/**
 * GET /categorias
 */
export const getCategories = async (): Promise<CategoriaRead[]> => {
  const res = await http.get("/categorias/");
  return res.data;
};

/**
 * GET /categorias/{id}
 */
export const getCategoryById = async (id: number): Promise<CategoriaRead> => {
  const res = await http.get(`/categorias/${id}`);
  return res.data;
};

/**
 * POST /categorias
 */
export const createCategory = async (
  data: CategoriaCreate
): Promise<CategoriaRead> => {
  const res = await http.post("/categorias/", data);
  return res.data;
};

/**
 * PUT /categorias/{id}
 */
export const updateCategory = async (
  id: number,
  data: CategoriaUpdate
): Promise<CategoriaRead> => {
  const res = await http.put(`/categorias/${id}`, data);
  return res.data;
};

/**
 * DELETE /categorias/{id}
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await http.delete(`/categorias/${id}`);
};
