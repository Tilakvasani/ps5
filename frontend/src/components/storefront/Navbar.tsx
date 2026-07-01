"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, HeartPulse, User, LogOut, Search } from "lucide-react";
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
    ["SHOP ALL",         "/products"],
    ["ELECTROLYTES",     "/products"],
    ["BUNDLES",          "/products"],
    ["ABOUT ZUPWELL",    "/about"],
    ["SCIENCE",          "/science"],
    ["FAQS",             "/faqs"],
  ];

  return (
    <nav
      className="fixed top-0 z-50 w-full"
      style={{
        background: "#FFFFFF",
        borderBottom: "1.5px solid #E8E2D9",
      }}
    >
      {/* Top Banner */}
      <div className="w-full bg-[#001c54] text-white py-2 px-6 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="bg-[#EB9220] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md leading-none">NEW</span>
        <span className="flex items-center gap-1 text-[11px] tracking-wide">
          ⚡ Instant Hydration Effervescent Electrolyte Tablets | Free Express Shipping across India over ₹499
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Logo — lowercase with orange dot */}
        <Link href="/" className="text-3xl font-black flex items-center tracking-tight font-sans" style={{ color: "#001c54", letterSpacing: "-0.06em" }}>
          zupwell<span className="text-[#EB9220] font-black text-4xl leading-none -ml-0.5">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-bold uppercase tracking-wider transition-colors duration-150 text-[#45353E] hover:text-[#001c54]"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
 
          {/* Search */}
          <Link href="/products" className="p-2 transition-colors duration-150 text-[#45353E] hover:text-[#001c54]">
            <Search size={20} />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 transition-colors duration-150 text-[#45353E] hover:text-[#001c54]"
          >
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: "#EB9220" }}
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
                style={{ border: "1.5px solid #E8E2D9", color: "#001c54", background: "#FFFFFF" }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "#001c54" }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden md:inline" style={{ color: "#001c54" }}>{user.name.split(" ")[0]}</span>
              </button>
              <AnimatePresence>
                {userDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden"
                    style={{ background: "#FFFFFF", border: "1.5px solid #E8E2D9" }}
                  >
                    <Link href="/account" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 text-[#001c54] hover:bg-[#FCFAF6]"
                    >
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 text-[#001c54] hover:bg-[#FCFAF6]"
                    >
                      <HeartPulse size={14} /> My Orders
                    </Link>
                    <div style={{ height: "1.5px", background: "#E8E2D9" }} />
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
              <Link href="/login" className="btn-primary text-xs uppercase tracking-wider px-5 py-2 !rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all">Sign In</Link>
            </div>
          )}

          <button
            className="md:hidden transition-colors duration-150"
            style={{ color: "#45353E" }}
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
            style={{ background: "#FFFFFF", borderTop: "1.5px solid #E8E2D9" }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(([label, href]) => (
                <Link key={label} href={href}
                  className="text-sm py-2.5 font-medium border-b transition-colors duration-150"
                  style={{ color: "#45353E", borderColor: "#FCFAF6" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link href="/cart" className="text-sm py-2.5 font-medium transition-colors duration-150"
                style={{ color: "#45353E" }}
                onClick={() => setMenuOpen(false)}
              >
                Cart ({cartCount})
              </Link>
              {user ? (
                <>
                  <Link href="/account" className="text-sm py-2 transition-colors" style={{ color: "#45353E" }} onClick={() => setMenuOpen(false)}>Account</Link>
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
