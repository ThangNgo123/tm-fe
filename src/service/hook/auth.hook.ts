import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { authService } from "@/service/function/auth";
import type { GetProfileResponse } from "@/types/auth";
import type { User } from "@/types";

// Hook to fetch user profile by email
export const useUserProfile = (
  email: string,
  enabled: boolean = true,
): UseQueryResult<GetProfileResponse> => {
  return useQuery({
    queryKey: ["user-profile", email],
    queryFn: () =>
      authService.getUserProfile({
        email,
      }),
    enabled,
  });
};

// Hook to get user data from profile response
export const useUser = (email: string, enabled: boolean = true) => {
  const query = useUserProfile(email, enabled);

  return {
    ...query,
    user: query.data?.user as User | undefined,
  };
};
