import { http } from "../../../shared/services/api";

import type { ProductoRead, ProductoCreate, ProductoUpdate } from "../types/producto.types";

export const getProducts = async (params?: {
  min_precio?: number;
  max_precio?: number;
  limit?: number;
  offset?: number;
  categoria_id?: number;
  search?: string;
}): Promise<ProductoRead[]> => {
  const res = await http.get("/api/v1/productos/", { params });
  return res.data;
};

export const getProductById = async (id: number): Promise<ProductoRead> => {
  const res = await http.get(`/api/v1/productos/${id}`);
  return res.data;
};

export const createProduct = async (
  data: ProductoCreate,
): Promise<ProductoRead> => {
  const res = await http.post("/api/v1/productos/", data);
  return res.data;
};

export const updateProduct = async (
  id: number,
  data: ProductoUpdate,
): Promise<ProductoRead> => {
  const res = await http.put(`/api/v1/productos/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await http.delete(`/api/v1/productos/${id}`);
};
