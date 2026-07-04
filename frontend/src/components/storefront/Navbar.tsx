"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Menu, X, User, LogOut, Package, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLogout } from "@/lib/useAuth";

export default function Navbar() {
  const { user, cart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const handleLogout = useLogout();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setUserDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV_LINKS = [
    ["SHOP ALL",      "/products"],
    ["ELECTROLYTES",  "/products?cat=electrolytes"],
    ["BUNDLES",       "/products?cat=bundles"],
    ["ABOUT ZUPWELL", "/about"],
    ["SCIENCE",       "/science"],
    ["FAQS",          "/faqs"],
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div style={{ background: "#FFB800", borderBottom: "1px solid #1E2D4A", padding: "9px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "#FF5C00", color: "#FFF", fontSize: "8px", fontWeight: 950, padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.5px" }}>NEW</span>
          <span style={{ color: "#051124", fontSize: "10px", fontWeight: 900, letterSpacing: "0.3px" }}>
            FREE SHIPPING ON ALL ORDERS ABOVE ₹499 — PAN INDIA
          </span>
        </div>
        <Link href="/products" style={{ color: "#051124", fontSize: "10px", fontWeight: 900, letterSpacing: "0.5px", textDecoration: "underline" }}>
          SHOP NOW →
        </Link>
      </div>

      {/* Main Nav */}
      <nav style={{ background: "#051124", position: "sticky", top: 0, zIndex: 50, borderBottom: "1.5px solid #1E2D4A" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-1.5px", color: "#FFF", textDecoration: "none", display: "flex", alignItems: "center" }}>
            zupwell<span style={{ color: "var(--or)" }}>•</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ gap: "24px" }}>
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} href={href}
                style={{ fontSize: "11px", fontWeight: 700, color: "#8F9CAE", letterSpacing: "0.8px", textDecoration: "none", transition: "color 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8F9CAE")}
              >{label}</Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Search Icon */}
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#8F9CAE", display: "flex", alignItems: "center", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8F9CAE")}>
              <Search size={18} />
            </button>

            {/* Cart Icon */}
            <Link href="/cart" style={{ position: "relative", color: "#8F9CAE", textDecoration: "none", display: "flex", alignItems: "center" }}>
              <ShoppingCart size={18} color="#8F9CAE" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ position: "absolute", top: "-8px", right: "-8px", background: "var(--or)", color: "#FFF", borderRadius: "50%", width: "16px", height: "16px", fontSize: "9px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px var(--or)" }}>
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {user ? (
              <div style={{ position: "relative" }} ref={dropRef}>
                <button onClick={() => setUserDropOpen(!userDropOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0C1E3E", border: "1.5px solid #1E2D4A", borderRadius: "30px", padding: "5px 12px 5px 6px", cursor: "pointer" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--or)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#8F9CAE" }} className="hidden md:inline">
                    {user.name.split(" ")[0].toUpperCase()}
                  </span>
                </button>
                <AnimatePresence>
                  {userDropOpen && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.12 }}
                      style={{ position: "absolute", right: 0, top: "44px", width: "180px", background: "#0C1E3E", border: "1.5px solid #1E2D4A", borderRadius: "10px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
                      <Link href="/account" onClick={() => setUserDropOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", fontSize: "11px", fontWeight: 700, color: "#8F9CAE", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#1E2D4A"; e.currentTarget.style.color = "#FFF"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9CAE"; }}>
                        <User size={13} /> MY ACCOUNT
                      </Link>
                      <Link href="/account?tab=orders" onClick={() => setUserDropOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", fontSize: "11px", fontWeight: 700, color: "#8F9CAE", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#1E2D4A"; e.currentTarget.style.color = "#FFF"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8F9CAE"; }}>
                        <Package size={13} /> MY ORDERS
                      </Link>
                      <div style={{ height: "1px", background: "#1E2D4A" }} />
                      <button onClick={handleLogout}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", fontSize: "11px", fontWeight: 700, color: "var(--or)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1E2D4A")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <LogOut size={13} /> SIGN OUT
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="hidden md:inline-flex zbtn-or" style={{ padding: "8px 18px", fontSize: "11px", borderRadius: "30px", boxShadow: "0 0 10px rgba(255, 92, 0, 0.2)" }}>
                SIGN IN
              </Link>
            )}

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8F9CAE" }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ background: "#051124", borderTop: "1px solid #1E2D4A", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "2px" }}>
                {NAV_LINKS.map(([label, href]) => (
                  <Link key={label} href={href} onClick={() => setMenuOpen(false)}
                    style={{ padding: "11px 0", fontSize: "12px", fontWeight: 800, color: "#8F9CAE", borderBottom: "1px solid #1E2D4A", letterSpacing: "0.8px", textDecoration: "none" }}>
                    {label}
                  </Link>
                ))}
                <Link href="/cart" onClick={() => setMenuOpen(false)}
                  style={{ padding: "11px 0", fontSize: "12px", fontWeight: 800, color: "#8F9CAE", borderBottom: "1px solid #1E2D4A", letterSpacing: "0.8px", textDecoration: "none" }}>
                  CART {cartCount > 0 && `(${cartCount})`}
                </Link>
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMenuOpen(false)} style={{ padding: "11px 0", fontSize: "12px", fontWeight: 800, color: "#8F9CAE", textDecoration: "none" }}>ACCOUNT</Link>
                    <button onClick={handleLogout} style={{ padding: "11px 0", fontSize: "12px", fontWeight: 800, color: "var(--or)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", letterSpacing: "0.8px" }}>SIGN OUT</button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="zbtn-or" style={{ marginTop: "10px", justifyContent: "center", padding: "12px", borderRadius: "30px" }}>SIGN IN</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
