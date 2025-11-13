import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { authApi, LoginCredentials, RegisterData } from "@/lib/auth";
import { Role, PermissionKey } from "@/types/permission";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: PermissionKey[];
  role: Role | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  fetchUserPermissions: () => Promise<void>;
  hasPermission: (permission: PermissionKey) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],
      role: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // Store tokens in localStorage
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch user permissions after login
          await get().fetchUserPermissions();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);

          // Store tokens in localStorage
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear tokens from localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
            permissions: [],
            role: null,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          permissions: [],
          role: null,
        });
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            accessToken,
            refreshToken: localStorage.getItem("refreshToken"),
            isAuthenticated: true,
          });

          // Fetch user permissions after auth check
          await get().fetchUserPermissions();
        } catch (error) {
          get().clearAuth();
        }
      },

      fetchUserPermissions: async () => {
        try {
          const state = get();
          if (!state.user) return;

          // Fetch role and permissions from backend
          // For now, we'll construct a simple mapping based on user role
          // In a real implementation, backend should provide this
          const roleResponse = await api.get(`/roles`);
          const roles: Role[] = roleResponse.data.data;

          // Find user's role
          const userRole = roles.find(
            (r) => r.name === state.user?.role.toLowerCase()
          );

          if (userRole) {
            // Extract permission keys from role's permissions
            const permissionKeys = userRole.permissions.map(
              (p) => `${p.module}.${p.resource}.${p.action}`
            );

            set({
              role: userRole,
              permissions: permissionKeys,
            });
          }
        } catch (error) {
          console.error("Failed to fetch user permissions:", error);
          set({ permissions: [], role: null });
        }
      },

      hasPermission: (permission: PermissionKey) => {
        const state = get();
        return state.permissions.includes(permission);
      },

      hasAllPermissions: (permissions: PermissionKey[]) => {
        const state = get();
        return permissions.every((p) => state.permissions.includes(p));
      },

      hasAnyPermission: (permissions: PermissionKey[]) => {
        const state = get();
        return permissions.some((p) => state.permissions.includes(p));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        role: state.role,
      }),
    }
  )
);
