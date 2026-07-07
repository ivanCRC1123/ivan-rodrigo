import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getPedidos,
  cambiarEstadoPedido,
  cancelarPedido,
} from "../services/pedido";
import type { EstadoPedidoEnum, PedidoReadSimple } from "../types";
import { TRANSICIONES_VALIDAS } from "../components/kanbanConfig";
import { getApiErrorMessage } from "../../../shared/services/apiError";

/** Agrupa pedidos por estado */
export function groupByEstado(
  pedidos: PedidoReadSimple[],
): Partial<Record<EstadoPedidoEnum, PedidoReadSimple[]>> {
  const grouped: Partial<Record<EstadoPedidoEnum, PedidoReadSimple[]>> = {};
  for (const p of pedidos) {
    if (!grouped[p.estado]) grouped[p.estado] = [];
    grouped[p.estado]!.push(p);
  }
  return grouped;
}

/**
 * Hook principal que obtiene los pedidos y los agrupa por estado.
 */
export function useOrders() {
  const query = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => getPedidos(),
  });

  const pedidos = query.data ?? [];

  const grouped = useMemo(() => groupByEstado(pedidos), [pedidos]);

  return {
    grouped,
    totalCount: pedidos.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/** Mutaciones para cambiar estado o cancelar pedidos */
export function useOrderMutations() {
  const queryClient = useQueryClient();

  const transition = useMutation({
    mutationFn: ({
      id,
      estado_nuevo,
      razon,
    }: {
      id: number;
      estado_nuevo: EstadoPedidoEnum;
      razon: string;
    }) => cambiarEstadoPedido(id, estado_nuevo, razon),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["pedido-historial", variables.id],
      });
    },
  });

  const cancel = useMutation({
    mutationFn: ({
      id,
      razon,
    }: {
      id: number;
      razon: string;
    }) => cancelarPedido(id, razon),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["pedido-historial", variables.id],
      });
    },
  });

  return {
    transition,
    cancel,
    isPending: transition.isPending || cancel.isPending,
    transitionError: transition.error,
    cancelError: cancel.error,
  };
}

/** Valida si una transición es permitida */
export function isValidTransition(
  from: EstadoPedidoEnum,
  to: EstadoPedidoEnum,
): boolean {
  return TRANSICIONES_VALIDAS[from]?.includes(to) ?? false;
}
