"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Package, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLogout } from "@/lib/useAuth";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

// ── HeadlessCheckout type (from Shiprocket docs) ──────────────────────────────
declare global {
  interface Window {
    HeadlessCheckout?: {
      buyNow: (
        event     : MouseEvent,
        token     : string,
        options   : { amount: number; themecolor: string; image?: string },
        callback  : (response: SRPopupResponse) => void
      ) => void;
    };
  }
}

interface SRPopupResponse {
  status: "success" | "failure" | "cancelled";
  result?: {
    authorised_customer_token: string;
    expires_at               : string;
  };
  data?: {
    phone              : string;
    country_code       : string;
    user_address_consent: boolean;
    fastrr_cart_id     : string;
    addresses          : SRRawAddress[];
  };
}

interface SRRawAddress {
  phone      : string;
  line1      : string;
  line2      : string;
  city       : string;
  pincode    : string;
  state      : string;
  country    : string;
  country_code: string;
  landmark   : string | null;
  first_name : string;
  last_name  : string;
  email      : string;
  is_new     : boolean;
  address_id : string;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { cart, user, setUser, setToken, setSRAddresses } = useStore();
  const pathname = usePathname();
  const router   = useRouter();
  const logout   = useLogout();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenu] = useState(false);
  const [categoriesOpen, setCatOpen]= useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [scrolled, setScrolled]     = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const API_URL   = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenu(false);
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    import("@/lib/api").then(({ productsApi }) =>
      productsApi.categories().then(setCategories).catch(() => {})
    );
  }, []);

  // ── After Shiprocket popup succeeds ──────────────────────────────────────────
  const handlePopupSuccess = async (response: SRPopupResponse) => {
    if (response.status !== "success" || !response.result?.authorised_customer_token) {
      toast.error("Login cancelled or failed. Please try again.");
      setLoginLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/sr-buyer-login`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          authorisedToken: response.result.authorised_customer_token,
          phone          : response.data?.phone,
          addresses      : response.data?.addresses || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setUser(data.user);
      setToken(data.accessToken);
      setAuthCookie(data.accessToken);
      if (data.srAddresses?.length) setSRAddresses(data.srAddresses);

      toast.success(`Welcome, ${data.user.name || "there"}! 🎉`);

      // Redirect to ?next= if present, otherwise stay on page
      const next = new URLSearchParams(window.location.search).get("next");
      if (next) router.push(next);
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Main login button click → get token → show Shiprocket popup ─────────────
  const handleLoginClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (user) { router.push("/account"); return; }

    setLoginLoading(true);

    try {
      // Step 1: Get a fresh popup token from our backend
      const tokenRes = await fetch(`${API_URL}/api/auth/sr-get-token`);
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) throw new Error(tokenData.error || "Could not initialise login");

      // Step 2: Check SDK is loaded
      if (!window.HeadlessCheckout?.buyNow) {
        throw new Error("Login service not ready. Please refresh the page.");
      }

      // Step 3: Open the official Shiprocket popup
      // Amount = 0 for login-only (no cart), themecolor = brand colour without #
      window.HeadlessCheckout.buyNow(
        e.nativeEvent,          // the raw MouseEvent (required by SDK)
        tokenData.token,        // from our backend → Shiprocket
        {
          amount    : 0,        // 0 = login/address-only flow, no payment
          themecolor: "FF5C00", // Zupwell orange without #
          image     : "https://zupwell.com/zupwell-logo.png",
        },
        handlePopupSuccess
      );
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
      setLoginLoading(false);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      style={{
        background    : scrolled ? "rgba(12,30,57,0.97)" : "rgba(12,30,57,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom  : scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        boxShadow     : scrolled ? "0 4px 24px rgba(0,0,0,0.18)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-3xl font-black text-white" style={{ letterSpacing: "-1.5px", fontWeight: 900 }}>
              Zupwell<sup style={{ fontSize: "10px", fontWeight: 700, marginLeft: "2px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            <Link href="/products" className={`nav-link ${isActive("/products") ? "text-white" : "text-white/70 hover:text-white"}`}>
              Shop All
            </Link>

            <div className="relative">
              <button
                onClick={() => setCatOpen(!categoriesOpen)}
                className="nav-link flex items-center gap-1 text-white/70 hover:text-white"
              >
                Categories
                <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#FF5C00] transition-colors"
                      onClick={() => setCatOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/track-order" className={`nav-link ${isActive("/track-order") ? "text-white" : "text-white/70 hover:text-white"}`}>
              Track Order
            </Link>
          </nav>

          {/* Right: cart + login */}
          <div className="flex items-center gap-2" ref={dropdownRef}>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-white/80 hover:text-white transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#FF5C00] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Logged in → user dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#FF5C00] flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.phone ? `+91 ${user.phone}` : user.email}
                      </p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <User size={14} /> My Account
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Package size={14} /> My Orders
                    </Link>
                    <button
                      onClick={() => { setUserMenu(false); logout(); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged in: triggers Shiprocket popup ─────────────────── */
              <button
                onClick={handleLoginClick}
                disabled={loginLoading}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#FF5C00] hover:bg-[#E04B00] disabled:opacity-70 px-3 py-1.5 rounded-xl transition-all"
              >
                {loginLoading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <User size={15} />
                )}
                {loginLoading ? "Loading..." : "Login"}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/80 hover:text-white p-2">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            <Link href="/products"    onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white">Shop All</Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white">Track Order</Link>
            {!user && (
              <button
                onClick={(e) => { setMenuOpen(false); handleLoginClick(e as any); }}
                className="block w-full text-left px-3 py-2 text-sm font-bold text-[#FF5C00]"
              >
                Login
              </button>
            )}
            {user && (
              <>
                <Link href="/account"            onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white">My Account</Link>
                <Link href="/account?tab=orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white">My Orders</Link>
                <button onClick={() => { setMenuOpen(false); logout(); }} className="block w-full text-left px-3 py-2 text-sm text-red-400">Sign Out</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
