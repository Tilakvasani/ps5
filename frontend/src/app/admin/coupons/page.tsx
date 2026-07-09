"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [form, setForm] = useState({ code: "", description: "", discountType: "percent", discountValue: "", minOrderValue: "0", maxDiscount: "", usageLimit: "", validFrom: "", validTo: "", isActive: true });

  const fetch = async () => { setLoading(true); try { setCoupons(await adminApi.getCoupons()); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm({ code: "", description: "", discountType: "percent", discountValue: "", minOrderValue: "0", maxDiscount: "", usageLimit: "", validFrom: "", validTo: "", isActive: true }); setModal({}); };
  const openEdit = (c: any) => {
    setForm({ code: c.code, description: c.description || "", discountType: c.discountType, discountValue: c.discountValue, minOrderValue: c.minOrderValue, maxDiscount: c.maxDiscount || "", usageLimit: c.usageLimit || "", validFrom: c.validFrom?.slice(0, 10) || "", validTo: c.validTo?.slice(0, 10) || "", isActive: c.isActive });
    setModal(c);
  };

  const handleSave = async () => {
    try {
      if (modal?.id) { await adminApi.updateCoupon(modal.id, form); toast.success("Updated!"); }
      else { await adminApi.createCoupon(form); toast.success("Coupon created!"); }
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete coupon?")) return;
    try {
      const res = await adminApi.deleteCoupon(id);
      toast.success(res.message || "Deleted");
      fetch();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>Coupons</h1>
        <button onClick={openNew} className="zbtn-or flex items-center gap-2"><Plus size={16} /> New Coupon</button>
      </div>
      <div className="zcard p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#0C1E39", color: "#F8F8F8", background: "#0C1E39" }}>
              {["Code", "Type", "Value", "Min Order", "Used", "Valid Until", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 font-semibold text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(12, 30, 57, 0.08)" }} /></td></tr>)
              : coupons.map(c => (
              <tr key={c.id} className="transition-colors border-b" style={{ color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.08)" }} onMouseEnter={e => e.currentTarget.style.background = "#F8F8F8"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--or)" }}>{c.code}</td>
                <td className="px-4 py-3 capitalize" style={{ color: "#4A5568" }}>{c.discountType}</td>
                <td className="px-4 py-3 font-bold" style={{ color: "#0C1E39" }}>{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="px-4 py-3" style={{ color: "#4A5568" }}>₹{c.minOrderValue}</td>
                <td className="px-4 py-3" style={{ color: "#4A5568" }}>{c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{c.validTo ? new Date(c.validTo).toLocaleDateString("en-IN") : "—"}</td>
                <td className="px-4 py-3"><span className={`zbadge ${c.isActive ? "zbadge-gr" : "zbadge-rd"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => openEdit(c)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#0C1E39" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--or)"; e.currentTarget.style.background = "rgba(12, 30, 57, 0.08)"; }} onMouseLeave={e => { e.currentTarget.style.color = "#0C1E39"; e.currentTarget.style.background = "transparent"; }}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#0C1E39" }} onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = "#0C1E39"; e.currentTarget.style.background = "transparent"; }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(5, 17, 36, 0.7)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg zcard p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 20px 40px rgba(5, 17, 36, 0.15)" }}>
            <h2 className="font-bold mb-5" style={{ color: "#0C1E39" }}>{modal?.id ? "Edit" : "New"} Coupon</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="zlabel">Code *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="zinp" placeholder="SAVE10" /></div>
                <div><label className="zlabel">Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="zinp">
                    <option value="percent">Percentage</option><option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="zlabel">Discount Value</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="zinp" /></div>
                <div><label className="zlabel">Min Order (₹)</label><input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} className="zinp" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="zlabel">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="zinp" placeholder="Optional" /></div>
                <div><label className="zlabel">Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="zinp" placeholder="Unlimited" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="zlabel">Valid From</label><input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="zinp" /></div>
                <div><label className="zlabel">Valid To</label><input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} className="zinp" /></div>
              </div>
              <div><label className="zlabel">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="zinp resize-none" rows={2} /></div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm" style={{ color: "#0C1E39" }}>Active</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-[var(--or)]" : "bg-gray-300"}`} style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="zbtn-or flex-1 py-2.5">Save Coupon</button>
              <button onClick={() => setModal(null)} className="zbtn-out px-5 py-2.5">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

