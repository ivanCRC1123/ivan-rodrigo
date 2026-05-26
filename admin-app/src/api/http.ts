import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth token if available
http.interceptors.request.use((config) => {
  // Read token from zustand persist storage
  try {
    const stored = localStorage.getItem("admin-auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.token && parsed.state.token !== "authenticated") {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor: if 401, clear auth and redirect to login
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin-auth-storage");
      localStorage.removeItem("admin-auth-token");
      // Only redirect if not already on login page
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
  }
);
