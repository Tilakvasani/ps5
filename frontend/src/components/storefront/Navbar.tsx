"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, HeartPulse, User, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLogout } from "@/lib/useAuth";

export default function Navbar() {
  const { user, cart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setUserDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = useLogout();

  const NAV_LINKS = [
    ["Home",             "/"],
    ["Shop",             "/products"],
    ["Science",          "/science"],
    ["About Us",         "/about"],
    ["FAQs",             "/faqs"],
    ["Contact",          "/contact"],
  ];

  return (
    <nav
      className="fixed top-0 z-50 w-full"
      style={{
        background: "#FFFFFF",
        borderBottom: "1.5px solid #C8DCEA",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Logo — flat, no gradient */}
        <Link href="/" className="flex items-center gap-0.5">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#1D3557", letterSpacing: "-0.04em" }}
          >
            Zupwell
          </span>
          <sup style={{ fontSize: "0.5em", fontWeight: 700, color: "#45B08C", lineHeight: 1, marginTop: "4px" }}>™</sup>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium transition-colors duration-150 text-[#4A6A82] hover:text-[#1D3557]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Cart */}
          <Link href="/cart" className="relative p-2 transition-colors duration-150 text-[#4A6A82] hover:text-[#1D3557]"
          >
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: "#45B08C" }}
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
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150"
                style={{ border: "1.5px solid #C8DCEA", color: "#1D3557", background: "#FFFFFF" }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "#1D3557" }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden md:inline" style={{ color: "#1D3557" }}>{user.name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {userDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden"
                    style={{ background: "#FFFFFF", border: "1.5px solid #C8DCEA" }}
                  >
                    <Link href="/account" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 text-[#1D3557] hover:bg-[#F1FAFF]"
                    >
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 text-[#1D3557] hover:bg-[#F1FAFF]"
                    >
                      <HeartPulse size={14} /> My Orders
                    </Link>
                    <div style={{ height: "1.5px", background: "#C8DCEA" }} />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition-colors duration-150"

                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center">
              <Link href="/login" className="btn-outline text-sm px-4 py-2">Sign In</Link>
            </div>
          )}

          <button
            className="md:hidden transition-colors duration-150"
            style={{ color: "#4A6A82" }}
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
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ background: "#FFFFFF", borderTop: "1.5px solid #C8DCEA" }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(([label, href]) => (
                <Link key={label} href={href}
                  className="text-sm py-2.5 font-medium border-b transition-colors duration-150"
                  style={{ color: "#4A6A82", borderColor: "#F1FAFF" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link href="/cart" className="text-sm py-2.5 font-medium transition-colors duration-150"
                style={{ color: "#4A6A82" }}
                onClick={() => setMenuOpen(false)}
              >
                Cart ({cartCount})
              </Link>
              {user ? (
                <>
                  <Link href="/account" className="text-sm py-2 transition-colors" style={{ color: "#4A6A82" }} onClick={() => setMenuOpen(false)}>Account</Link>
                  <button onClick={handleLogout} className="text-red-500 text-sm text-left py-2">Sign Out</button>
                </>
              ) : (
                <div className="flex flex-col pt-2">
                  <Link href="/login" className="btn-outline text-sm text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
