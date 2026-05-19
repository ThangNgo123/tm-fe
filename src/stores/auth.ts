import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  login: (accessToken: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

const defaultState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        })),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!get().accessToken,
        }),

      login: (accessToken, user, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          ...defaultState,
        }),

      clearTokens: () =>
        set((state) => ({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: state.user, // Keep user data but clear authentication
        })),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Only persist these fields
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist isLoading
      }),
    },
  ),
);

// Main hook to get current state and actions
export const useAuth = () => {
  const store = useAuthStore();

  return {
    // Current state
    user: store.user,
    accessToken: store.accessToken,
    refreshToken: store.refreshToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,

    // Actions
    setTokens: store.setTokens,
    setUser: store.setUser,
    login: store.login,
    logout: store.logout,
    clearTokens: store.clearTokens,
    setLoading: store.setLoading,
    updateUser: store.updateUser,
  };
};

// Selector hooks for specific parts (for performance optimization)
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () =>
  useAuthStore((state) => state.refreshToken);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);

// Utility hooks
export const useIsLoggedIn = () => {
  const isAuthenticated = useIsAuthenticated();
  const accessToken = useAccessToken();
  return isAuthenticated && !!accessToken;
};

export const useUserRole = () => {
  const user = useUser();
  return user?.role;
};

export const useUserId = () => {
  const user = useUser();
  return user?.id;
};

// Utility functions to access store state outside React components
// These can be used in API services, middleware, or other non-component code
export const getAuthState = () => useAuthStore.getState();

export const getAccessToken = () => {
  const state = useAuthStore.getState();
  return state.accessToken;
};

export const getRefreshToken = () => {
  const state = useAuthStore.getState();
  return state.refreshToken;
};

export const getCurrentUser = () => {
  const state = useAuthStore.getState();
  return state.user;
};

export const isUserAuthenticated = () => {
  const state = useAuthStore.getState();
  return state.isAuthenticated && !!state.accessToken;
};

export const getUserRole = () => {
  const state = useAuthStore.getState();
  return state.user?.role;
};

export const getUserId = () => {
  const state = useAuthStore.getState();
  return state.user?.id;
};

// Actions that can be called outside components
export const setTokensOutside = (
  accessToken: string,
  refreshToken?: string,
) => {
  const { setTokens } = useAuthStore.getState();
  setTokens(accessToken, refreshToken);
};

export const logoutOutside = () => {
  const { logout } = useAuthStore.getState();
  logout();
};

export const clearTokensOutside = () => {
  const { clearTokens } = useAuthStore.getState();
  clearTokens();
};

export const setLoadingOutside = (loading: boolean) => {
  const { setLoading } = useAuthStore.getState();
  setLoading(loading);
};

export const loginOutside = (
  accessToken: string,
  user: User,
  refreshToken?: string,
) => {
  const { login } = useAuthStore.getState();
  login(accessToken, user, refreshToken);
};
