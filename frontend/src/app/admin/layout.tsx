"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminLogout } from "@/lib/useAuth";
import {
  LayoutDashboard, Package, Tag, Boxes, ShoppingBag, FileText,
  Users, Ticket, Star, Settings, Bell, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { label: "Dashboard",    href: "/admin",                icon: LayoutDashboard },
  { label: "Products",     href: "/admin/products",       icon: Package },
  { label: "Categories",   href: "/admin/categories",     icon: Tag },
  { label: "Inventory",    href: "/admin/inventory",      icon: Boxes },
  { label: "Orders",       href: "/admin/orders",         icon: ShoppingBag },
  { label: "Invoices",     href: "/admin/invoices",       icon: FileText },
  { label: "Users",        href: "/admin/users",          icon: Users },
  { label: "Coupons",      href: "/admin/coupons",        icon: Ticket },
  { label: "Reviews",      href: "/admin/reviews",        icon: Star },
  { label: "Notifications",href: "/admin/notifications",  icon: Bell },
  { label: "Settings",     href: "/admin/settings",       icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const raw = localStorage.getItem("zupwell-admin");
    if (!raw && !pathname.includes("/admin/login")) {
      router.push("/admin/login");
    } else if (raw) {
      const data = JSON.parse(raw);
      setAdminName(data?.name || "Admin");
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = useAdminLogout();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--gy)" }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(5,17,36,0.7)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex-shrink-0 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "#0C1E39", borderRight: "1.5px solid #0C1E39" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1.5px solid #0C1E39" }}>
          <span style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-1.5px", color: "#FFFFFF" }}>
            zupwell<sup style={{ fontSize: "10px", fontWeight: 700, color: "var(--or)", marginLeft: "2px", verticalAlign: "super" }}>TM</sup>
          </span>
          <span
            className="ml-auto text-xs rounded px-1.5 py-0.5"
            style={{ color: "#F8F8F8", border: "1px solid #0C1E39", fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}
          >
            ADMIN
          </span>
          <button className="lg:hidden ml-1" style={{ color: "#F8F8F8" }} onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`zslink ${active ? "active" : ""}`}
                style={active ? { background: "rgba(255,92,0,0.12)", color: "var(--or)" } : {}}
              >
                <item.icon size={14} style={{ color: active ? "var(--or)" : "#F8F8F8" }} />
                {item.label}
                {active && <ChevronRight size={10} className="ml-auto" style={{ color: "var(--or)" }} />}
              </Link>
            );
          })}
        </nav>

        {/* Admin user */}
        <div style={{ borderTop: "1.5px solid #0C1E39", padding: "12px" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ background: "rgba(255,92,0,0.2)", color: "var(--or)" }}
            >
              {adminName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>{adminName}</p>
              <p style={{ fontSize: "10px", color: "#F8F8F8" }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
            style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0C1E39")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ background: "#FFFFFF", borderBottom: "1.5px solid rgba(12, 30, 57, 0.08)" }}
        >
          <button className="lg:hidden" style={{ color: "#0C1E39" }} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            target="_blank"
            className="transition-colors rounded-lg px-3 py-1.5"
            style={{ fontSize: "11px", fontWeight: 700, color: "#0C1E39", border: "1px solid rgba(12, 30, 57, 0.15)" }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--or)";
              e.currentTarget.style.borderColor = "var(--or)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "#0C1E39";
              e.currentTarget.style.borderColor = "rgba(12, 30, 57, 0.15)";
            }}
          >
            View Store ↗
          </Link>
          <Link href="/admin/notifications">
            <div className="relative p-2 cursor-pointer" style={{ color: "#0C1E39" }}>
              <Bell size={17} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: "var(--or)" }} />
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--gy)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
