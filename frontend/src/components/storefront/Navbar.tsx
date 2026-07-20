"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, HeartPulse, User, LogOut, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLogout } from "@/lib/useAuth";
import { productsApi } from "@/lib/api";
import { cldOptimize } from "@/lib/utils";
import { useSettings } from "@/lib/useSettings";

export default function Navbar() {
  const pathname = usePathname();
  const { user, cart } = useStore();
  const { cgstRate, sgstRate } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      productsApi
        .list({ search: searchQuery, page: 1, perPage: 8 })
        .then((data) => {
          setSearchResults(data?.products || []);
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [showSearch]);

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
    ["SHOP",        "/products"],
    ["SCIENCE",     "/science"],
    ["ABOUT",       "/about"],
    ["TRACK ORDER", "/track-order"],
    ["FAQs",        "/faqs"],
    ["CONTACT",     "/contact"],
  ];

  return (
    <nav className="fixed top-0 z-50 w-full">
      {/* ── Main Nav ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1.5px solid #EAEAEA",
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
              color: "#0C1E39",
              textDecoration: "none",
            }}
          >
            Zupwell<sup style={{ fontSize: "10px", fontWeight: 700, color: "#FF5C00", marginLeft: "2.5px", letterSpacing: "1px", verticalAlign: "super" }}>TM</sup>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(([label, href]) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isActive ? "#FF5C00" : "#0C1E39",
                    letterSpacing: "0.5px",
                    transition: "color 0.15s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#FF5C00")}
                  onMouseLeave={e => (e.currentTarget.style.color = isActive ? "#FF5C00" : "#0C1E39")}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Search icon */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden md:flex p-2 transition-colors"
              style={{ color: "#0C1E39" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FF5C00")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0C1E39")}
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 transition-colors"
              style={{ color: "#0C1E39" }}
              aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#FF5C00"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#0C1E39"}
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
                    border: "1.5px solid #EAEAEA",
                    color: "#0C1E39",
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: "var(--or)" }}
                  >
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline" style={{ color: "#0C1E39", fontSize: "12px", fontWeight: 700 }}>
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
                        background: "#FFFFFF",
                        border: "1.5px solid #EAEAEA",
                        borderRadius: "16px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                      }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#0C1E39", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <User size={14} style={{ color: "#6B7280" }} /> My Account
                      </Link>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setUserDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#0C1E39", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <HeartPulse size={14} style={{ color: "#6B7280" }} /> My Orders
                      </Link>
                      <div style={{ height: "1px", background: "#EAEAEA" }} />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: "#FF5C00", fontSize: "12px", fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
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
                  style={{ borderRadius: "30px", fontSize: "11px", padding: "8px 18px" }}
                >
                  SIGN IN
                </Link>
              </div>
            )}

            {/* Mobile search */}
            <button
              className="md:hidden p-1 transition-colors"
              style={{ color: "#0C1E39" }}
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden transition-colors p-1"
              style={{ color: "#0C1E39" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
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
              style={{ background: "#FFFFFF", borderTop: "1.5px solid #EAEAEA" }}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="py-3 font-bold border-b transition-colors"
                    style={{
                      color: "#0C1E39",
                      borderColor: "#EAEAEA",
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
                  style={{ color: "#0C1E39", borderColor: "#EAEAEA", fontSize: "11px" }}
                  onClick={() => setMenuOpen(false)}
                >
                  CART ({cartCount})
                </Link>
                {user ? (
                  <>
                    <Link href="/account" className="py-2 font-bold" style={{ color: "#0C1E39", fontSize: "11px" }} onClick={() => setMenuOpen(false)}>ACCOUNT</Link>
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
        {/* Search Modal Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col pt-24 px-6 md:px-12 pb-6"
              style={{ background: "rgba(248, 248, 248, 0.98)", backdropFilter: "blur(8px)" }}
            >
              <div className="mx-auto w-full max-w-2xl flex flex-col h-full">
                {/* Search Bar Input Row */}
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "#EAEAEA" }}>
                  <Search size={22} className="text-orange-500 shrink-0" style={{ color: "var(--or)" }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for product (e.g. Electrolytes)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold border-none outline-none text-[#0C1E39] placeholder-gray-400"
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-500 hover:text-[#0C1E39]"
                    aria-label="Close search"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Results Container */}
                <div className="flex-1 overflow-y-auto mt-6 pr-2 custom-scrollbar">
                  {searchQuery.trim() === "" ? (
                    <div className="text-center py-12 text-sm text-gray-500">
                      Type name of the product above to search.
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No products found matching &quot;{searchQuery}&quot;.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((product) => {
                        const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
                        const finalPrice = Math.round(Number(product.sellingPrice) * (1 + cgstRate + sgstRate));
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center gap-4 p-3 rounded-2xl border transition-all hover:bg-black/5"
                            style={{ borderColor: "#EAEAEA", background: "#FFFFFF" }}
                          >
                            {primaryImage ? (
                              <img
                                src={cldOptimize(primaryImage, 112)}
                                alt={product.name}
                                width={112}
                                height={112}
                                loading="lazy"
                                decoding="async"
                                className="h-14 w-14 rounded-xl object-cover bg-black/5"
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-black/5 text-gray-500">
                                💊
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-[#0C1E39]">{product.name}</h4>
                              <p className="text-xs text-orange-500 mt-0.5" style={{ color: "var(--or)" }}>
                                ₹{finalPrice} <span className="text-gray-400 text-[10px] ml-1">includes all taxes</span>
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#0C1E39] px-3 py-1 rounded-lg border border-gray-300">
                              VIEW
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
