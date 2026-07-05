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
    ["SHOP ALL",    "/products"],
    ["SCIENCE",     "/science"],
    ["ABOUT",       "/about"],
    ["FAQs",        "/faqs"],
    ["CONTACT",     "/contact"],
  ];

  return (
    <nav className="fixed top-0 z-50 w-full">
      {/* ── Announcement Bar ── */}
      <div
        style={{
          background: "#FFB800",
          color: "#051124",
          fontSize: "12px",
          fontWeight: 700,
          padding: "6px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            background: "#FF5C00",
            color: "#FFF",
            fontSize: "9px",
            fontWeight: 900,
            padding: "2px 8px",
            borderRadius: "30px",
            letterSpacing: "0.8px",
            marginRight: 10,
          }}
        >
          OFFER
        </span>
        <span style={{ flex: 1, textAlign: "center" }}>
          🔥 FREE SHIPPING on orders above ₹499 — Limited time!
        </span>
        <Link
          href="/products"
          style={{
            color: "#051124",
            fontWeight: 800,
            fontSize: "11px",
            textDecoration: "underline",
            whiteSpace: "nowrap",
          }}
        >
          SHOP BUNDLES NOW →
        </Link>
      </div>

      {/* ── Main Nav ── */}
      <div
        style={{
          background: "#051124",
          borderBottom: "1.5px solid #1E2D4A",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            zupwell<span style={{ color: "var(--or)" }}>•</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8F9CAE",
                  letterSpacing: "0.5px",
                  transition: "color 0.15s",
                  textDecoration: "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8F9CAE")}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Search icon */}
            <button
              className="hidden md:flex p-2 transition-colors"
              style={{ color: "#8F9CAE" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8F9CAE")}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 transition-colors"
              style={{ color: "#8F9CAE" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#8F9CAE"}
            >
              <ShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                    style={{
                      background: "var(--or)",
                      boxShadow: "0 0 8px rgba(255,92,0,0.45)",
                    }}
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
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  style={{
                    border: "1.5px solid #1E2D4A",
                    color: "#FFFFFF",
                    background: "#0C1E3E",
                  }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: "var(--or)" }}
                  >
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline" style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700 }}>
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {userDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-48 overflow-hidden"
                      style={{
                        background: "#0C1E3E",
                        border: "1.5px solid #1E2D4A",
                        borderRadius: "10px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                      }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1E2D4A")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <User size={14} style={{ color: "#8F9CAE" }} /> My Account
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1E2D4A")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <HeartPulse size={14} style={{ color: "#8F9CAE" }} /> My Orders
                      </Link>
                      <div style={{ height: "1px", background: "#1E2D4A" }} />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#FF5C00", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1E2D4A")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Link
                  href="/login"
                  className="zbtn-or"
                  style={{ borderRadius: "30px", fontSize: "11px", padding: "8px 18px", boxShadow: "0 0 12px rgba(255,92,0,0.3)" }}
                >
                  SIGN IN
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden transition-colors p-1"
              style={{ color: "#8F9CAE" }}
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
              style={{ background: "#051124", borderTop: "1.5px solid #1E2D4A" }}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="py-3 font-bold border-b transition-colors"
                    style={{
                      color: "#8F9CAE",
                      borderColor: "#1E2D4A",
                      fontSize: "11px",
                      letterSpacing: "0.5px",
                      textDecoration: "none",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  className="py-3 font-bold border-b"
                  style={{ color: "#8F9CAE", borderColor: "#1E2D4A", fontSize: "11px" }}
                  onClick={() => setMenuOpen(false)}
                >
                  CART ({cartCount})
                </Link>
                {user ? (
                  <>
                    <Link href="/account" className="py-2 font-bold" style={{ color: "#8F9CAE", fontSize: "11px" }} onClick={() => setMenuOpen(false)}>ACCOUNT</Link>
                    <button onClick={handleLogout} className="text-left py-2 font-bold" style={{ color: "var(--or)", fontSize: "11px" }}>SIGN OUT</button>
                  </>
                ) : (
                  <div className="flex flex-col pt-3">
                    <Link
                      href="/login"
                      className="zbtn-or text-center"
                      style={{ borderRadius: "30px", justifyContent: "center" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      SIGN IN
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
