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
    <div className="flex h-screen bg-[#FCFAF6] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-[#E8E2D9] bg-white  flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-1 px-5 py-5 border-b border-[#E8E2D9]">
          <span className="text-xl font-black" style={{ background: "#48C062", }}>
            Zupwell<sup style={{ fontSize: "0.55em", fontWeight: 700, color: "#48C062", marginLeft: "2px", verticalAlign: "super" }}>™</sup>
          </span>
          <span className="ml-auto text-xs text-[#45353E] border border-[#E8E2D9] rounded px-1.5 py-0.5">Admin</span>
          <button className="lg:hidden text-[#45353E] hover:text-[#002A30] ml-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group ${
                  active ? "bg-[#48C062]/20 text-[#48C062]" : "text-[#45353E] hover:text-[#002A30] hover:bg-[#FCFAF6]"}`}>
                <item.icon size={16} className={active ? "text-[#48C062]" : "text-[#45353E] group-hover:text-[#002A30]"} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin user */}
        <div className="border-t border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-[#FCFAF6] flex items-center justify-center text-sm font-black text-black">
              {adminName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#002A30] truncate">{adminName}</p>
              <p className="text-xs text-[#45353E]">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-[#E8E2D9] bg-white  px-6 py-3 flex-shrink-0">
          <button className="lg:hidden text-[#45353E] hover:text-[#002A30]" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-xs text-[#45353E] hover:text-[#002A30] transition-colors border border-[#E8E2D9] rounded-lg px-3 py-1.5">
            View Store ↗
          </Link>
          <Link href="/admin/notifications">
            <div className="relative p-2 text-[#45353E] hover:text-[#002A30] cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#48C062]" />
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
