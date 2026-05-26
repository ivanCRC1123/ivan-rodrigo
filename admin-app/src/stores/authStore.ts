import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UsuarioAuth } from "../api/auth.api";

interface AuthState {
  user: UsuarioAuth | null;
  token: string | null;
  setAuth: (user: UsuarioAuth, token?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user: UsuarioAuth, token?: string) => {
        set({ user, token: token || "authenticated" });
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem("admin-auth-token");
      },

      isAuthenticated: () => {
        return get().user !== null;
      },

      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some(
          (r) => r.codigo === "ADMIN" || r.nombre === "ADMIN"
        );
      },
    }),
    {
      name: "admin-auth-storage",
    }
  )
);
