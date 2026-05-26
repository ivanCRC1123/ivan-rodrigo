import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getPedidos,
  getPedidoById,
  cambiarEstadoPedido,
  cancelarPedido,
  getHistorialPedido,
  type EstadoPedidoEnum,
  type PedidoReadSimple,
  type PedidoReadConDetalles,
  type HistorialEstadoRead,
} from "../../api/pedido.api";
import { getApiErrorMessage } from "../../lib/apiError";

const ESTADOS_VALIDOS: Record<EstadoPedidoEnum, EstadoPedidoEnum[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["EN_CAMINO"],
  EN_CAMINO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ESTADO_LABELS: Record<EstadoPedidoEnum, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  EN_CAMINO: "En Camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLORS: Record<EstadoPedidoEnum, string> = {
  PENDIENTE: "bg-yellow-500/20 text-yellow-400",
  CONFIRMADO: "bg-blue-500/20 text-blue-400",
  EN_PREPARACION: "bg-purple-500/20 text-purple-400",
  EN_CAMINO: "bg-orange-500/20 text-orange-400",
  ENTREGADO: "bg-green-500/20 text-green-400",
  CANCELADO: "bg-red-500/20 text-red-400",
};

const TRANSITION_LABELS: Record<string, string> = {
  CONFIRMADO: "Confirmar",
  EN_PREPARACION: "Iniciar preparación",
  EN_CAMINO: "Enviar a domicilio",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar",
};

