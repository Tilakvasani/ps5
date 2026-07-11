"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirectPage() {
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
