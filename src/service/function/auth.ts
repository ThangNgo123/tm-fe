import { authUtils, apiUtils } from "@/utils/api";
import type {
  LoginRequest,
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
    const response = await authUtils.post<LoginResponseData>(
      `${PREFIX}/auth/login`,
      credentials,
    );
    // authUtils.post already extracts response.data.data, so response IS the data
    return response;
  },

  // Refresh access token
  refreshToken: async (
    data: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    const response = await authUtils.post<RefreshTokenResponse>(
      `${PREFIX}/auth/refresh`,
      data,
    );
    // authUtils.post already extracts response.data.data, so response IS the data
    return response;
  },

  // Get user profile by email
  getUserProfile: async (
    data: GetProfileRequest,
  ): Promise<GetProfileResponse> => {
    const response = await apiUtils.post<GetProfileResponse>(
      `${PREFIX}/users/profile`,
      data,
    );
    // apiUtils.post already extracts response.data.data, so response IS the data
    return response;
  },
};
