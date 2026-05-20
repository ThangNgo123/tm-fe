import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokensOutside,
  logoutOutside,
} from "@/stores/auth";

// Environment variables
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token before sending request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle responses and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[Interceptor] 401 detected, attempting token refresh...");
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        console.log("[Interceptor] Refresh token exists:", !!refreshToken);

        if (!refreshToken) {
          console.log("[Interceptor] No refresh token, logging out");
          logoutOutside();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return Promise.reject(error);
        }

        // Try to refresh token
        console.log("[Interceptor] Calling refresh endpoint...");
        const refreshResponse = await axios.post(
          `${BACKEND_BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
        );

        console.log("[Interceptor] Refresh response:", refreshResponse.data);
        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        if (!accessToken) {
          console.error("[Interceptor] No accessToken in refresh response");
          logoutOutside();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return Promise.reject(
            new Error("No accessToken in refresh response"),
          );
        }

        // Update tokens in store
        console.log("[Interceptor] Updating tokens in store");
        setTokensOutside(accessToken, newRefreshToken || refreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        console.log("[Interceptor] Retrying original request with new token");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        console.error("[Interceptor] Token refresh failed:", refreshError);
        logoutOutside();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data) {
      const errorData = error.response.data as any;
      error.message = errorData.message || errorData.error || error.message;
    }

    return Promise.reject(error);
  },
);

// API utility functions
export const apiUtils = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.get<{ data: T }>(url, config);
    return response.data.data;
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.post<{ data: T }>(url, data, config);
    return response.data.data;
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.put<{ data: T }>(url, data, config);
    return response.data.data;
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.patch<{ data: T }>(url, data, config);
    return response.data.data;
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.delete<{ data: T }>(url, config);
    return response.data.data;
  },

  // Alias for delete
  del: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.delete<T>(url, config);
  },
};

// Auth-specific API utilities (same as general)
export const authUtils = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.get<T>(url, config);
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.post<T>(url, data, config);
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.put<T>(url, data, config);
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.patch<T>(url, data, config);
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiUtils.delete<T>(url, config);
  },
};

// Export axios instance for custom usage if needed
export { axiosInstance };
