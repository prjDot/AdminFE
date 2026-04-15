import { create } from "zustand";
import { type Role } from "@/shared/config/constants";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  step: "NONE" | "OTP_REQUIRED" | "AUTHENTICATED";
  tempEmail: string | null;
  admin: AdminUser | null;
  
  verifyEmailPass: (email: string) => void;
  verifyOTP: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  step: "NONE",
  tempEmail: null,
  admin: null,
  
  verifyEmailPass: (email) => set({ step: "OTP_REQUIRED", tempEmail: email }),
  verifyOTP: (admin) => set({ step: "AUTHENTICATED", admin, tempEmail: null }),
  logout: () => set({ step: "NONE", admin: null, tempEmail: null }),
}));
