"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin Login — redirects to the unified /login page.
 * The login page already handles both user and admin authentication flows
 * (phone OTP gate → admin credentials). No need for a separate 780-line duplicate.
 */
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
      <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "4px solid rgba(255,92,0,0.2)", borderTopColor: "var(--or)" }} />
    </div>
  );
}