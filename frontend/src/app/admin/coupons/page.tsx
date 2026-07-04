"use client";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

const EMPTY = { code:"", description:"", discountType:"percent", discountValue:"", minOrderValue:"0", maxDiscount:"", usageLimit:"", validFrom:"", validTo:"", isActive:true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const load = async () => { setLoading(true); try { setCoupons(await adminApi.getCoupons()); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const u = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderValue: Number(form.minOrderValue), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
      if (modal?.id) await adminApi.updateCoupon(modal.id, payload);
      else await adminApi.createCoupon(payload);
      toast.success(modal?.id ? "Updated!" : "Created!"); setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete coupon?")) return;
    try { await adminApi.deleteCoupon(id); toast.success("Deleted!"); load(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>COUPONS</h1>
        <button onClick={() => { setForm(EMPTY); setModal({}); }} className="zbtn-or" style={{ fontSize:"11px", padding:"9px 16px" }}>
          <Plus size={13} /> ADD COUPON
        </button>
      </div>

      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.7fr 80px 70px" }}>
          <span>CODE</span><span>TYPE</span><span>VALUE</span><span>MIN ORDER</span><span>USED</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {loading ? [...Array(4)].map((_,i) => (
          <div key={i} className="ztr" style={{ gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.7fr 80px 70px", background:i%2?"#FFF":"#FAFAFA" }}>
            {[...Array(7)].map((_,j) => <div key={j} style={{ height:"14px", background:"#F0F0F0", borderRadius:"4px" }} />)}
          </div>
        )) : coupons.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:"13px" }}>No coupons yet.</div>
        ) : coupons.map((c, i) => (
          <div key={c.id} className="ztr" style={{ gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.7fr 80px 70px", background:i%2?"#FFF":"#FAFAFA" }}>
            <div><div style={{ fontWeight:900, fontSize:"12px", letterSpacing:"0.5px" }}>{c.code}</div><div style={{ fontSize:"10px", color:"#888" }}>{c.description}</div></div>
            <span className="zbadge zbadge-dk" style={{ fontSize:"9px" }}>{c.discountType}</span>
            <span style={{ fontWeight:800 }}>{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</span>
            <span style={{ fontSize:"11px" }}>₹{c.minOrderValue}</span>
            <span style={{ fontSize:"11px" }}>{c.usageCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</span>
            <span className={`zbadge ${c.isActive ? "zbadge-gr" : "zbadge-rd"}`}>{c.isActive ? "ACTIVE" : "OFF"}</span>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => { setForm({ code:c.code, description:c.description||"", discountType:c.discountType, discountValue:c.discountValue, minOrderValue:c.minOrderValue, maxDiscount:c.maxDiscount||"", usageLimit:c.usageLimit||"", validFrom:c.validFrom?.slice(0,10)||"", validTo:c.validTo?.slice(0,10)||"", isActive:c.isActive }); setModal(c); }} style={{ background:"none", border:"none", cursor:"pointer" }}><Edit3 size={14} color="#FF4500" /></button>
              <button onClick={() => del(c.id)} style={{ background:"none", border:"none", cursor:"pointer" }}><Trash2 size={14} color="#DC2626" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div className="zcard" style={{ width:"100%", maxWidth:"460px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <div style={{ fontSize:"14px", fontWeight:900, letterSpacing:"-0.5px" }}>{modal?.id ? "EDIT COUPON" : "NEW COUPON"}</div>
              <button onClick={() => setModal(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <input className="zinp" placeholder="Coupon code (e.g. SAVE20)" value={form.code} onChange={e => u("code", e.target.value.toUpperCase())} />
              <input className="zinp" placeholder="Description (optional)" value={form.description} onChange={e => u("description", e.target.value)} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <select className="zinp" value={form.discountType} onChange={e => u("discountType", e.target.value)}>
                  <option value="percent">Percentage %</option>
                  <option value="flat">Flat ₹</option>
                </select>
                <input className="zinp" type="number" placeholder="Discount value" value={form.discountValue} onChange={e => u("discountValue", e.target.value)} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <input className="zinp" type="number" placeholder="Min order ₹" value={form.minOrderValue} onChange={e => u("minOrderValue", e.target.value)} />
                <input className="zinp" type="number" placeholder="Max discount ₹ (optional)" value={form.maxDiscount} onChange={e => u("maxDiscount", e.target.value)} />
              </div>
              <input className="zinp" type="number" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={e => u("usageLimit", e.target.value)} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <div><div className="zlabel">Valid From</div><input className="zinp" type="date" value={form.validFrom} onChange={e => u("validFrom", e.target.value)} /></div>
                <div><div className="zlabel">Valid To</div><input className="zinp" type="date" value={form.validTo} onChange={e => u("validTo", e.target.value)} /></div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => u("isActive", e.target.checked)} /> Active
              </label>
              <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                <button onClick={() => setModal(null)} className="zbtn-out" style={{ flex:1, justifyContent:"center" }}>CANCEL</button>
                <button onClick={save} className="zbtn-or" style={{ flex:2, justifyContent:"center" }}>SAVE COUPON</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
