import axios from "axios";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // If running on the server (SSR), use the internal Docker URL
  if (typeof window === "undefined") {
    return envUrl || "http://api:3000";
  }

  // If NEXT_PUBLIC_API_URL is set and is a real public URL (not internal Docker hostname), use it
  if (envUrl && !envUrl.includes("://api:")) {
    return envUrl;
  }

  // Auto-detect: use the browser's current hostname with API port 3000
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
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
