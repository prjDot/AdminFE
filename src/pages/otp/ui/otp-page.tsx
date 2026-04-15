import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useNavigate, Navigate } from "react-router-dom";
import { ROLES } from "@/shared/config/constants";

export function OTPPage() {
  const [code, setCode] = useState("");
  const { step, tempEmail, verifyOTP } = useAuthStore();
  const navigate = useNavigate();

  // 정상 경로(/login -> /login/mfa)를 거치지 않았으면 로그인으로 돌려보냄
  if (step === "NONE") {
    return <Navigate to="/login" replace />;
  }

  // 이미 인증 완료된 경우 대시보드로
  if (step === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 6) {
      verifyOTP({
        id: "admin-1",
        email: tempEmail || "admin@pawgen.com",
        name: "Super Admin",
        role: ROLES.ADMIN,
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <div className="p-8 bg-card rounded-lg shadow-sm border w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">2-Step Verification</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter the 6-digit code from your authenticator app for <strong>{tempEmail}</strong>.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input 
            type="text" 
            placeholder="000000" 
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required 
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
          />
          <Button type="submit" className="w-full h-11" disabled={code.length < 6}>
            Verify
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          테스트: 아무 6자리 숫자나 입력하세요
        </p>
      </div>
    </div>
  );
}
