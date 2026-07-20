"use client";
import { useEffect, useState } from "react";
import { notFound, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, FolderTree, Boxes, ShoppingBag, FileText,
  Users, Tag, Star, Settings, Bell, LogOut, Menu, X,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { getAdminToken, useAdminLogout } from "@/lib/useAuth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok">("checking");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const logout = useAdminLogout();

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getAdminToken();
      if (!token) {
        notFound();
        return;
      }
      try {
        await adminApi.me();
        if (!cancelled) setStatus("ok");
      } catch {
        // Invalid/expired token — treat exactly like the page doesn't exist.
        if (!cancelled) notFound();
      }
    }

    verify();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
        <div
          className="h-8 w-8 rounded-full animate-spin"
          style={{ border: "4px solid rgba(255,92,0,0.2)", borderTopColor: "var(--or)" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6F9" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 shrink-0 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#0C1E39" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <span className="text-xl font-black text-white tracking-tight">
            Zupwell<span style={{ color: "var(--or)" }}>Admin</span>
          </span>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  background: active ? "var(--or)" : "transparent",
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="text-[#0C1E39]">
            <Menu size={22} />
          </button>
          <span className="font-black text-[#0C1E39]">Zupwell Admin</span>
          <span className="w-[22px]" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
