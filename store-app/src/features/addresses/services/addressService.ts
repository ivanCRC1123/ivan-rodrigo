import apiClient from "../../../shared/api/apiClient";
import type {
  DireccionEntregaReadSimple,
  DireccionEntregaCreateCliente,
  DireccionCreatedResponse,
  DireccionPrincipalResponse,
} from "../types";

/** GET /api/v1/direcciones/ — list authenticated user's addresses */
export const fetchMyAddresses = async (): Promise<
  DireccionEntregaReadSimple[]
> => {
  const { data } = await apiClient.get("/api/v1/direcciones/");
  return data;
};

/** POST /api/v1/direcciones/ — create a new address */
export const createAddress = async (
  address: DireccionEntregaCreateCliente,
): Promise<DireccionCreatedResponse> => {
  const { data } = await apiClient.post("/api/v1/direcciones/", address);
  return data;
};

/** PATCH /api/v1/direcciones/{id}/principal — set address as principal */
export const setPrincipalAddress = async (
  id: number,
): Promise<DireccionPrincipalResponse> => {
  const { data } = await apiClient.patch(
    `/api/v1/direcciones/${id}/principal`,
  );
  return data;
};

/** DELETE /api/v1/direcciones/{id} — soft-delete an address */
export const deleteAddress = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/direcciones/${id}`);
};
