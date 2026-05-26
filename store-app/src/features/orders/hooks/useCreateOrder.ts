import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../services/orderService";
import type { PedidoCreate } from "../types";
import { useCartStore } from "../../../store/useCartStore";

export const useCreateOrder = () => {
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (order: PedidoCreate) => createOrder(order),
    onSuccess: () => {
      clearCart();
    },
  });
};
