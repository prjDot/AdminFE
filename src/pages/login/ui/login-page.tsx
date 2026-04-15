import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuth({ name: "Admin User", role: "admin" });
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <div className="p-8 bg-card rounded-lg shadow-sm border w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input placeholder="Username" required />
          <Input type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
