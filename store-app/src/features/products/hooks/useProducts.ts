import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProductById,
  type FetchProductsParams,
} from "../services/productService";

export function useProducts(params?: FetchProductsParams) {
  const queryKey = ["products"];

  const getAll = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetchProducts(params),
    refetchInterval: 30_000, // cada 30s sincroniza stock con el servidor
  });

  const useGetById = (id: number) =>
    useQuery({
      queryKey: [...queryKey, id],
      queryFn: () => fetchProductById(id),
      enabled: Number.isFinite(id) && id > 0,
      refetchInterval: 30_000,
    });

  return { ...getAll, useGetById };
}
