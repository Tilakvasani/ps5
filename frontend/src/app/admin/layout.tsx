"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Tag, Boxes, ShoppingBag, FileText,
  Users, Ticket, Star, Settings, Bell, LogOut, Menu, X, Package2, ChevronRight
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

  const handleLogout = () => {
    localStorage.removeItem("zupwell-admin");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-white/10 bg-black/80 backdrop-blur-xl flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
            <Package2 size={16} className="text-black" />
          </div>
          <span className="text-lg font-display font-black gradient-text">Zupwell</span>
          <span className="ml-auto text-xs text-white/20 border border-white/10 rounded px-1.5 py-0.5">Admin</span>
          <button className="lg:hidden text-white/40 hover:text-white ml-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group ${
                  active ? "bg-pink-500/20 text-pink-400" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <item.icon size={16} className={active ? "text-pink-400" : "text-white/30 group-hover:text-white"} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin user */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center text-sm font-black text-black">
              {adminName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{adminName}</p>
              <p className="text-xs text-white/30">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-white/10 bg-black/40 backdrop-blur-sm px-6 py-3 flex-shrink-0">
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-xs text-white/30 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            View Store ↗
          </Link>
          <Link href="/admin/notifications">
            <div className="relative p-2 text-white/40 hover:text-white cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500" />
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
