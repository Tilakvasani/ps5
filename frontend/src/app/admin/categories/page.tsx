"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null);
  const [form, setForm] = useState({ name:"", description:"", isActive:true });

  const load = async () => { setLoading(true); try { setCats(await adminApi.getCategories()); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (modal?.id) await adminApi.updateCategory(modal.id, form);
      else await adminApi.createCategory(form);
      toast.success(modal?.id ? "Updated!" : "Created!"); setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try { await adminApi.deleteCategory(id); toast.success("Deleted!"); load(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>CATEGORIES</h1>
        <button onClick={() => { setForm({ name:"", description:"", isActive:true }); setModal({}); }} className="zbtn-or" style={{ fontSize:"11px", padding:"9px 16px" }}>
          <Plus size={13} /> ADD CATEGORY
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
        {loading ? [...Array(4)].map((_,i) => (
          <div key={i} style={{ height:"100px", background:"#F0F0F0", borderRadius:"10px" }} />
        )) : cats.map(c => (
          <div key={c.id} className="zcard">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
              <div style={{ fontSize:"13px", fontWeight:800, letterSpacing:"-0.3px" }}>{c.name}</div>
              <span className={`zbadge ${c.isActive?"zbadge-gr":"zbadge-rd"}`}>{c.isActive?"ACTIVE":"OFF"}</span>
            </div>
            <div style={{ fontSize:"11px", color:"#888", marginBottom:"12px", lineHeight:1.5 }}>{c.description || "No description"}</div>
            <div style={{ fontSize:"10px", color:"#888", marginBottom:"12px" }}>{c._count?.products ?? 0} products</div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => { setForm({ name:c.name, description:c.description||"", isActive:c.isActive }); setModal(c); }} className="zbtn-out" style={{ flex:1, fontSize:"10px", padding:"7px", justifyContent:"center" }}>
                <Edit size={12} /> EDIT
              </button>
              <button onClick={() => del(c.id)} style={{ background:"none", border:"1.5px solid #DC2626", borderRadius:"7px", padding:"7px 10px", cursor:"pointer", color:"#DC2626" }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {!loading && cats.length === 0 && <div style={{ padding:"20px", color:"#888", fontSize:"13px" }}>No categories yet.</div>}
      </div>

      {modal !== null && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="zcard" style={{ width:"100%", maxWidth:"380px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div style={{ fontSize:"14px", fontWeight:900 }}>{modal?.id ? "EDIT CATEGORY" : "NEW CATEGORY"}</div>
              <button onClick={() => setModal(null)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={16} /></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <input className="zinp" placeholder="Category name" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
              <textarea className="zinp" rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} style={{ resize:"none" }} />
              <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive:e.target.checked }))} /> Active
              </label>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={() => setModal(null)} className="zbtn-out" style={{ flex:1, justifyContent:"center" }}>CANCEL</button>
                <button onClick={save} className="zbtn-or" style={{ flex:2, justifyContent:"center" }}>SAVE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
