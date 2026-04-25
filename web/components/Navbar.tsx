"use client";

import Link from "next/link";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { MobileMenu } from "@/components/MobileMenu";

export function Navbar() {
  const snap = useSnapshot(store);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black gradient-text">
            zupwell
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-white/60 hover:text-white transition">
              Products
            </Link>
            
            {snap.token ? (
              <>
                <Link href="/dashboard" className="text-white/60 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/checkout">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <span className="text-white/60 hover:text-white">Cart</span>
                    <AnimatePresence>
                      {snap.cart.length > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-3 h-5 w-5 rounded-full bg-pink-500 text-xs font-bold text-white flex items-center justify-center"
                        >
                          {snap.cart.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/60 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2 font-semibold text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
