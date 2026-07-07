import apiClient from "../../../shared/services/apiClient";
import type { ProductoRead } from "../types";

export interface FetchProductsParams {
  min_precio?: number;
  max_precio?: number;
  limit?: number;
  offset?: number;
  categoria_id?: number;
  search?: string;
}

export const fetchProducts = async (
  params?: FetchProductsParams
): Promise<ProductoRead[]> => {
  const { data } = await apiClient.get("/api/v1/productos/", { params });
  return data;
};

export const fetchProductById = async (id: number): Promise<ProductoRead> => {
  const { data } = await apiClient.get(`/api/v1/productos/${id}`);
  return data;
};
