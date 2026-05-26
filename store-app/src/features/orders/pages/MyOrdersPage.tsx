import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import { getApiErrorMessage } from "../../../shared/api/apiError";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  EN_CAMINO: "En Camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/20 text-yellow-400",
  CONFIRMADO: "bg-blue-500/20 text-blue-400",
  EN_PREPARACION: "bg-purple-500/20 text-purple-400",
  EN_CAMINO: "bg-orange-500/20 text-orange-400",
  ENTREGADO: "bg-green-500/20 text-green-400",
  CANCELADO: "bg-red-500/20 text-red-400",
};

export default function MyOrdersPage() {
  const {
    data: pedidos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: getMyOrders,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-100">
        Mis Pedidos
      </h1>

      {isLoading && <p className="text-zinc-500">Cargando pedidos...</p>}

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {getApiErrorMessage(error)}
        </p>
      )}

      {pedidos && pedidos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
          <p className="mt-4 text-lg font-medium text-zinc-400">
            No tenés pedidos todavía
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            Ver productos
          </Link>
        </div>
      )}

      {pedidos && pedidos.length > 0 && (
        <div className="space-y-3">
          {pedidos.map((pedido: any) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 shadow-sm transition hover:border-zinc-700/60"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-zinc-500">
                  {pedido.numero_pedido}
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">
                  ${pedido.monto_total.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    ESTADO_COLORS[pedido.estado] || "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {ESTADO_LABELS[pedido.estado] || pedido.estado}
                </span>
                <p className="mt-1 text-xs text-zinc-600">
                  {new Date(pedido.created_at).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
