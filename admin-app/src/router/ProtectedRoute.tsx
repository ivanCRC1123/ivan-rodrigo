import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/authStore";
import { routeRoles } from "./routes.config";

export const ProtectedRoute = () => {
  const location = useLocation();
  const { user, hasAnyRole } = useAuthStore();

  // Guardia de autenticación
  if (!user) return <Navigate to="/login" replace />;

  // Guardia de roles
  const currentPath = "/" + location.pathname.split("/")[1];
  const allowedRoles = routeRoles[currentPath];
  if (allowedRoles && !hasAnyRole(...allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
