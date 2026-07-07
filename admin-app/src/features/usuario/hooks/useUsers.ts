import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  assignRole,
  unassignRole,
  getRoles,
} from "../services/users";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: {
      email: string;
      nombre: string;
      apellido: string;
      password: string;
    }) => createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({
      usuarioId,
      rolId,
    }: {
      usuarioId: number;
      rolId: number;
    }) => assignRole(usuarioId, rolId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const unassignRoleMutation = useMutation({
    mutationFn: ({
      usuarioId,
      rolId,
    }: {
      usuarioId: number;
      rolId: number;
    }) => unassignRole(usuarioId, rolId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return { create, assignRole: assignRoleMutation, unassignRole: unassignRoleMutation };
};
