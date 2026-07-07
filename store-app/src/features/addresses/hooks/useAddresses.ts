import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyAddresses,
  createAddress,
  setPrincipalAddress,
  deleteAddress,
} from "../services/addressService";
import type { DireccionEntregaCreateCliente } from "../types";

const ADDRESSES_KEY = ["my-addresses"];

/** Hook único que proporciona consulta + todas las mutaciones para direcciones **/
export function useAddresses() {
  const queryClient = useQueryClient();

  const getAll = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: fetchMyAddresses,
  });

  const create = useMutation({
    mutationFn: (data: DireccionEntregaCreateCliente) => createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
    onError: (error) => {
      console.error("Error al crear dirección:", error);
    },
  });

  const setPrincipal = useMutation({
    mutationFn: (id: number) => setPrincipalAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
    onError: (error) => {
      console.error("Error al establecer dirección principal:", error);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
    onError: (error) => {
      console.error("Error al eliminar dirección:", error);
    },
  });

  return {
    ...getAll,
    create,
    setPrincipal,
    delete: remove,
    isCreating: create.isPending,
    isSettingPrincipal: setPrincipal.isPending,
    isDeleting: remove.isPending,
  };
}
