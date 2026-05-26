import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth token if available
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: standardized error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);
