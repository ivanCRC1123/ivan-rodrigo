import { useState, useCallback } from "react";
import type { PedidoReadSimple } from "../types";
import type { KanbanColumnConfig } from "./kanbanConfig";
import { OrderCard } from "./OrderCard";

interface KanbanColumnProps {
  config: KanbanColumnConfig;
  orders: PedidoReadSimple[];
  onDrop: (pedidoId: number, estadoOrigen: string, estadoDestino: string) => void;
  onOrderClick: (pedido: PedidoReadSimple) => void;
  isLoading?: boolean;
  collapsible?: boolean;
}

export const KanbanColumn = ({
  config,
  orders,
  onDrop,
  onOrderClick,
  isLoading = false,
  collapsible = false,
}: KanbanColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsible);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only set false if we actually left the column (not a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        const data = JSON.parse(
          e.dataTransfer.getData("application/json"),
        ) as { pedidoId: number; estadoOrigen: string };
        onDrop(data.pedidoId, data.estadoOrigen, config.estado);
      } catch {
        // Invalid drag data — ignore
      }
    },
    [onDrop, config.estado],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex w-72 shrink-0 flex-col rounded-xl border transition-all duration-200 ${
        isDragOver
          ? `${config.borderClass} ${config.bgClass}`
          : "border-zinc-700/50 bg-zinc-900/50"
      } ${isDragOver ? "shadow-lg shadow-black/30 scale-[1.02]" : ""}`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2.5 ${
          isDragOver ? config.borderClass : "border-zinc-700/50"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Color indicator bar */}
          <span
            className={`h-3 w-1 rounded-full ${config.bgClass}`}
          />
          <h3 className={`text-sm font-semibold ${config.textClass}`}>
            {config.label}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Count badge */}
          <span
            className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${config.bgClass} ${config.textClass}`}
          >
            {orders.length}
          </span>

          {/* Collapse toggle (only for collapsible columns) */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded p-0.5 text-gray-500 hover:bg-zinc-700 hover:text-white transition"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Column content */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2 overflow-y-auto p-2 max-h-[calc(100vh-16rem)]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-8 text-gray-500">
              {/* Empty state icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="text-xs">Sin pedidos</span>
            </div>
          )}

          {!isLoading &&
            orders.map((pedido) => (
              <OrderCard
                key={pedido.id}
                pedido={pedido}
                columnConfig={config}
                onClick={onOrderClick}
              />
            ))}
        </div>
      )}

      {/* Collapsed empty state */}
      {isCollapsed && (
        <div className="px-3 py-2 text-center text-[10px] text-gray-600">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} oculto
          {orders.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
