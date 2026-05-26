import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../shared/api/apiClient";

export interface StoreUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
}

interface AuthState {
  user: StoreUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    nombre: string,
    apellido: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        const { data } = await apiClient.post("/api/v1/auth/login", {
          email,
          password,
        });
        const user: StoreUser = {
          id: data.user_id,
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
        };
        set({ user, token: data.access_token });
      },

      register: async (
        email: string,
        nombre: string,
        apellido: string,
        password: string,
      ) => {
        const { data } = await apiClient.post("/api/v1/auth/register", {
          email,
          nombre,
          apellido,
          password,
        });
        const user: StoreUser = {
          id: data.user_id,
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
        };
        set({ user, token: data.access_token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        const state = get();
        return state.user !== null && state.token !== null;
      },
    }),
    {
      name: "store-auth-storage",
    },
  ),
);