export const PedidosPage = () => {
  const queryClient = useQueryClient();
  const [filterEstado, setFilterEstado] = useState<EstadoPedidoEnum | "">("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [razon, setRazon] = useState("");

  const { data: pedidos = [], isLoading, error } = useQuery({
    queryKey: ["pedidos", filterEstado],
    queryFn: () =>
      getPedidos(filterEstado ? { estado: filterEstado as EstadoPedidoEnum } : {}),
  });

  const { data: selectedPedido } = useQuery({
    queryKey: ["pedido", selectedId],
    queryFn: () => (selectedId ? getPedidoById(selectedId) : null),
    enabled: !!selectedId,
  });

  const { data: historial } = useQuery({
    queryKey: ["pedido-historial", selectedId],
    queryFn: () => (selectedId ? getHistorialPedido(selectedId) : null),
    enabled: !!selectedId,
  });

  const changeEstadoMutation = useMutation({
    mutationFn: ({
      id,
      estado,
      razon: r,
    }: {
      id: number;
      estado: EstadoPedidoEnum;
      razon?: string;
    }) => cambiarEstadoPedido(id, estado, r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["pedido-historial", selectedId] });
      setRazon("");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, razon: r }: { id: number; razon?: string }) =>
      cancelarPedido(id, r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["pedido-historial", selectedId] });
      setRazon("");
    },
  });

  const isChanging =
    changeEstadoMutation.isPending || cancelMutation.isPending;

  return (
    <section className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Pedidos</h1>

      {/* FILTRO POR ESTADO */}
      <div className="flex gap-2">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as EstadoPedidoEnum | "")}
          className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-sm text-white"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-400">Cargando pedidos...</p>}
      {error && (
        <p className="text-red-400">{getApiErrorMessage(error)}</p>
      )}

      {/* TWO PANEL LAYOUT */}
      <div className="flex gap-6">
        {/* LEFT: Pedidos list */}
        <div className="w-1/2 overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-800 text-left text-gray-300">
              <tr>
                <th className="p-3">N° Pedido</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Total</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`cursor-pointer border-t border-zinc-700 transition hover:bg-zinc-800 ${
                    selectedId === p.id ? "bg-zinc-700" : ""
                  }`}
                >
                  <td className="p-3 font-medium">{p.numero_pedido}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium ${
                        ESTADO_COLORS[p.estado]
                      }`}
                    >
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400">
                    ${p.monto_total}
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No hay pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Detail panel */}
        <div className="w-1/2 space-y-4">
          {!selectedPedido && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-gray-500">
              Seleccione un pedido para ver detalles
            </div>
          )}

          {selectedPedido && (
            <>
              {/* DETALLES DEL PEDIDO */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                <h2 className="mb-3 text-lg font-bold">
                  {selectedPedido.numero_pedido}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Estado:</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                      ESTADO_COLORS[selectedPedido.estado]
                    }`}
                  >
                    {ESTADO_LABELS[selectedPedido.estado]}
                  </span>
                  <span className="text-gray-400">Usuario ID:</span>
                  <span>{selectedPedido.usuario_id}</span>
                  <span className="text-gray-400">Forma de pago:</span>
                  <span>{selectedPedido.forma_pago}</span>
                  <span className="text-gray-400">Total:</span>
                  <span className="text-emerald-400">
                    ${selectedPedido.monto_total}
                  </span>
                  <span className="text-gray-400">Dirección:</span>
                  <span className="truncate">
                    {selectedPedido.direccion_entrega}
                  </span>
                  {selectedPedido.observaciones && (
                    <>
                      <span className="text-gray-400">Obs:</span>
                      <span>{selectedPedido.observaciones}</span>
                    </>
                  )}
                </div>
              </div>

              {/* TRANSICIONES DE ESTADO */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                <h3 className="mb-3 text-sm font-semibold text-gray-300">
                  Acciones
                </h3>

                <div className="mb-3 flex flex-wrap gap-2">
                  {ESTADOS_VALIDOS[selectedPedido.estado].map(
                    (estadoPosible) => (
                      <button
                        key={estadoPosible}
                        disabled={isChanging}
                        onClick={() => {
                          if (estadoPosible === "CANCELADO") {
                            cancelMutation.mutate({
                              id: selectedPedido.id,
                              razon: razon || undefined,
                            });
                          } else {
                            changeEstadoMutation.mutate({
                              id: selectedPedido.id,
                              estado: estadoPosible,
                              razon: razon || undefined,
                            });
                          }
                        }}
                        className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                      >
                        {TRANSITION_LABELS[estadoPosible] || estadoPosible}
                      </button>
                    )
                  )}
                  {ESTADOS_VALIDOS[selectedPedido.estado].length === 0 && (
                    <span className="text-xs text-gray-500">
                      Estado terminal - no hay acciones disponibles
                    </span>
                  )}
                </div>

                <input
                  value={razon}
                  onChange={(e) => setRazon(e.target.value)}
                  placeholder="Razón (opcional)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-xs text-white"
                />
                {changeEstadoMutation.isError && (
                  <p className="mt-2 text-xs text-red-400">
                    {getApiErrorMessage(changeEstadoMutation.error)}
                  </p>
                )}
              </div>

              {/* DETALLES (PRODUCTOS) */}
              {selectedPedido.detalles.length > 0 && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                  <h3 className="mb-3 text-sm font-semibold text-gray-300">
                    Productos
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="pb-1">Producto</th>
                        <th className="pb-1">Cant</th>
                        <th className="pb-1">Precio</th>
                        <th className="pb-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.detalles.map((d) => (
                        <tr key={d.id} className="border-t border-zinc-800">
                          <td className="py-1">{d.nombre_producto}</td>
                          <td className="py-1">{d.cantidad}</td>
                          <td className="py-1">${d.precio_unitario}</td>
                          <td className="py-1 text-emerald-400">
                            ${d.subtotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* HISTORIAL */}
              {historial && historial.length > 0 && (
                <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                  <h3 className="mb-3 text-sm font-semibold text-gray-300">
                    Historial de estados
                  </h3>
                  <div className="space-y-2 text-sm">
                    {historial.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2"
                      >
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            ESTADO_COLORS[h.estado_nuevo]
                          }`}
                        >
                          {ESTADO_LABELS[h.estado_nuevo]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                        {h.razon && (
                          <span className="text-xs text-gray-400">
                            — {h.razon}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
