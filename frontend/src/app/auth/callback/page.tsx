"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const name  = searchParams.get("name");
    const error = searchParams.get("error");

    if (error || !token) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/login");
      return;
    }

    setToken(token);
    setAuthCookie(token); // sync cookie so middleware lets user through
    authApi.me()
      .then((me) => {
        setUser(me);
        toast.success(`Welcome, ${me.name || name || "User"}!`);
        router.replace("/");
      })
      .catch(() => {
        // Fallback: use name from URL param if /me fails
        setUser({ id: 0, name: name || "User", email: "" });
        toast.success(`Welcome, ${name || "User"}!`);
        router.replace("/");
      });
  }, [searchParams, router, setToken, setUser]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(255, 92, 0, 0.2)", borderTopColor: "var(--or)" }} />
      <p className="font-semibold text-sm" style={{ color: "#8F9CAE" }}>Signing you in with Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(255, 92, 0, 0.2)", borderTopColor: "var(--or)" }} />
          <p className="font-semibold text-sm" style={{ color: "#8F9CAE" }}>Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}

