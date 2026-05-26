import apiClient from "../../../shared/apiClient";
import type { Product } from "../types";

// CORRECCIÓN: El backend usa /api/v1/productos con filtros opcionales
export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get("/api/v1/productos/", {
    params: { limit: 100, offset: 0 },
  });
  return data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get(`/api/v1/productos/${id}`);
  return data;
};
