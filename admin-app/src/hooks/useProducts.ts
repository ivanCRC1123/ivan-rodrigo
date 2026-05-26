import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/producto.api";
import type { ProductoCreate } from "../types/ProductoCreate";
import type { ProductoUpdate } from "../types/ProductoUpdate";

const PRODUCTS_QUERY_KEY = ["products"] as const;

export const useProducts = (params?: {
  min_precio?: number;
  max_precio?: number;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, params],
    queryFn: () => getProducts(params),
  });
};

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: () => getProductById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductoCreate) => createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) =>
      updateProduct(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};
