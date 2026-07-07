import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

/** Envuelve una ruta, redirige a /login si no está autenticado */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
