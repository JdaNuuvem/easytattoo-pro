import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== "undefined") {
  console.warn("[EasyTattoo] NEXT_PUBLIC_API_URL não configurado. Usando localhost:3090 como fallback.");
}

export const api = axios.create({
  baseURL: API_URL || "http://localhost:3090",
  headers: { "Content-Type": "application/json" },
});

// Add auth token interceptor + fix Content-Type for FormData
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Let axios auto-set Content-Type with boundary for FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Add response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
