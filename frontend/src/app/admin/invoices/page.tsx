"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { adminApi, invoicesApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getInvoices().then((d: any) => setInvoices(Array.isArray(d) ? d : d.invoices || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cancel = async (id: number) => {
    if (!confirm("Cancel this invoice?")) return;
    try { await adminApi.cancelInvoice(id); toast.success("Cancelled!"); setInvoices(i => i.map(x => x.id===id ? { ...x, status:"CANCELLED" } : x)); }
    catch (e: any) { toast.error(e.message); }
  };

  const STATUS_CLS: Record<string,string> = { PAID:"zbadge-gr", PENDING:"zbadge-am", CANCELLED:"zbadge-rd" };

  return (
    <div>
      <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px", marginBottom:"20px" }}>INVOICES</h1>
      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"1.2fr 1.2fr 0.8fr 0.8fr 80px 100px" }}>
          <span>INVOICE #</span><span>CUSTOMER</span><span>DATE</span><span>AMOUNT</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {loading ? [...Array(5)].map((_,i) => (
          <div key={i} className="ztr" style={{ gridTemplateColumns:"1.2fr 1.2fr 0.8fr 0.8fr 80px 100px", background:i%2?"#FFF":"#FAFAFA" }}>
            {[...Array(6)].map((_,j) => <div key={j} style={{ height:"14px", background:"#F0F0F0", borderRadius:"4px" }} />)}
          </div>
        )) : invoices.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:"13px" }}>No invoices yet.</div>
        ) : invoices.map((inv, i) => (
          <div key={inv.id} className="ztr" style={{ gridTemplateColumns:"1.2fr 1.2fr 0.8fr 0.8fr 80px 100px", background:i%2?"#FFF":"#FAFAFA" }}>
            <span style={{ fontWeight:800, fontSize:"12px" }}>{inv.invoiceNumber}</span>
            <div><div style={{ fontWeight:700, fontSize:"12px" }}>{inv.order?.user?.name || "—"}</div><div style={{ fontSize:"10px", color:"#888" }}>{inv.order?.user?.email}</div></div>
            <span style={{ fontSize:"11px", fontWeight:600 }}>{new Date(inv.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"2-digit" })}</span>
            <span style={{ fontSize:"13px", fontWeight:800 }}>₹{Number(inv.totalAmount||0).toFixed(0)}</span>
            <span><span className={`zbadge ${STATUS_CLS[inv.status]||"zbadge-dk"}`}>{inv.status}</span></span>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => invoicesApi.downloadPdf(inv.invoiceNumber)} style={{ background:"none", border:"none", cursor:"pointer" }} title="Download PDF">
                <Download size={14} color="#FF4500" />
              </button>
              {inv.status !== "CANCELLED" && (
                <button onClick={() => cancel(inv.id)} style={{ background:"none", border:"none", cursor:"pointer" }} title="Cancel">
                  <X size={14} color="#DC2626" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
