import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";

export function AdminHeader() {
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6">
      <div className="font-semibold text-sm">Welcome, {admin?.name || "Admin"}</div>
      <Button variant="ghost" size="sm" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
