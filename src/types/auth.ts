import type { User } from "./user";

// API Request types
export interface LoginRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GetProfileRequest {
  email: string;
}

// API Response data types (inside data wrapper)
export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Response wrapper types
export interface LoginApiResponse {
  statusCode: number;
  message: string;
  data: LoginResponseData;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface GetProfileResponse {
  user: User;
}

// Wrapper responses (backend always wraps responses with data)
export interface ApiRefreshTokenResponse {
  statusCode: number;
  message: string;
  data: RefreshTokenResponse;
}

export interface ApiGetProfileResponse {
  statusCode: number;
  message: string;
  data: GetProfileResponse;
}

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  statusCode?: number;
  message?: string;
  data?: T;
  success?: boolean;
  code?: string;
  status?: number;
}

// Auth types
export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
