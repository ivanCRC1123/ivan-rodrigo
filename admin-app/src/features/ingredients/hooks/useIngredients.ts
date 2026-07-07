import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIngredient,
  deleteIngredient,
  getIngredientById,
  getIngredients,
  restoreIngredient,
  updateIngredient,
} from "../services/ingrediente";
import type {
  IngredienteCreate,
  IngredienteUpdate,
} from "../types/ingrediente.types";

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

export const useIngredientMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: IngredienteCreate) => createIngredient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: IngredienteUpdate }) =>
      updateIngredient(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...INGREDIENTS_QUERY_KEY, variables.id],
      });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    },
  });

  const restore = useMutation({
    mutationFn: (id: number) => restoreIngredient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGREDIENTS_QUERY_KEY });
    },
  });

  return { create, update, delete: del, restore };
};
