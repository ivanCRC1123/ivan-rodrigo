import axios from "axios";

const apiClient = axios.create({
  // Backend corriendo en 8000
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("store-auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: logging y error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
