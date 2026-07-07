import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de solicitudes: agregue token de autenticación si está disponible
http.interceptors.request.use((config) => {
  // Leer token desde el almacenamiento persistente de zustand
  try {
    const stored = localStorage.getItem("admin-auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.token && parsed.state.token !== "authenticated") {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    }
  } catch {
    // ignorar
  }
  return config;
});

// Interceptor de respuesta: si es 401, borre la autenticación y redirija para iniciar sesión
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin-auth-storage");
      localStorage.removeItem("admin-auth-token");
      // Solo redirija si aún no está en la página de inicio de sesión
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    console.error("[API Error]", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);
