import apiClient from "../../../shared/apiClient";
import type { PedidoCreate, PedidoCreatedResponse } from "../types";

export const createOrder = async (
  data: PedidoCreate
): Promise<PedidoCreatedResponse> => {
  const { data: response } = await apiClient.post(
    "/api/v1/pedidos/",
    data
  );
  return response;
};

export const getOrdersByUser = async (
  usuario_id: number
): Promise<any[]> => {
  const { data } = await apiClient.get(
    `/api/v1/pedidos/usuario/${usuario_id}`
  );
  return data;
};
