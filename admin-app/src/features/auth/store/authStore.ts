import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UsuarioAuth, LoginResponse } from "../services/auth";
import { login as loginApi } from "../services/auth";

interface AuthState {
  user: UsuarioAuth | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        const response: LoginResponse = await loginApi(email, password);

        // Construya UsuarioAuth a partir de la respuesta
        const user: UsuarioAuth = {
          id: response.user_id,
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          activo: true,
          roles: response.roles.map((codigo) => ({
            id: 0,
            nombre: codigo,
            codigo,
          })),
        };

        set({ user, token: response.access_token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        return get().user !== null && get().token !== null;
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user) return false;
        try {
          return (user.roles ?? []).some((r) => r.codigo === role);
        } catch {
          return false;
        }
      },

      hasAnyRole: (...roles: string[]) => {
        const { user } = get();
        if (!user) return false;
        try {
          const userRoles = user.roles ?? [];
          return roles.some((role) => userRoles.some((r) => r.codigo === role));
        } catch {
          return false;
        }
      },
    }),
    {
      name: "admin-auth-storage",
    },
  ),
);
