import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  admin: { name: string; role: string } | null;
  setAuth: (admin: { name: string; role: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  admin: null,
  setAuth: (admin) => set({ isAuthenticated: true, admin }),
  logout: () => set({ isAuthenticated: false, admin: null }),
}));
