"use client";
import { useEffect, useState } from "react";
import { Download, Search, RefreshCw } from "lucide-react";
import { adminApi, invoicesApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  issued: "badge-success", cancelled: "badge-danger", draft: "badge-warning",
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
        <div><h1 className="text-3xl font-black text-[#001c54]">Invoices</h1><p className="text-[#45353E] text-sm mt-1">GST Tax Invoices</p></div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45353E]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Invoice #, customer..." className="input-field pl-9 text-sm" />
        </div>
        <button onClick={fetch} className="btn-outline p-2.5"><RefreshCw size={16} /></button>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E8E2D9] text-[#45353E] text-left">
              {["Invoice #", "Order #", "Customer", "Amount", "GST", "Status", "Date", "Download", "Action"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-4 rounded bg-[#FCFAF6] animate-pulse" /></td></tr>)
                : invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-[#FCFAF6] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#001c54] font-bold text-xs">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-mono text-[#45353E] text-xs">{inv.order?.orderNumber}</td>
                  <td className="px-4 py-3 text-[#45353E]">{inv.order?.user?.name || "—"}</td>
                  <td className="px-4 py-3 font-bold text-[#001c54]">₹{Number(inv.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#45353E]">₹{(Number(inv.cgstAmount) + Number(inv.sgstAmount) + Number(inv.igstAmount)).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[inv.status] || "badge-info"}`}>{inv.status}</span></td>
                  <td className="px-4 py-3 text-[#45353E] text-xs">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        try { await invoicesApi.downloadPdf(inv.invoiceNumber); }
                        catch (err: any) { toast.error(err.message || "Download failed"); }
                      }}
                      className="flex items-center gap-1 text-xs text-[#EB9220] hover:text-[#EB9220]"
                    ><Download size={12} /> PDF</button>
                  </td>
                  <td className="px-4 py-3">
                    {inv.status !== "cancelled" && (
                      <button onClick={() => cancel(inv.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Cancel</button>
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
