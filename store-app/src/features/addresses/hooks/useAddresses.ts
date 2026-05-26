import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyAddresses,
  createAddress,
  setPrincipalAddress,
  deleteAddress,
} from "../services/addressService";
import type { DireccionEntregaCreateCliente } from "../types";

const ADDRESSES_KEY = ["my-addresses"];

/** useQuery: fetch all addresses for the authenticated user */
export const useAddresses = () => {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: fetchMyAddresses,
  });
};

/** useMutation: create a new address, then invalidate the list */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DireccionEntregaCreateCliente) => createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
};

/** useMutation: set an address as principal, then invalidate */
export const useSetPrincipalAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setPrincipalAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
};

/** useMutation: delete an address, then invalidate */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
};
