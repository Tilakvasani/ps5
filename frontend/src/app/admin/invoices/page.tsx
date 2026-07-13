"use client";
import { useEffect, useState } from "react";
import { Download, Search, RefreshCw } from "lucide-react";
import { adminApi, invoicesApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  issued: "zbadge zbadge-gr", cancelled: "zbadge zbadge-rd", draft: "zbadge zbadge-am",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = async () => { setLoading(true); try { const d = await adminApi.getInvoices({ search }); setInvoices(d); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, [search]);

  const cancel = async (id: number) => {
    if (!confirm("Cancel this invoice?")) return;
    try { await adminApi.cancelInvoice(id); toast.success("Invoice cancelled"); fetch(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>Invoices</h1>
          <p className="text-sm mt-1" style={{ color: "#4A5568" }}>GST Tax Invoices</p>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Invoice #, customer..." className="zinp pl-9 text-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }} />
        </div>
        <button onClick={fetch} className="zbtn-out p-2.5" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}><RefreshCw size={16} /></button>
      </div>
      <div className="zcard p-0 overflow-hidden" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(12, 30, 57, 0.08)", color: "#F8F8F8", background: "#0C1E39" }}>
                {["Invoice #", "Order #", "Customer", "Amount", "GST", "Status", "Date", "Download", "Action"].map(h => <th key={h} className="px-4 py-3 font-semibold text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
              {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(12, 30, 57, 0.08)" }} /></td></tr>)
                : invoices.map((inv: any) => (
                <tr key={inv.id} className="transition-colors border-b" style={{ color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.08)" }} onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: "#0C1E39" }}>{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#6B7280" }}>{inv.order?.orderNumber}</td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>{inv.order?.user?.name || "—"}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "#0C1E39" }}>₹{Number(inv.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>₹{(Number(inv.cgstAmount) + Number(inv.sgstAmount) + Number(inv.igstAmount)).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`${STATUS_BADGE[inv.status] || "zbadge zbadge-bu"}`}>{inv.status}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{new Date(inv.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        try { await invoicesApi.downloadPdf(inv.invoiceNumber); }
                        catch (err: any) { toast.error(err.message || "Download failed"); }
                      }}
                      className="flex items-center gap-1 text-xs font-bold"
                      style={{ color: "var(--or)" }}
                    ><Download size={12} /> PDF</button>
                  </td>
                  <td className="px-4 py-3">
                    {inv.status !== "cancelled" && (
                      <button onClick={() => cancel(inv.id)} className="text-xs text-red-500 hover:text-red-600 transition-colors">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

