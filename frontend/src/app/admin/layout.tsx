"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Star, Settings, Bell, Search } from "lucide-react";

const NAV = [
  { label: "DASHBOARD", href: "/admin",          icon: LayoutDashboard },
  { label: "PRODUCTS",  href: "/admin/products", icon: Package },
  { label: "ORDERS",    href: "/admin/orders",   icon: ShoppingCart },
  { label: "USERS",     href: "/admin/users",    icon: Users },
  { label: "COUPONS",   href: "/admin/coupons",  icon: Ticket },
  { label: "REVIEWS",   href: "/admin/reviews",  icon: Star },
  { label: "SETTINGS",  href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh", background: "var(--dk)" }}>
      {/* Sidebar */}
      <div style={{ background: "var(--dk)", padding: "20px 14px", display: "flex", flexDirection: "column" }}>
        <Link href="/" style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "-1px", color: "var(--wh)", textDecoration: "none", marginBottom: "24px", display: "block" }}>
          zupwell<span style={{ color: "var(--or)" }}>•</span>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "#627D98", letterSpacing: "1px", marginTop: "2px" }}>ADMIN PANEL</div>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = path === href || (href !== "/admin" && path.startsWith(href));
            return (
              <Link key={label} href={href} className={`zslink${active ? " active" : ""}`}>
                <Icon size={14} /> {label}
              </Link>
            );
          })}
        </nav>
        <div style={{ borderTop: "1px solid var(--bd-soft)", paddingTop: "14px" }}>
          <Link href="/" style={{ fontSize: "10px", fontWeight: 700, color: "#627D98", textDecoration: "none", letterSpacing: "0.5px" }}>← BACK TO STORE</Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{ background: "var(--dk-card)", borderBottom: "1.5px solid var(--bd-soft)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#8F9CAE" }} />
            <input className="zinp" placeholder="Search..." style={{ paddingLeft: "32px", width: "200px", fontSize: "11px", padding: "8px 10px 8px 30px" }} />
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Bell size={16} color="#8F9CAE" />
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--or)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, border: "1.5px solid var(--bd-soft)" }}>
              AD
            </div>
          </div>
        </div>
        <div style={{ padding: "24px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
