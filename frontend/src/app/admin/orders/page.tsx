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
    } catch {}
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
          <h1 className="text-3xl font-display font-black text-white">Orders</h1>
          <p className="text-white/40 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order #, customer..." className="input-field pl-9 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${status === s ? "bg-pink-500 text-white" : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="btn-outline p-2.5"><RefreshCw size={16} /></button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/30 text-left">
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Invoice", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-4 rounded bg-white/5 animate-pulse" /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-white/30">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-semibold">{o.user?.name || "—"}</p>
                    <p className="text-xs text-white/30">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/60">{o._count?.items || o.items?.length || 0} items</td>
                  <td className="px-4 py-3 font-bold text-white">₹{Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/60 capitalize">{o.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer bg-transparent capitalize
                        ${STATUS_BADGE[o.status] === "badge-success" ? "border-emerald-500/30 text-emerald-400" :
                          STATUS_BADGE[o.status] === "badge-warning" ? "border-yellow-500/30 text-yellow-400" :
                          STATUS_BADGE[o.status] === "badge-danger" ? "border-red-500/30 text-red-400" :
                          STATUS_BADGE[o.status] === "badge-purple" ? "border-purple-500/30 text-purple-400" :
                          "border-blue-500/30 text-blue-400"}`}>
                      {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                        <option key={s} value={s} className="bg-[#111] text-white capitalize">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {o.invoice ? (
                      <a href={invoicesApi.getPdf(o.invoice.invoiceNumber)} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"><Download size={12} /> PDF</button>
                      </a>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`}>
                      <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
