import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../api/categoria.api";
import type { CategoriaCreate } from "../types/CategoriaCreate";
import type { CategoriaUpdate } from "../types/CategoriaUpdate";

const CATEGORIES_QUERY_KEY = ["categories"] as const;

export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
  });
};

export const useCategoryById = (id: number) => {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, id],
    queryFn: () => getCategoryById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoriaCreate) => createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) =>
      updateCategory(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...CATEGORIES_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};
