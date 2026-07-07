import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUnit,
  deleteUnit,
  getUnitById,
  getUnits,
  updateUnit,
} from "../services/units";
import type {
  UnidadMedidaCreate,
  UnidadMedidaUpdate,
} from "../types/unit.types";

const UNITS_QUERY_KEY = ["units"] as const;

export const useUnits = () => {
  return useQuery({
    queryKey: UNITS_QUERY_KEY,
    queryFn: getUnits,
  });
};

export const useUnitById = (id: number) => {
  return useQuery({
    queryKey: [...UNITS_QUERY_KEY, id],
    queryFn: () => getUnitById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useUnitMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: UnidadMedidaCreate) => createUnit(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UnidadMedidaUpdate }) =>
      updateUnit(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...UNITS_QUERY_KEY, variables.id],
      });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY });
    },
  });

  return { create, update, delete: del };
};
