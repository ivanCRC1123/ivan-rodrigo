import { http } from "../api/http";

export const addIngredientToProduct = async (data: {
  producto_id: number;
  ingrediente_id: number;
  es_removible?: boolean;
}) => {
  const res = await http.post("/producto-ingrediente/", null, {
    params: data,
  });
  return res.data;
};


export const removeIngredientFromProduct = async (data: {
  producto_id: number;
  ingrediente_id: number;
}) => {
  const res = await http.delete("/producto-ingrediente/", {
    params: data,
  });
  return res.data;
};

export const getIngredientsByProduct = async (producto_id: number) => {
  const res = await http.get(`/producto-ingrediente/producto/${producto_id}`);
  return res.data;
};

export const getProductsByIngredient = async (ingrediente_id: number) => {
  const res = await http.get(`/producto-ingrediente/ingrediente/${ingrediente_id}`);
  return res.data;
};
