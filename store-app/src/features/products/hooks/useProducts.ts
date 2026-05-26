import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductById } from "../services/productService";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
  });
};
