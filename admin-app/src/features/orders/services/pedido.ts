import { http } from "../../../shared/services/api";
import type {
  EstadoPedidoEnum,
  PedidoReadSimple,
  PedidoReadConDetalles,
  HistorialEstadoRead,
  EstadoCambiadoResponse,
} from "../types";

// API functions
export const getPedidos = async (params?: {
  skip?: number;
  limit?: number;
  estado?: EstadoPedidoEnum;
}): Promise<PedidoReadSimple[]> => {
  const res = await http.get("/api/v1/pedidos/", { params });
  return res.data;
};

export const getPedidoById = async (
  id: number,
): Promise<PedidoReadConDetalles> => {
  const res = await http.get(`/api/v1/pedidos/${id}`);
  return res.data;
};

export const cambiarEstadoPedido = async (
  pedido_id: number,
  estado_nuevo: EstadoPedidoEnum,
  razon?: string,
): Promise<EstadoCambiadoResponse> => {
  const res = await http.patch(`/api/v1/pedidos/${pedido_id}/estado`, {
    estado_nuevo,
    razon,
  });
  return res.data;
};

export const getHistorialPedido = async (
  pedido_id: number,
): Promise<HistorialEstadoRead[]> => {
  const res = await http.get(`/api/v1/pedidos/${pedido_id}/historial`);
  return res.data;
};

export const cancelarPedido = async (
  pedido_id: number,
  razon?: string,
): Promise<EstadoCambiadoResponse> => {
  const res = await http.post(
    `/api/v1/pedidos/${pedido_id}/cancelar${razon ? `?razon=${encodeURIComponent(razon)}` : ""}`,
  );
  return res.data;
};
