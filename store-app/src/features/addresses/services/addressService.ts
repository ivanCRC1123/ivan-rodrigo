import apiClient from "../../../shared/services/apiClient";
import type {
  DireccionEntregaReadSimple,
  DireccionEntregaCreateCliente,
  DireccionCreatedResponse,
  DireccionPrincipalResponse,
} from "../types";

/** GET /api/v1/direcciones/ — enumera las direcciones de los usuarios autenticados  */
export const fetchMyAddresses = async (): Promise<
  DireccionEntregaReadSimple[]
> => {
  const { data } = await apiClient.get("/api/v1/direcciones/");
  return data;
};

/** POST /api/v1/direcciones/ — crear una nueva dirección */
export const createAddress = async (
  address: DireccionEntregaCreateCliente,
): Promise<DireccionCreatedResponse> => {
  const { data } = await apiClient.post("/api/v1/direcciones/", address);
  return data;
};

/** PATCH /api/v1/direcciones/{id}/principal — Establecer dirección como principal **/
export const setPrincipalAddress = async (
  id: number,
): Promise<DireccionPrincipalResponse> => {
  const { data } = await apiClient.patch(`/api/v1/direcciones/${id}/principal`);
  return data;
};

/** DELETE /api/v1/direcciones/{id} — eliminar una dirección  */
export const deleteAddress = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/direcciones/${id}`);
};
