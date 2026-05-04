/**
 * useAuth.ts — Shared Auth Hook
 * ==============================
 * Single source of truth for auth actions used across the app.
 * 
 * Previously duplicated in:
 *   - components/storefront/Navbar.tsx
 *   - app/account/page.tsx
 *   - app/admin/layout.tsx (admin version)
 */
"use client";
import { useRouter } from "next/navigation";
import { useStore } from "./store";
import { authApi } from "./api";

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
 * Clears localStorage admin token, redirects to admin login.
 */
export function useAdminLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem("zupwell-admin");
    router.push("/admin/login");
  };
}

// ── Token Helpers ─────────────────────────────────────────────────────────────

/** Get current user token from Zustand store (localStorage) */
export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zupwell-store");
    return raw ? JSON.parse(raw)?.state?.token ?? null : null;
  } catch { return null; }
}

/** Get current admin token from localStorage */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zupwell-admin");
    return raw ? JSON.parse(raw)?.token ?? null : null;
  } catch { return null; }
}
