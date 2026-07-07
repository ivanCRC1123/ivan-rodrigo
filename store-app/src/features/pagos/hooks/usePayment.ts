import { useMutation, useQuery } from "@tanstack/react-query";
import { createPreference, getPaymentStatus } from "../services/paymentService";

export function useCreatePreference() {
  return useMutation({
    mutationFn: (pedido_id: number) => createPreference(pedido_id),
  });
}

export function usePaymentStatus(pedido_id: number | null) {
  return useQuery({
    queryKey: ["pago-status", pedido_id],
    queryFn: () => getPaymentStatus(pedido_id!),
    enabled: !!pedido_id,
    refetchInterval: (query) =>
      query.state.data?.mp_status === "approved" ||
      query.state.data?.mp_status === "rejected" ||
      query.state.data?.mp_status === "refunded"
        ? false
        : 2000,
  });
}
