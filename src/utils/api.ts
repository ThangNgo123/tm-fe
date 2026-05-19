import ky, { type KyInstance, type Options } from "ky";
import {
  getAccessToken,
  getRefreshToken,
  setTokensOutside,
  logoutOutside,
} from "@/stores/auth";

// Environment variables or configuration
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "https://be.bdgad.bio";

// Common configuration for all API instances
const commonConfig: Options = {
  timeout: 300000, // 30 seconds
  retry: {
    limit: 2,
    methods: ["get", "put", "head", "delete", "options", "trace"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  headers: {
    Accept: "application/json",
  },
  hooks: {
    beforeError: [
      async (error: any) => {
        try {
          const { response } = error;
          if (response && typeof response.clone === "function") {
            try {
              // Clone the response to avoid consuming the original stream
              const clonedResponse = response.clone();
              const errorData = (await clonedResponse.json()) as unknown;

              // Attach the parsed error data to the error object
              (error as any).errorData = errorData;

              error.name = "APIError";
              error.message =
                (errorData as any)?.message ||
                (errorData as any)?.error ||
                error.message ||
                "An error occurred";
            } catch {
              // If response parsing fails, keep original error
              error.message =
                error.message || `HTTP ${response?.status || "Error"}`;
            }
          }
        } catch {
          // Ensure we always return a valid error
          error.message = error.message || "An unknown error occurred";
        }
        // @ts-ignore - Ky hook signature compatibility
        return error;
      },
    ] as any,
  },
};

// Parent ky instance with common configuration
export const parentApi = ky.create({
  ...commonConfig,
  prefix: BACKEND_BASE_URL,
});

// Auth API instance - for authentication related endpoints
export const authApi = parentApi.extend({
  hooks: {
    beforeRequest: [
      (request: any) => {
        // For auth API, we might not always need the access token
        // Only add it for specific endpoints that require it (like refresh, logout)
        // @ts-ignore - Ky hook signature compatibility
        const url = String(request.url);
        const requiresAuth =
          url.includes("/refresh") ||
          url.includes("/logout") ||
          url.includes("/me") ||
          url.includes("/change-password") ||
          url.includes("/update-profile") ||
          url.includes("/users");

        if (requiresAuth) {
          const token = getAccessToken();
          if (token) {
            // @ts-ignore - Ky hook signature compatibility
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      },
    ] as any,
    afterResponse: [
      async (_: any, __: any, response: any) => {
        // Handle auth-specific responses
        if (response && response.status === 401) {
          // For auth API, 401 might mean refresh token is invalid
          logoutOutside();
        }
        return response;
      },
    ] as any,
  },
} as any);

// Backend API instance - for main application endpoints
export const backendApi = parentApi.extend({
  hooks: {
    beforeRequest: [
      (request: any) => {
        // Always try to add access token for backend API
        const token = getAccessToken();
        if (token) {
          // @ts-ignore - Ky hook signature compatibility
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ] as any,
    afterResponse: [
      async (request: any, _: any, response: any) => {
        // Handle token refresh for backend API
        if (response && response.status === 401) {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            try {
              // Attempt to refresh the token
              const refreshResponse = await authApi
                .post("api/v1/auth/refresh", {
                  json: { refreshToken },
                })
                .json<{
                  success: boolean;
                  token: string;
                  refreshToken?: string;
                }>();

              // Update tokens in store
              setTokensOutside(
                refreshResponse.token,
                refreshResponse.refreshToken,
              );

              // Retry the original request with new token
              // @ts-ignore - Ky hook signature compatibility
              request.headers.set(
                "Authorization",
                `Bearer ${refreshResponse.token}`,
              );
              return ky(request);
            } catch (refreshError) {
              // Refresh failed, logout user
              logoutOutside();
              // Redirect to login page
              if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
              }
              throw refreshError;
            }
          } else {
            // No refresh token available, logout
            logoutOutside();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
          }
        }
        return response;
      },
    ] as any,
  },
} as any);

// Utility functions for creating custom API instances
export const createAuthenticatedApi = (
  _baseUrl?: string,
  additionalConfig: Options = {},
): KyInstance => {
  return parentApi.extend({
    ...additionalConfig,
    hooks: {
      beforeRequest: [
        (request: any) => {
          const token = getAccessToken();
          if (token) {
            // @ts-ignore - Ky hook signature compatibility
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
        ...(additionalConfig.hooks?.beforeRequest || []),
      ] as any,
      afterResponse: [
        async (_: any, __: any, response: any) => {
          if (response && response.status === 401) {
            logoutOutside();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
          }
          return response;
        },
        ...(additionalConfig.hooks?.afterResponse || []),
      ] as any,
      beforeError: [
        ...commonConfig.hooks!.beforeError!,
        ...(additionalConfig.hooks?.beforeError || []),
      ] as any,
    },
  } as any);
};

// Helper function to create API instances for different microservices
export const createServiceApi = (_serviceName?: string): KyInstance => {
  return backendApi;
};

// Export commonly used API methods with better error handling
export const apiUtils = {
  // GET request with automatic token handling
  get: async <T = any>(url: string, options?: Options): Promise<T> => {
    return backendApi.get(url, options).json<T>();
  },

  // POST request with automatic token handling
  post: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return backendApi.post(url, { json: data, ...options }).json<T>();
  },

  // PUT request with automatic token handling
  put: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return backendApi.put(url, { json: data, ...options }).json<T>();
  },

  // DELETE request with automatic token handling
  del: async <T = any>(url: string, options?: Options): Promise<T> => {
    return backendApi.delete(url, options).json<T>();
  },

  // PATCH request with automatic token handling
  patch: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return backendApi.patch(url, { json: data, ...options }).json<T>();
  },
};

// Auth-specific API utilities
export const authUtils = {
  // POST request for auth endpoints
  post: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return authApi.post(url, { json: data, ...options }).json<T>();
  },

  put: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return authApi.put(url, { json: data, ...options }).json<T>();
  },

  // GET request for auth endpoints
  get: async <T = any>(url: string, options?: Options): Promise<T> => {
    return authApi.get(url, options).json<T>();
  },
};
