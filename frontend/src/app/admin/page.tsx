"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Package, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [chart, setChart] = useState<number[]>([48,62,100,40,72,95,55]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => {});
    adminApi.revenueChart(7).then((d: any) => {
      if (Array.isArray(d)) setChart(d.map((x: any) => x.revenue || x.total || 0));
    }).catch(() => {});
    adminApi.getOrders({ limit: 5 }).then((d: any) => setOrders(Array.isArray(d) ? d : d.orders || [])).catch(() => {});
  }, []);

  const max = Math.max(...chart, 1);
  const STATUS_CLS: Record<string,string> = { DELIVERED:"zbadge-gr", PROCESSING:"zbadge-or", SHIPPED:"zbadge-bu", CANCELLED:"zbadge-rd", PENDING:"zbadge-am" };
  const DAYS = ["M","T","W","T","F","S","S"];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>DASHBOARD</h1>
        <div style={{ fontSize:"11px", color:"#888", fontWeight:600 }}>
          {new Date().toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long" })}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"20px" }}>
        {[
          { label:"TOTAL REVENUE",   value: stats.totalRevenue ? `₹${(stats.totalRevenue/100000).toFixed(1)}L` : "₹0", icon:TrendingUp, color:"#FF4500", trend:"+18% this month" },
          { label:"ORDERS TODAY",    value: stats.ordersToday ?? 0,    icon:ShoppingBag, color:"#0A0A0A", trend:"+5 vs yesterday" },
          { label:"ACTIVE PRODUCTS", value: stats.totalProducts ?? 0,  icon:Package,     color:"#C8FF00", trend:"" },
          { label:"TOTAL USERS",     value: stats.totalUsers ?? 0,     icon:Users,       color:"#0A0A0A", trend:`+${stats.newUsers ?? 0} new` },
        ].map(({ label, value, icon:Icon, color, trend }) => (
          <div key={label} className="zstat" style={{ borderTop:`3px solid ${color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
              <div className="zstat-lbl">{label}</div>
              <Icon size={16} color={color} />
            </div>
            <div className="zstat-num">{value}</div>
            {trend && <div style={{ fontSize:"10px", color:"#16A34A", fontWeight:800, marginTop:"4px" }}>↑ {trend}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:"14px" }}>
        {/* Revenue Chart */}
        <div className="zcard">
          <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"16px" }}>REVENUE — LAST 7 DAYS</div>
          <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", height:"100px" }}>
            {chart.map((val, i) => {
              const h = Math.round((val / max) * 90) || 8;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center", gap:"4px" }}>
                  <div style={{ background: h > 80 ? "#FF4500" : "#F0F0F0", border:"1.5px solid #0A0A0A", borderRadius:"3px 3px 0 0", width:"100%", height:`${h}px`, transition:"height 0.3s" }} />
                  <span style={{ fontSize:"8px", fontWeight:800, color:"#888" }}>{DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {/* Recent Orders */}
          <div className="zcard" style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"12px" }}>RECENT ORDERS</div>
            {orders.slice(0,4).map(o => (
              <div key={o.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"9px" }}>
                <span style={{ fontSize:"11px", fontWeight:700 }}>#{o.orderNumber} <span style={{ color:"#888", fontWeight:500 }}>· {o.user?.name?.split(" ")[0] || "Guest"}</span></span>
                <span className={`zbadge ${STATUS_CLS[o.status] || "zbadge-dk"}`}>{o.status}</span>
              </div>
            ))}
            {orders.length === 0 && <div style={{ fontSize:"12px", color:"#888" }}>No orders yet.</div>}
            <Link href="/admin/orders" style={{ fontSize:"11px", fontWeight:700, color:"#FF4500", textDecoration:"none" }}>VIEW ALL →</Link>
          </div>

          {/* Low Stock */}
          <div style={{ background:"#FFFAE0", border:"2px solid #F59E0B", borderRadius:"10px", padding:"14px" }}>
            <div style={{ display:"flex", gap:"6px", alignItems:"center", fontSize:"11px", fontWeight:900, color:"#92400E", marginBottom:"6px" }}>
              <AlertTriangle size={14} /> LOW STOCK ALERT
            </div>
            <div style={{ fontSize:"11px", color:"#78350F", fontWeight:600, marginBottom:"8px" }}>Check inventory for low stock items</div>
            <Link href="/admin/inventory" style={{ fontSize:"11px", fontWeight:700, color:"#92400E", textDecoration:"none" }}>CHECK INVENTORY →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
