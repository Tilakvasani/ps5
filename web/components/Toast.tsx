"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSnapshot } from "valtio";
import { store } from "@/lib/store";

const toastStyles = {
  success: "border-green-500/30 bg-green-500/10 text-green-200",
  error: "border-red-500/30 bg-red-500/10 text-red-200",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-200",
};

const toastIcons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function Toast() {
  const snap = useSnapshot(store);

  useEffect(() => {
    if (snap.toast) {
      const timer = setTimeout(() => {
        store.toast = null;
      }, snap.toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [snap.toast]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="wait">
        {snap.toast && (
          <motion.div
            key={snap.toast.message}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-lg ${
              toastStyles[snap.toast.type]
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
              {toastIcons[snap.toast.type]}
            </span>
            <p className="text-sm font-medium">{snap.toast.message}</p>
            <button
              onClick={() => (store.toast = null)}
              className="ml-2 text-white/40 hover:text-white transition"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
  duration = 4000
) {
  store.toast = { message, type, duration };
}

