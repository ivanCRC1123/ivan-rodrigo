import { useState, useEffect } from "react";
import type { PedidoReadSimple } from "../types";
import type { EstadoPedidoEnum } from "../types";
import { ESTADO_LABELS } from "./kanbanConfig";

interface ConfirmTransitionModalProps {
  isOpen: boolean;
  pedido: PedidoReadSimple | null;
  estadoOrigen: EstadoPedidoEnum | null;
  estadoDestino: EstadoPedidoEnum | null;
  onConfirm: (razon: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const ConfirmTransitionModal = ({
  isOpen,
  pedido,
  estadoOrigen,
  estadoDestino,
  onConfirm,
  onCancel,
  isPending,
}: ConfirmTransitionModalProps) => {
  const [razon, setRazon] = useState("");
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRazon("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !pedido || !estadoOrigen || !estadoDestino) return null;

  const handleConfirm = () => {
    setError("");
    // Si la razón está vacía, enviamos string vacío (backend lo hace opcional)
    onConfirm(razon.trim());
  };

  const isCancel = estadoDestino === "CANCELADO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold">
            {isCancel ? "Cancelar Pedido" : "Cambiar Estado"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {isCancel
              ? `¿Estás seguro de cancelar el pedido #${pedido.numero_pedido}?`
              : `Mover pedido #${pedido.numero_pedido} de`}
          </p>
        </div>

        {/* State transition visualization */}
        {!isCancel && (
          <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-zinc-800/50 px-4 py-3">
            <span className="rounded-md bg-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-400">
              {ESTADO_LABELS[estadoOrigen]}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
              {ESTADO_LABELS[estadoDestino]}
            </span>
          </div>
        )}

        {/* Reason textarea */}
        <div className="mb-4">
          <label
            htmlFor="transition-razon"
            className="mb-1.5 block text-xs font-medium text-gray-400"
          >
            Razón del cambio (opcional)
          </label>
          <textarea
            id="transition-razon"
            value={razon}
            onChange={(e) => {
              setRazon(e.target.value);
              if (e.target.value.trim().length >= 5) setError("");
            }}
            placeholder="Describe el motivo del cambio de estado..."
            rows={3}
            className={`w-full resize-none rounded-lg border bg-zinc-800 p-2.5 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-zinc-700 focus:ring-emerald-500/30 focus:border-emerald-500/50"
            }`}
            disabled={isPending}
          />
          {razon.length > 0 && (
            <div className="mt-1 text-[10px] text-gray-500 text-right">
              {razon.length}/200 caracteres
            </div>
          )}
          {error && (
            <p className="mt-1 text-xs text-red-400">{error}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              isCancel
                ? "bg-red-500/80 hover:bg-red-500"
                : "bg-emerald-500/80 hover:bg-emerald-500"
            }`}
          >
            {isPending && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isPending ? "Procesando..." : isCancel ? "Sí, cancelar" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
