import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIngredient,
  deleteIngredient,
  getIngredientById,
  getIngredients,
  updateIngredient,
} from "../api/ingrediente.api";
import type { IngredienteCreate } from "../types/IngredienteCreate";
import type { IngredienteUpdate } from "../types/IngredienteUpdate";

const INGREDIENTS_QUERY_KEY = ["ingredients"] as const;

export const useIngredients = () => {
  return useQuery({
    queryKey: INGREDIENTS_QUERY_KEY,
    queryFn: getIngredients,
  });
};

export const useIngredientById = (id: number) => {
  return useQuery({
    queryKey: [...INGREDIENTS_QUERY_KEY, id],
    queryFn: () => getIngredientById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IngredienteCreate) => createIngredient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IngredienteUpdate }) =>
      updateIngredient(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...INGREDIENTS_QUERY_KEY, variables.id],
      });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    },
  });
};
