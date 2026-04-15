import type { UseFormRegister } from "react-hook-form";

export interface SettingsFormValues {
  siteName: string;
  supportEmail: string;
  fcmServerKey: string;
  apiEndpoint: string;
}

export interface SettingsRegisterProps {
  register: UseFormRegister<SettingsFormValues>;
}
