import { authUtils, apiUtils } from "@/utils/api";
import type {
  LoginRequest,
  LoginApiResponse,
  LoginResponseData,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetProfileRequest,
  GetProfileResponse,
} from "@/types/auth";

const PREFIX = "api/v1";

// Auth service functions
export const authService = {
  // Login user with token
  login: async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const response = await authUtils.post<LoginApiResponse>(
      `${PREFIX}/auth/login`,
      credentials,
    );
    // Extract data from the wrapper response
    return response.data;
  },

  // Refresh access token
  refreshToken: async (
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    return authUtils.post<RefreshTokenResponse>(`${PREFIX}/auth/refresh`, data);
  },

  // Get user profile by email
  getUserProfile: async (
    data: GetProfileRequest,
  ): Promise<GetProfileResponse> => {
    return apiUtils.post<GetProfileResponse>(`${PREFIX}/users/profile`, data);
  },
};
