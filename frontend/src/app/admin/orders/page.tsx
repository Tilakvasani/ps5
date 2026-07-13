"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, ChevronRight, Download } from "lucide-react";
import { adminApi, invoicesApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", confirmed: "badge-info", processing: "badge-info",
  shipped: "badge-purple", delivered: "badge-success", cancelled: "badge-danger",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders({ page, perPage, search, status: status === "all" ? "" : status });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders");
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, search, status]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success("Status updated");
    } catch (err: any) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#0C1E39" }}>Orders</h1>
          <p className="text-sm mt-1" style={{ color: "#4A5568" }}>{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order #, customer..." className="input-field pl-9 text-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${status === s ? "bg-[#FF5C00] text-white" : "border text-[#0C1E39] hover:bg-[#F8F8F8]"}`}
              style={status !== s ? { borderColor: "rgba(12, 30, 57, 0.08)" } : {}}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="btn-outline p-2.5" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}><RefreshCw size={16} /></button>
      </div>

      <div className="card p-0 overflow-hidden" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#0C1E39", color: "#F8F8F8" }}>
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Invoice", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(12, 30, 57, 0.08)]">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(12, 30, 57, 0.08)" }} /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center" style={{ color: "#4A5568" }}>No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="transition-colors border-b" style={{ color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.08)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: "var(--or)" }}>{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: "#0C1E39" }}>{o.user?.name || "—"}</p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>{o._count?.items || o.items?.length || 0} items</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "#0C1E39" }}>₹{Math.round(Number(o.totalAmount)).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 capitalize" style={{ color: "#4A5568" }}>{o.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer capitalize
                        ${STATUS_BADGE[o.status] === "badge-success" ? "border-green-300 text-green-600 bg-green-50" :
                          STATUS_BADGE[o.status] === "badge-warning" ? "border-yellow-300 text-yellow-600 bg-yellow-50" :
                          STATUS_BADGE[o.status] === "badge-danger" ? "border-red-300 text-red-600 bg-red-50" :
                          STATUS_BADGE[o.status] === "badge-purple" ? "border-purple-300 text-purple-600 bg-purple-50" :
                          "border-gray-300 text-gray-600 bg-gray-50"}`}
                      style={{ background: "#FFFFFF", color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.15)" }}>
                      {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                        <option key={s} value={s} style={{ background: "#FFFFFF", color: "#0C1E39" }} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#6B7280" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {o.invoice ? (
                      <button
                        onClick={async () => {
                          try { await invoicesApi.downloadPdf(o.invoice.invoiceNumber); }
                          catch (err: any) { toast.error(err.message || "Download failed"); }
                        }}
                        className="flex items-center gap-1 text-xs" style={{ color: "var(--or)" }}
                      ><Download size={12} /> PDF</button>
                    ) : <span className="text-xs" style={{ color: "#6B7280", opacity: 0.4 }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`}>
                      <button className="flex items-center gap-1 text-xs transition-colors" style={{ color: "#0C1E39" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--or)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#0C1E39")}>
                        View <ChevronRight size={12} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
            <p className="text-xs" style={{ color: "#4A5568" }}>Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
