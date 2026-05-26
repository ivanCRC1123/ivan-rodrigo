import apiClient from "../../../shared/api/apiClient";
import type { Product } from "../types";

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
