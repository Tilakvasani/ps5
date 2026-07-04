"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { useLogout } from "@/lib/useAuth";
import { ordersApi } from "@/lib/api";
import { LayoutDashboard, Package, MapPin, Heart, Star, Settings, LogOut, RefreshCw } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { key: "orders",    label: "ORDERS",    icon: Package },
  { key: "addresses", label: "ADDRESSES", icon: MapPin },
  { key: "wishlist",  label: "WISHLIST",  icon: Heart },
  { key: "rewards",   label: "REWARDS",   icon: Star },
  { key: "settings",  label: "SETTINGS",  icon: Settings },
];

const STATUS_BADGE: Record<string,string> = { DELIVERED: "zbadge-gr", PROCESSING: "zbadge-or", SHIPPED: "zbadge-bu", CANCELLED: "zbadge-rd" };

export default function AccountPage() {
  const { user } = useStore();
  const handleLogout = useLogout();
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { if (!user) router.push("/login"); }, [user]);
  useEffect(() => { ordersApi.list().then(setOrders).catch(() => {}); }, []);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "80vh" }}>
        {/* Sidebar */}
        <div style={{ background: "var(--dk)", padding: "24px 14px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--or)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 900, border: "1.5px solid #1E2D4A", marginBottom: "10px" }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ color: "#FFF", fontSize: "13px", fontWeight: 900, letterSpacing: "-0.3px" }}>{user.name.toUpperCase()}</div>
            <div style={{ color: "#627D98", fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>{user.email}</div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)} className={`zslink${tab === key ? " active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                <Icon size={14} /> {label}
              </button>
            ))}
            <button onClick={handleLogout} className="zslink" style={{ color: "var(--or)", background: "none", border: "none", cursor: "pointer", marginTop: "16px", textAlign: "left", width: "100%" }}>
              <LogOut size={14} /> LOGOUT
            </button>
          </nav>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 24px", background: "var(--dk)" }}>
          {tab === "dashboard" && (
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "20px" }}>
                WELCOME BACK, {user.name.split(" ")[0].toUpperCase()}!
              </h1>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
                {[{ num: orders.length, lbl: "TOTAL ORDERS" },{ num: 564, lbl: "REWARD POINTS", color: "var(--or)" },{ num: 0, lbl: "WISHLIST" }].map(({ num, lbl, color }) => (
                  <div key={lbl} className="zstat" style={{ textAlign: "center" }}>
                    <div className="zstat-num" style={{ color: color || "var(--wh)" }}>{num}</div>
                    <div className="zstat-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.5px", marginBottom: "10px" }}>RECENT ORDERS</div>
              <div className="zcard" style={{ padding: 0, overflow: "hidden" }}>
                <div className="ztr ztr-head" style={{ gridTemplateColumns: "1.2fr 0.7fr 0.8fr 90px 70px" }}>
                  <span>ORDER</span><span>DATE</span><span>TOTAL</span><span>STATUS</span><span></span>
                </div>
                {orders.slice(0,3).map((o, i) => (
                  <div key={o.id} className="ztr" style={{ gridTemplateColumns: "1.2fr 0.7fr 0.8fr 90px 70px" }}>
                    <div><strong style={{ fontSize: "12px" }}>#{o.orderNumber}</strong><div style={{ fontSize: "10px", color: "#8F9CAE" }}>{o.items?.length || 0} item(s)</div></div>
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>{new Date(o.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short" })}</span>
                    <span style={{ fontSize: "13px", fontWeight: 800 }}>₹{Number(o.totalAmount || 0).toFixed(0)}</span>
                    <span><span className={`zbadge ${STATUS_BADGE[o.status] || "zbadge-dk"}`}>{o.status}</span></span>
                    <button onClick={() => setTab("orders")} style={{ fontSize: "10px", fontWeight: 800, color: "var(--or)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      <RefreshCw size={10} /> REORDER
                    </button>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", fontSize: "13px", color: "#8F9CAE" }}>
                    No orders yet. <Link href="/products" style={{ color: "var(--or)", fontWeight: 700, textDecoration: "none" }}>Start shopping!</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "20px" }}>MY ORDERS</h1>
              <div className="zcard" style={{ padding: 0, overflow: "hidden" }}>
                <div className="ztr ztr-head" style={{ gridTemplateColumns: "1.2fr 0.7fr 0.8fr 90px 100px" }}>
                  <span>ORDER</span><span>DATE</span><span>TOTAL</span><span>STATUS</span><span>ACTION</span>
                </div>
                {orders.map(o => (
                  <div key={o.id} className="ztr" style={{ gridTemplateColumns: "1.2fr 0.7fr 0.8fr 90px 100px" }}>
                    <div><strong style={{ fontSize: "12px" }}>#{o.orderNumber}</strong><div style={{ fontSize: "10px", color: "#8F9CAE" }}>{o.items?.map((i:any)=>i.name).join(", ").slice(0,30)}</div></div>
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>{new Date(o.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short",year:"2-digit" })}</span>
                    <span style={{ fontSize: "13px", fontWeight: 800 }}>₹{Number(o.totalAmount || 0).toFixed(0)}</span>
                    <span><span className={`zbadge ${STATUS_BADGE[o.status] || "zbadge-dk"}`}>{o.status}</span></span>
                    <Link href={`/order/${o.orderNumber}`} style={{ fontSize: "10px", fontWeight: 800, color: "var(--or)", textDecoration: "none", letterSpacing: "0.5px" }}>VIEW DETAILS</Link>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: "#8F9CAE", fontSize: "13px" }}>No orders yet.</div>
                )}
              </div>
            </div>
          )}

          {(tab === "addresses" || tab === "wishlist" || tab === "rewards" || tab === "settings") && (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>🚧</div>
              <h2 style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px", color: "var(--wh)" }}>{tab.toUpperCase()} COMING SOON</h2>
              <p style={{ color: "#8F9CAE", fontSize: "13px" }}>We're building this. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
