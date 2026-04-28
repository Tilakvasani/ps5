"use client";
/**
 * AuthSync — runs once on app startup.
 * If Zustand has a token in localStorage but the `user-token` cookie
 * is missing (e.g. user logged in before this fix was deployed, or cookie
 * was cleared), this re-stamps the cookie so the Next.js middleware
 * lets them through to /checkout, /account, /order without bouncing to /login.
 */
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { setAuthCookie } from "@/lib/auth-cookie";

export default function AuthSync() {
  const token = useStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    // Only write if the cookie is missing — avoids churning on every render
    const hasCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("user-token="));
    if (!hasCookie) {
      setAuthCookie(token);
    }
  }, [token]);

  return null;
}