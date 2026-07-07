import { http } from "../../../shared/services/api";

import type {
  UnidadMedidaRead,
  UnidadMedidaCreate,
  UnidadMedidaUpdate,
} from "../types/unit.types";

/**
 * GET /api/v1/unidades-medida
 */
export const getUnits = async (): Promise<UnidadMedidaRead[]> => {
  const res = await http.get("/api/v1/unidades-medida/");
  return res.data;
};

/**
 * GET /api/v1/unidades-medida/{id}
 */
export const getUnitById = async (id: number): Promise<UnidadMedidaRead> => {
  const res = await http.get(`/api/v1/unidades-medida/${id}`);
  return res.data;
};

/**
 * POST /api/v1/unidades-medida
 */
export const createUnit = async (
  data: UnidadMedidaCreate,
): Promise<UnidadMedidaRead> => {
  const res = await http.post("/api/v1/unidades-medida/", data);
  return res.data;
};

/**
 * PUT /api/v1/unidades-medida/{id}
 */
export const updateUnit = async (
  id: number,
  data: UnidadMedidaUpdate,
): Promise<UnidadMedidaRead> => {
  const res = await http.put(`/api/v1/unidades-medida/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/unidades-medida/{id}
 */
export const deleteUnit = async (id: number): Promise<void> => {
  await http.delete(`/api/v1/unidades-medida/${id}`);
};
