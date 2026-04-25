"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { store } from "@/lib/store";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const snap = useSnapshot(store);

  const menuItems = snap.token
    ? [
        { label: "Products", href: "/products" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Cart", href: "/checkout" },
      ]
    : [
        { label: "Products", href: "/products" },
        { label: "Sign In", href: "/login" },
        { label: "Sign Up", href: "/register" },
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] border-l border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
          >
            {/* Close Button */}
            <div className="flex items-center justify-between mb-12">
              <span className="text-2xl font-black gradient-text">zupwell</span>
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block rounded-xl px-4 py-3 text-lg font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-all"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Cart Badge on Mobile */}
            {snap.token && snap.cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 rounded-xl border border-pink-500/20 bg-pink-500/5 p-4"
              >
                <p className="text-sm text-white/60">
                  Cart has <span className="font-bold text-pink-400">{snap.cart.length}</span> items
                </p>
              </motion.div>
            )}

            {/* Bottom CTA for guests */}
            {!snap.token && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-12"
              >
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block w-full rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 py-3 text-center font-bold text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                >
                  Get Started
                </Link>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

