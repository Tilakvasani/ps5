/**
 * useAuth.ts — Shared Auth Hook
 * ==============================
 * Single source of truth for auth actions used across the app.
 */
"use client";
import { useRouter } from "next/navigation";
import { useStore } from "./store";
import { authApi } from "./api";
import { clearAdminAuthCookie } from "./auth-cookie";

// ── Storefront Auth ───────────────────────────────────────────────────────────

/**
 * useLogout — handles user logout for storefront pages.
 * Calls the backend logout endpoint, clears Zustand store, redirects to home.
 */
export function useLogout() {
  const { logout } = useStore();
  const router = useRouter();

  return async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push("/");
  };
}

// ── Admin Auth ────────────────────────────────────────────────────────────────

/**
 * useAdminLogout — handles admin logout.
 * Clears localStorage admin token, redirects to the single unified login page.
 */
export function useAdminLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem("zupwell-admin");
  };
}

// ── Token Helpers ─────────────────────────────────────────────────────────────

/** Get current admin token from localStorage */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zupwell-admin");
    return raw ? JSON.parse(raw)?.token ?? null : null;
  } catch { return null; }
}


