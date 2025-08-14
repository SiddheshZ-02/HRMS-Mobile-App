import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

export interface AuthState {
  accessToken: string | null;
  roles: string | null;
  rolesId: string | null;
  companyId: number | null;
  employeeId: number | null;
  employeeFirstName: string | null;
  imageId: string | null;
  sidebar: any[] | null;
  message: string | null;
  statusCode: number | null;
  statusMessage: string | null;
  isAuthenticated: boolean;
  login: (data: Partial<AuthState>) => void;
  logout: () => Promise<void>;
}

const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: any) => {
    await SecureStore.setItemAsync(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      roles: null,
      rolesId: null,
      companyId: null,
      employeeId: null,
      employeeFirstName: null,
      imageId: null,
      sidebar: null,
      message: null,
      statusCode: null,
      statusMessage: null,
      isAuthenticated: false,

      login: (data) =>
        set((state) => ({
          ...state,
          accessToken: data.accessToken ?? null,
          roles: data.roles ?? null,
          rolesId: data.rolesId ?? null,
          companyId: data.companyId ?? null,
          employeeId: data.employeeId ?? null,
          employeeFirstName: data.employeeFirstName ?? null,
          imageId: data.imageId ?? null,
          sidebar: data.sidebar ?? null,
          message: data.message ?? null,
          statusCode: data.statusCode ?? null,
          statusMessage: data.statusMessage ?? null,
          isAuthenticated: !!data.accessToken,
        })),

      logout: async () => {
        try {
          // Clear persisted data in SecureStore
          await SecureStore.deleteItemAsync("auth-storage");
          // Reset state
          set({
            accessToken: null,
            roles: null,
            rolesId: null,
            companyId: null,
            employeeId: null,
            employeeFirstName: null,
            imageId: null,
            sidebar: null,
            message: null,
            statusCode: null,
            statusMessage: null,
            isAuthenticated: false,
          });
          console.log("Logout successful, SecureStore cleared");
        } catch (error) {
          console.error("Failed to clear SecureStore on logout:", error);
          throw error; // Rethrow to handle in UI
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        roles: state.roles,
        rolesId: state.rolesId,
        companyId: state.companyId,
        employeeId: state.employeeId,
        employeeFirstName: state.employeeFirstName,
        imageId: state.imageId,
        sidebar: state.sidebar,
      }),
    }
  )
);

export default useAuthStore;