import { useState, useCallback } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useWebSocketAdmin } from "../../../shared/hooks/useWebSocketAdmin";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import { useOrders, useOrderMutations, isValidTransition } from "../hooks/useOrders";
import { KanbanBoard } from "../components/KanbanBoard";
import { OrderDetailModal } from "../components/OrderDetailModal";
import { ConfirmTransitionModal } from "../components/ConfirmTransitionModal";
import { AlertError } from "../../../shared/ui/AlertError";
import type { PedidoReadSimple, EstadoPedidoEnum } from "../types";

export const PedidosPage = () => {
  const token = useAuthStore((s) => s.token);

  // WebSocket: real-time refresh
  useWebSocketAdmin(token);

  // State
  const {
    grouped,
    totalCount,
    isLoading,
    isError,
    error,
  } = useOrders();

  const { transition, cancel, isPending, transitionError } = useOrderMutations();

  const [detailPedidoId, setDetailPedidoId] = useState<number | null>(null);

  // Transition modal state
  const [transitionModal, setTransitionModal] = useState<{
    pedido: PedidoReadSimple;
    estadoOrigen: EstadoPedidoEnum;
    estadoDestino: EstadoPedidoEnum;
  } | null>(null);

  // Drag & drop handler
  const handleDrop = useCallback(
    (pedidoId: number, estadoOrigen: string, estadoDestino: string) => {
      // Find the pedido from grouped data
      const pedido = Object.values(grouped)
        .flat()
        .find((p) => p.id === pedidoId);
      if (!pedido) return;

      const target = estadoDestino as EstadoPedidoEnum;
      const source = estadoOrigen as EstadoPedidoEnum;

      // Validate transition
      if (!isValidTransition(source, target)) return;

      setTransitionModal({ pedido, estadoOrigen: source, estadoDestino: target });
    },
    [grouped],
  );

  // Confirm transition
  const handleConfirmTransition = useCallback(
    (razon: string) => {
      if (!transitionModal) return;

      const { pedido, estadoDestino } = transitionModal;

      if (estadoDestino === "CANCELADO") {
        cancel.mutate(
          { id: pedido.id, razon },
          {
            onSuccess: () => {
              setTransitionModal(null);
            },
          },
        );
      } else {
        transition.mutate(
          { id: pedido.id, estado_nuevo: estadoDestino, razon },
          {
            onSuccess: () => {
              setTransitionModal(null);
            },
          },
        );
      }
    },
    [transitionModal, transition, cancel],
  );

  // Cancel transition modal
  const handleCancelTransition = useCallback(() => {
    setTransitionModal(null);
  }, []);

  // Order card click → open detail modal
  const handleOrderClick = useCallback((pedido: PedidoReadSimple) => {
    setDetailPedidoId(pedido.id);
  }, []);

  // Close detail modal
  const handleCloseDetail = useCallback(() => {
    setDetailPedidoId(null);
  }, []);

  return (
    <section className="space-y-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Cargando..."
              : `${totalCount} pedido${totalCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {isError && error && (
        <AlertError message={getApiErrorMessage(error)} />
      )}

      {/* Transition error */}
      {transitionError && (
        <AlertError message={getApiErrorMessage(transitionError)} />
      )}

      {/* Kanban Board */}
      <KanbanBoard
        grouped={grouped}
        onDrop={handleDrop}
        onOrderClick={handleOrderClick}
        isLoading={isLoading}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={detailPedidoId !== null}
        pedidoId={detailPedidoId}
        onClose={handleCloseDetail}
      />

      {/* Confirm Transition Modal */}
      <ConfirmTransitionModal
        isOpen={transitionModal !== null}
        pedido={transitionModal?.pedido ?? null}
        estadoOrigen={transitionModal?.estadoOrigen ?? null}
        estadoDestino={transitionModal?.estadoDestino ?? null}
        onConfirm={handleConfirmTransition}
        onCancel={handleCancelTransition}
        isPending={isPending}
      />
    </section>
  );
};
