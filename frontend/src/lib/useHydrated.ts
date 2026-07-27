"use client";
import { useState, useEffect } from "react";

/**
 * useHydrated — Returns true only after the client component has mounted
 * and Zustand state has hydrated from localStorage.
 * Prevents premature auth redirects during initial SSR / hydration.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
