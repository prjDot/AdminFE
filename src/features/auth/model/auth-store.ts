import { create } from "zustand";

export type AdminRole = "SUPER_ADMIN" | "REPORT_MANAGER" | "COMMUNITY_MANAGER";

interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  setAuth: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  admin: null,
  setAuth: (admin) => set({ isAuthenticated: true, admin }),
  logout: () => set({ isAuthenticated: false, admin: null }),
}));
