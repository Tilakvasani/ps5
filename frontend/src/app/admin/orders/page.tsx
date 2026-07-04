"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_CLS: Record<string,string> = { PENDING:"zbadge-am", PROCESSING:"zbadge-or", SHIPPED:"zbadge-bu", DELIVERED:"zbadge-gr", CANCELLED:"zbadge-rd" };
const STATUSES = ["ALL","PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    const params = filter !== "ALL" ? { status: filter } : {};
    adminApi.getOrders(params).then((d: any) => {
      setOrders(Array.isArray(d) ? d : d.orders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
      toast.success("Status updated!");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px", marginBottom:"18px" }}>ORDERS</h1>

      <div style={{ display:"flex", gap:"6px", marginBottom:"16px", flexWrap:"wrap" }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`zpill ${filter===s?"zpill-on":"zpill-off"}`} style={{ fontSize:"10px", padding:"5px 12px" }}>{s}</button>
        ))}
      </div>

      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"1.2fr 1.4fr 0.8fr 0.9fr 100px 120px" }}>
          <span>ORDER</span><span>CUSTOMER</span><span>DATE</span><span>TOTAL</span><span>STATUS</span><span>ACTION</span>
        </div>
        {loading ? (
          [...Array(5)].map((_,i) => (
            <div key={i} className="ztr" style={{ gridTemplateColumns:"1.2fr 1.4fr 0.8fr 0.9fr 100px 120px" }}>
              {[...Array(6)].map((_,j) => <div key={j} style={{ height:"14px", background:"#F0F0F0", borderRadius:"4px" }} />)}
            </div>
          ))
        ) : orders.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:"13px" }}>No orders found.</div>
        ) : orders.map((o, i) => (
          <div key={o.id} className="ztr" style={{ gridTemplateColumns:"1.2fr 1.4fr 0.8fr 0.9fr 100px 120px", background: i%2?"#FFF":"#FAFAFA" }}>
            <Link href={`/order/${o.orderNumber}`} style={{ fontWeight:800, fontSize:"12px", color:"var(--or)", textDecoration:"none" }}>#{o.orderNumber}</Link>
            <div>
              <div style={{ fontWeight:700, fontSize:"12px" }}>{o.user?.name || "Guest"}</div>
              <div style={{ fontSize:"10px", color:"#888" }}>{o.user?.email}</div>
            </div>
            <span style={{ fontSize:"11px", fontWeight:600 }}>{new Date(o.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}</span>
            <span style={{ fontSize:"13px", fontWeight:800 }}>₹{Number(o.totalAmount||0).toFixed(0)}</span>
            <span><span className={`zbadge ${STATUS_CLS[o.status]||"zbadge-dk"}`}>{o.status}</span></span>
            <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
              style={{ fontSize:"10px", fontWeight:700, border:"1.5px solid var(--dk)", borderRadius:"5px", padding:"5px 6px", background:"#FFF", cursor:"pointer" }}>
              {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
