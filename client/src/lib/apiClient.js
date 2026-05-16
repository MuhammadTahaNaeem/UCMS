import axios from "axios";
import { store } from "@/store";
import { logout } from "@/features/auth/authSlice";

const isLocalHost = (hostName) => ["localhost", "127.0.0.1", "::1"].includes(String(hostName || "").toLowerCase());

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    const configuredUrl = import.meta.env.VITE_API_URL;

    if (configuredUrl) {
      try {
        const parsedUrl = new URL(configuredUrl, window.location.href);
        if (!isLocalHost(parsedUrl.hostname) || isLocalHost(currentHost)) {
          return configuredUrl;
        }
      } catch {
        return configuredUrl;
      }
    }

    return `${window.location.protocol}//${currentHost}:5000/api`;
  }

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return "http://localhost:5000/api";
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState()?.auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export { apiClient };