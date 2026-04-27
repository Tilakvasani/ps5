"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, HeartPulse, User, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function Navbar() {
  const { user, cart, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // BUG FIX: close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push("/");
  };

  return (
    <nav
      className="fixed top-0 z-50 w-full backdrop-blur-xl"
      style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #D9DEE8" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span
            className="text-2xl font-display font-black inline-flex items-start gap-0"
            style={{
              background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Zupwell
            <sup
              style={{
                fontSize: "0.45em",
                fontWeight: 700,
                lineHeight: 1,
                marginTop: "2px",
                letterSpacing: 0,
                background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >™</sup>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Products", "/products"],
            ["Electrolytes", "/products?category=electrolytes"],
            ["Vitamins", "/products?category=vitamins"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-[#6B7280] hover:text-[#F47C41] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-[#6B7280] hover:text-[#F47C41] transition-colors">
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: "#F47C41" }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setUserDropOpen(!userDropOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all hover:bg-[#F4F6FA]"
                style={{ border: "1.5px solid #D9DEE8", color: "#111827" }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #F47C41, #0B2C6F)" }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden md:inline text-[#374151]">{user.name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {userDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-lg"
                    style={{ background: "#FFFFFF", border: "1px solid #D9DEE8" }}
                  >
                    <Link href="/account" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#374151] hover:bg-[#F4F6FA] hover:text-[#F47C41] transition-all">
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#374151] hover:bg-[#F4F6FA] hover:text-[#F47C41] transition-all">
                      <HeartPulse size={14} /> My Orders
                    </Link>
                    <div className="h-px bg-[#D9DEE8]" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-all">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="btn-outline text-sm px-4 py-2">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </div>
          )}

          <button
            className="md:hidden text-[#6B7280] hover:text-[#0B2C6F] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "#FFFFFF", borderTop: "1px solid #D9DEE8" }}
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              <Link href="/products" className="text-sm py-2 text-[#374151] hover:text-[#F47C41] transition-colors" onClick={() => setMenuOpen(false)}>Products</Link>
              <Link href="/products?category=electrolytes" className="text-sm py-2 text-[#374151] hover:text-[#F47C41] transition-colors" onClick={() => setMenuOpen(false)}>Electrolytes</Link>
              <Link href="/cart" className="text-sm py-2 text-[#374151] hover:text-[#F47C41] transition-colors" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
              {user ? (
                <>
                  <Link href="/account" className="text-sm py-2 text-[#374151] hover:text-[#F47C41] transition-colors" onClick={() => setMenuOpen(false)}>Account</Link>
                  <button onClick={handleLogout} className="text-red-500 text-sm text-left py-2">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline text-sm text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link href="/register" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
