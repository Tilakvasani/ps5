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
    try { await adminApi.deleteCoupon(id); toast.success("Deleted"); fetch(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-black text-[#111827]">Coupons</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Coupon</button>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#D9DEE8] text-[#6B7280] text-left">
            {["Code", "Type", "Value", "Min Order", "Used", "Valid Until", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded bg-[#F4F6FA] animate-pulse" /></td></tr>)
              : coupons.map(c => (
              <tr key={c.id} className="hover:bg-[#F4F6FA] transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-[#F47C41]">{c.code}</td>
                <td className="px-4 py-3 text-[#374151] capitalize">{c.discountType}</td>
                <td className="px-4 py-3 font-bold text-[#111827]">{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="px-4 py-3 text-[#6B7280]">₹{c.minOrderValue}</td>
                <td className="px-4 py-3 text-[#6B7280]">{c.usedCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3 text-[#6B7280] text-xs">{c.validTo ? new Date(c.validTo).toLocaleDateString("en-IN") : "—"}</td>
                <td className="px-4 py-3"><span className={`badge ${c.isActive ? "badge-success" : "badge-danger"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3 flex gap-1">
                  <button onClick={() => openEdit(c)} className="h-8 w-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-blue-400 hover:bg-blue-400/10 transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-[#111827] mb-5">{modal?.id ? "Edit" : "New"} Coupon</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Code *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-field" placeholder="SAVE10" /></div>
                <div><label className="label-text">Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="input-field">
                    <option value="percent">Percentage</option><option value="flat">Flat Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Discount Value</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} className="input-field" /></div>
                <div><label className="label-text">Min Order (₹)</label><input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input-field" placeholder="Optional" /></div>
                <div><label className="label-text">Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input-field" placeholder="Unlimited" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Valid From</label><input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="input-field" /></div>
                <div><label className="label-text">Valid To</label><input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} className="input-field" /></div>
              </div>
              <div><label className="label-text">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={2} /></div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm text-[#374151]">Active</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-[#F47C41]" : "bg-[#FFFFFF]"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="btn-primary flex-1 py-2.5">Save Coupon</button>
              <button onClick={() => setModal(null)} className="btn-outline px-5 py-2.5">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
