import { http } from "../api/http";

import type { IngredienteRead } from "../types/IngredienteRead";
import type { IngredienteCreate } from "../types/IngredienteCreate";
import type { IngredienteUpdate } from "../types/IngredienteUpdate";

/**
 * POST /ingredientes
 */
export const createIngredient = async (
  data: IngredienteCreate
): Promise<IngredienteRead> => {
  const res = await http.post("/ingredientes/", data);
  return res.data;
};

/**
 * GET /ingredientes
 */
export const getIngredients = async (): Promise<IngredienteRead[]> => {
  const res = await http.get("/ingredientes/");
  return res.data;
};

/**
 * GET /ingredientes/{id}
 */
export const getIngredientById = async (id: number): Promise<IngredienteRead> => {
  const res = await http.get(`/ingredientes/${id}`);
  return res.data;
};

/**
 * PUT /ingredientes/{id}
 */
export const updateIngredient = async (
  id: number,
  data: IngredienteUpdate
): Promise<IngredienteRead> => {
  const res = await http.put(`/ingredientes/${id}`, data);
  return res.data;
};

/**
 * DELETE /ingredientes/{id}
 */
export const deleteIngredient = async (id: number): Promise<void> => {
  await http.delete(`/ingredientes/${id}`);
};
