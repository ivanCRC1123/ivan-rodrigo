import { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useCreatePreference } from "../../pagos";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { useWebSocketMisPedidos } from "../../../shared/hooks/useWebSocketMisPedidos";

/* ─── Skeleton ─── */
function OrdersSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border border-zinc-800/40 bg-zinc-900/20 p-5"
        >
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-zinc-800/60" />
            <div className="h-6 w-20 rounded bg-zinc-800/40" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-24 rounded-full bg-zinc-800/50" />
            <div className="h-3 w-32 rounded bg-zinc-800/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Status Badge ─── */
const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

interface StatusBadgeConfig {
  container: string;
  dot: string;
  icon: React.ReactNode;
}

const ESTADO_CONFIG: Record<string, StatusBadgeConfig> = {
  PENDIENTE: {
    container: "bg-yellow-500/15 text-yellow-400 border-yellow-500/10",
    dot: "bg-yellow-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  CONFIRMADO: {
    container: "bg-blue-500/15 text-blue-400 border-blue-500/10",
    dot: "bg-blue-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  EN_PREPARACION: {
    container: "bg-purple-500/15 text-purple-400 border-purple-500/10",
    dot: "bg-purple-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  ENTREGADO: {
    container: "bg-green-500/15 text-green-400 border-green-500/10",
    dot: "bg-green-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  CANCELADO: {
    container: "bg-red-500/15 text-red-400 border-red-500/10",
    dot: "bg-red-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

function StatusBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] || {
    container: "bg-zinc-800 text-zinc-400 border-zinc-700",
    dot: "bg-zinc-400",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${config.container}`}
    >
      {config.icon}
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

/* ─── Página ─── */
export default function MyOrdersPage() {
  const { data: pedidos, isLoading, error } = useOrders();
  const { mutateAsync: createPref } = useCreatePreference();
  const [payingPedidoId, setPayingPedidoId] = useState<number | null>(null);
  const [payErrorPedidoId, setPayErrorPedidoId] = useState<number | null>(null);
  const [payErrorMessage, setPayErrorMessage] = useState<string>("");

  // WebSocket en tiempo real
  useWebSocketMisPedidos();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-100">
        Mis Pedidos
      </h1>

      {/* Loading */}
      {isLoading && <OrdersSkeleton />}

      {/* Error */}
      {error && (
        <Alert variant="error">{getApiErrorMessage(error)}</Alert>
      )}

      {/* Empty */}
      {pedidos && pedidos.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800/60 py-20 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-zinc-400">
              No tenés pedidos todavía
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Hacé tu primer pedido desde el catálogo
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            Ver productos
          </Link>
        </div>
      )}

      {/* Lista */}
      {pedidos && pedidos.length > 0 && (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const isPaying = payingPedidoId === pedido.id;
            const isPendingMp =
              pedido.estado === "PENDIENTE" &&
              pedido.forma_pago === "MERCADO_PAGO";

            return (
              <div
                key={pedido.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 shadow-sm transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-zinc-600">
                    #{pedido.numero_pedido}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    ${pedido.monto_total.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge estado={pedido.estado} />
                    <p className="text-xs text-zinc-600 whitespace-nowrap">
                      {new Date(pedido.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {isPendingMp && (
                    <>
                      <Button
                        size="sm"
                        disabled={isPaying}
                        onClick={() => {
                          setPayingPedidoId(pedido.id);
                          setPayErrorPedidoId(null);
                          setPayErrorMessage("");
                          createPref(pedido.id)
                            .then((pref) => {
                              window.location.href = pref.init_point;
                            })
                            .catch((err) => {
                              setPayingPedidoId(null);
                              setPayErrorPedidoId(pedido.id);
                              setPayErrorMessage(
                                getApiErrorMessage(
                                  err,
                                  "Error al conectar con Mercado Pago",
                                ),
                              );
                            });
                        }}
                      >
                        {isPaying ? (
                          <span className="flex items-center gap-1">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Conectando...
                          </span>
                        ) : (
                          "Pagar con Mercado Pago"
                        )}
                      </Button>
                      {payErrorPedidoId === pedido.id && (
                        <p className="max-w-[250px] text-right text-xs text-red-400">
                          {payErrorMessage}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
