import { http } from "../../../shared/services/api";

export const addProductToCategory = async (data: {
  producto_id: number;
  categoria_id: number;
  es_principal?: boolean;
}) => {
  const res = await http.post("/producto-categoria/", data);
  return res.data;
};

export const removeProductFromCategory = async (data: {
  producto_id: number;
  categoria_id: number;
}) => {
  const res = await http.delete("/producto-categoria/", {
    params: data,
  });
  return res.data;
};

export const getCategoriesByProduct = async (producto_id: number) => {
  const res = await http.get(`/producto-categoria/producto/${producto_id}`);
  return res.data;
};

export const getProductsByCategory = async (categoria_id: number) => {
  const res = await http.get(`/producto-categoria/categoria/${categoria_id}`);
  return res.data;
};
