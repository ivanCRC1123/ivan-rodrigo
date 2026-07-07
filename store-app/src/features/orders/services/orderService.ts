import apiClient from "../../../shared/services/apiClient";
import type {
  PedidoCreate,
  PedidoCreatedResponse,
  PedidoReadSimple,
} from "../types/orders";

export const createOrder = async (
  data: PedidoCreate,
): Promise<PedidoCreatedResponse> => {
  const { data: response } = await apiClient.post("/api/v1/pedidos/", data);
  return response;
};

export const getOrdersByUser = async (
  usuario_id: number,
): Promise<PedidoReadSimple[]> => {
  const { data } = await apiClient.get(`/api/v1/pedidos/usuario/${usuario_id}`);
  return data;
};

export const getMyOrders = async (): Promise<PedidoReadSimple[]> => {
  const { data } = await apiClient.get("/api/v1/pedidos/mis-pedidos");
  return data;
};
