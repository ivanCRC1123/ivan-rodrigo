import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, getMyOrders } from "../services/orderService";
import type { PedidoCreate } from "../types/orders";
import { useCartStore } from "../../../store/useCartStore";

export function useOrders() {
  const queryClient = useQueryClient();

  const getAll = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: getMyOrders,
  });

  const create = useMutation({
    mutationFn: (order: PedidoCreate) => createOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      useCartStore.getState().clearCart();
    },
  });

  return { ...getAll, create, isCreating: create.isPending };
}
