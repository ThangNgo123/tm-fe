import ky, { type KyInstance, type Options } from "ky";
import {
  getAccessToken,
  getRefreshToken,
  setTokensOutside,
  logoutOutside,
} from "@/stores/auth";
import type { RefreshTokenResponse } from "@/types/auth";

type ApiEnvelope<T> = {
  statusCode?: number;
  message?: string;
  data: T;
};

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const commonConfig: Options = {
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ["get", "put", "head", "delete", "options", "trace"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  headers: {
    Accept: "application/json",
  },
};

const createApi = (prefixUrl: string): KyInstance =>
  ky.create({
    ...commonConfig,
    baseUrl: prefixUrl,
  } as any);

export const parentApi = ky.create(commonConfig as any);
export const backendApi = createApi(BACKEND_BASE_URL);

let refreshTokenPromise: Promise<string | null> | null = null;

const buildHeaders = (headers?: Options["headers"], token?: string) => {
  const requestHeaders = new Headers(headers as HeadersInit | undefined);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return requestHeaders;
};

const parseResponseData = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  const parsed = JSON.parse(text) as ApiEnvelope<T> | T;

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "data" in parsed &&
    typeof (parsed as ApiEnvelope<T>).data !== "undefined"
  ) {
    return (parsed as ApiEnvelope<T>).data;
  }

  return parsed as T;
};

const isUnauthorizedError = (error: unknown) => {
  return (
    (error as { response?: Response } | undefined)?.response?.status === 401
  );
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshTokenPromise) {
    refreshTokenPromise = backendApi
      .post("api/v1/auth/refresh", {
        json: { refreshToken },
      } as any)
      .json<ApiEnvelope<RefreshTokenResponse> | RefreshTokenResponse>()
      .then((response) => {
        const responseData =
          response && "data" in response ? response.data : response;
        const accessToken = responseData?.accessToken;
        const nextRefreshToken = responseData?.refreshToken || refreshToken;

        if (!accessToken) {
          return null;
        }

        setTokensOutside(accessToken, nextRefreshToken);
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshTokenPromise = null;
      });
  }

  return refreshTokenPromise;
};

const requestBackend = async <T>(
  method: HttpMethod,
  url: string,
  options?: Options,
): Promise<T> => {
  const token = getAccessToken();
  const requestOptions = {
    ...options,
    headers: buildHeaders(options?.headers, token || undefined),
  } as any;

  try {
    const response = await backendApi[method](url, requestOptions);
    return parseResponseData<T>(response);
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      logoutOutside();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw error;
    }

    const retryOptions = {
      ...options,
      headers: buildHeaders(options?.headers, newAccessToken),
    } as any;

    const retryResponse = await backendApi[method](url, retryOptions);
    return parseResponseData<T>(retryResponse);
  }
};

const requestAuth = async <T>(
  method: HttpMethod,
  url: string,
  options?: Options,
): Promise<T> => {
  const response = await backendApi[method](url, options as any);
  return parseResponseData<T>(response);
};

export const apiUtils = {
  get: async <T = any>(url: string, options?: Options): Promise<T> => {
    return requestBackend<T>("get", url, options);
  },

  post: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestBackend<T>("post", url, {
      ...options,
      json: data,
    } as any);
  },

  put: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestBackend<T>("put", url, {
      ...options,
      json: data,
    } as any);
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestBackend<T>("patch", url, {
      ...options,
      json: data,
    } as any);
  },

  delete: async <T = any>(url: string, options?: Options): Promise<T> => {
    return requestBackend<T>("delete", url, options);
  },

  del: async <T = any>(url: string, options?: Options): Promise<T> => {
    return apiUtils.delete<T>(url, options);
  },
};

export const authUtils = {
  get: async <T = any>(url: string, options?: Options): Promise<T> => {
    return requestAuth<T>("get", url, options);
  },

  post: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestAuth<T>("post", url, {
      ...options,
      json: data,
    } as any);
  },

  put: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestAuth<T>("put", url, {
      ...options,
      json: data,
    } as any);
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    options?: Options,
  ): Promise<T> => {
    return requestAuth<T>("patch", url, {
      ...options,
      json: data,
    } as any);
  },

  delete: async <T = any>(url: string, options?: Options): Promise<T> => {
    return requestAuth<T>("delete", url, options);
  },
};

export const createAuthenticatedApi = (
  baseUrl: string,
  additionalConfig: Options = {},
): KyInstance => {
  return ky.create({
    ...commonConfig,
    ...additionalConfig,
    baseUrl,
  } as any);
};

export const createServiceApi = (
  serviceName: string,
  baseUrl?: string,
): KyInstance => {
  const serviceBaseUrl = baseUrl || `${BACKEND_BASE_URL}/${serviceName}`;
  return createAuthenticatedApi(serviceBaseUrl);
};
