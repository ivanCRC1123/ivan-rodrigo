import type { PedidoReadSimple } from "../types";
import type { EstadoPedidoEnum } from "../types";
import { KANBAN_COLUMNS } from "./kanbanConfig";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  grouped: Partial<Record<EstadoPedidoEnum, PedidoReadSimple[]>>;
  onDrop: (pedidoId: number, estadoOrigen: string, estadoDestino: string) => void;
  onOrderClick: (pedido: PedidoReadSimple) => void;
  isLoading?: boolean;
}

export const KanbanBoard = ({
  grouped,
  onDrop,
  onOrderClick,
  isLoading = false,
}: KanbanBoardProps) => {
  const hasAnyOrders = KANBAN_COLUMNS.some(
    (col) => (grouped[col.estado]?.length ?? 0) > 0,
  );

  const handleDrop = (
    pedidoId: number,
    estadoOrigen: string,
    estadoDestino: string,
  ) => {
    // Don't allow dropping in the same column
    if (estadoOrigen === estadoDestino) return;
    onDrop(pedidoId, estadoOrigen, estadoDestino);
  };

  if (!isLoading && !hasAnyOrders) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <p className="text-sm">No hay pedidos en ninguna columna</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-4">
      {KANBAN_COLUMNS.map((config) => (
        <KanbanColumn
          key={config.estado}
          config={config}
          orders={grouped[config.estado] ?? []}
          onDrop={handleDrop}
          onOrderClick={onOrderClick}
          isLoading={isLoading}
          collapsible={config.estado === "CANCELADO"}
        />
      ))}
    </div>
  );
};
