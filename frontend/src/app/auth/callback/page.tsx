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
    const isAdmin = searchParams.get("isAdmin") === "true";
    const adminName = searchParams.get("adminName");

    if (error || !token) {
      toast.error("Sign-in failed. Please try again.");
      router.replace("/login");
      return;
    }

    setToken(token);
    setAuthCookie(token); // sync cookie so middleware lets user through

    if (isAdmin) {
      localStorage.setItem("zupwell-admin", JSON.stringify({ name: adminName || name || "Admin", token }));
      try {
        const { setAdminAuthCookie } = require("@/lib/auth-cookie");
        setAdminAuthCookie(token);
      } catch (e) {}
    }

    authApi.me()
      .then((me) => {
        setUser(me);
        toast.success(`Welcome, ${me.name || name || "User"}!`);
        router.replace(isAdmin ? "/admin" : "/");
      })
      .catch(() => {
        // Fallback: use name from URL param if /me fails
        setUser({ id: 0, name: name || "User", email: "" });
        toast.success(`Welcome, ${name || "User"}!`);
        router.replace(isAdmin ? "/admin" : "/");
      });
  }, [searchParams, router, setToken, setUser]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(255, 92, 0, 0.2)", borderTopColor: "var(--or)" }} />
      <p className="font-semibold text-sm" style={{ color: "#F8F8F8" }}>Signing you in with Google...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 animate-spin" style={{ borderColor: "rgba(255, 92, 0, 0.2)", borderTopColor: "var(--or)" }} />
          <p className="font-semibold text-sm" style={{ color: "#F8F8F8" }}>Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}

