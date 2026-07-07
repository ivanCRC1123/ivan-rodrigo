import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/producto";
import type { ProductoCreate, ProductoUpdate } from "../types/producto.types";

const PRODUCTS_QUERY_KEY = ["products"] as const;

export const useProducts = (params?: {
  min_precio?: number;
  max_precio?: number;
  limit?: number;
  offset?: number;
  categoria_id?: number;
  search?: string;
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

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: ProductoCreate) => createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) =>
      updateProduct(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, variables.id],
      });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  return { create, update, delete: del };
};
