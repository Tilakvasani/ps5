"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, Package, User, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function Navbar() {
  const { user, cart, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const router = useRouter();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push("/");
  };

  return (
    <nav
      className="fixed top-0 z-50 w-full backdrop-blur-xl"
      style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #D9DEE8" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #F47C41, #0B2C6F)" }}
          >
            <Package size={18} className="text-[#111827]" />
          </div>
          <span className="text-xl font-display font-black" style={{ color: "#111827" }}>
            Zup<span style={{ color: "#F47C41" }}>well</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Products", "/products"],
            ["BOPP Tape", "/products?category=bopp-tape"],
            ["Packaging", "/products?category=packaging"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F47C41")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 transition-colors" style={{ color: "#6B7280" }}>
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-bold text-[#111827] flex items-center justify-center"
                  style={{ background: "#F47C41", boxShadow: "0 0 10px rgba(244,124,65,0.6)" }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropOpen(!userDropOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all"
                style={{
                  border: "1.5px solid rgba(11,44,111,0.08)",
                  background: "rgba(11,44,111,0.03)",
                  color: "#111827",
                }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#111827]"
                  style={{ background: "linear-gradient(135deg, #F47C41, #0B2C6F)" }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {userDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-12 w-48 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#FFFFFF", border: "1px solid #D9DEE8" }}
                  >
                    <Link href="/account" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                      style={{ color: "#374151" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,124,65,0.1)"; e.currentTarget.style.color = "#F47C41"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}
                    >
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-all"
                      style={{ color: "#374151" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,124,65,0.1)"; e.currentTarget.style.color = "#F47C41"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}
                    >
                      <Package size={14} /> My Orders
                    </Link>
                    <div style={{ borderTop: "1px solid rgba(11,44,111,0.06)" }} />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all">
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
            className="md:hidden transition-colors"
            style={{ color: "#6B7280" }}
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
              <Link href="/products" className="text-sm py-2 transition-colors" style={{ color: "#374151" }} onClick={() => setMenuOpen(false)}>Products</Link>
              <Link href="/cart" className="text-sm py-2 transition-colors" style={{ color: "#374151" }} onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
              {user ? (
                <>
                  <Link href="/account" className="text-sm py-2" style={{ color: "#374151" }} onClick={() => setMenuOpen(false)}>Account</Link>
                  <button onClick={handleLogout} className="text-red-400 text-sm text-left py-2">Sign Out</button>
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