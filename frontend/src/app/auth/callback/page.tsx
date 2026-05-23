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

    // FIX: store token first, then fetch real user data from backend
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
      <div className="h-10 w-10 rounded-full border-4 border-[#48C062]/30 border-t-[#48C062] animate-spin" />
      <p className="text-[#45353E] font-medium text-sm">Signing you in with Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF6]">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-[#48C062]/30 border-t-[#48C062] animate-spin" />
          <p className="text-[#45353E] font-medium text-sm">Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
