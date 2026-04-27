"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Admin login is handled transparently via the main /login page.
// Entering admin credentials there automatically redirects to the admin dashboard.
// This route silently redirects to /login so the admin panel URL is not discoverable.
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
