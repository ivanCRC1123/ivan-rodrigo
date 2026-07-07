import type { PedidoReadSimple } from "../types";
import type { KanbanColumnConfig } from "./kanbanConfig";
import { ESTADO_COLORS, ESTADO_LABELS } from "./kanbanConfig";

interface OrderCardProps {
  pedido: PedidoReadSimple;
  columnConfig: KanbanColumnConfig;
  onClick: (pedido: PedidoReadSimple) => void;
}

/** Formatea una fecha a "tiempo relativo" en español */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  if (diffDays < 30) return `hace ${diffDays}d`;
  return new Date(dateStr).toLocaleDateString();
}

export const OrderCard = ({ pedido, columnConfig, onClick }: OrderCardProps) => {
  const isCancelled = pedido.estado === "CANCELADO";

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        pedidoId: pedido.id,
        estadoOrigen: pedido.estado,
      }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(pedido)}
      className={`group cursor-pointer rounded-lg border bg-zinc-900 p-3 transition-all duration-150 hover:border-zinc-500 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 active:scale-[0.98] ${
        isCancelled ? "opacity-50" : "border-zinc-700"
      }`}
    >
      {/* Header: número de pedido + badge estado */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="truncate text-sm font-semibold text-white">
          #{pedido.numero_pedido}
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none ${ESTADO_COLORS[pedido.estado]}`}
        >
          {ESTADO_LABELS[pedido.estado]}
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          {/* User icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="truncate">ID: {pedido.usuario_id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-emerald-400">
            ${Number(pedido.monto_total).toFixed(2)}
          </span>
          <span className="text-gray-500" title={new Date(pedido.created_at).toLocaleString()}>
            {relativeTime(pedido.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};
