"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any>(null); // null = closed, {} = new, {id,...} = edit
  const [form, setForm] = useState({ name: "", description: "", parentId: "", isActive: true });

  const fetch = async () => { setLoading(true); try { setCategories(await adminApi.getCategories()); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm({ name: "", description: "", parentId: "", isActive: true }); setModal({}); };
  const openEdit = (c: any) => { setForm({ name: c.name, description: c.description || "", parentId: c.parentId?.toString() || "", isActive: c.isActive }); setModal(c); };

  const handleSave = async () => {
    try {
      const data = { ...form, parentId: form.parentId ? Number(form.parentId) : null };
      if (modal?.id) { await adminApi.updateCategory(modal.id, data); toast.success("Updated!"); }
      else { await adminApi.createCategory(data); toast.success("Created!"); }
      setModal(null); fetch();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try { await adminApi.deleteCategory(id); toast.success("Deleted"); fetch(); } catch (err: any) { toast.error(err.message); }
  };

  const roots = categories.filter(c => !c.parentId);
  const children = (pid: number) => categories.filter(c => c.parentId === pid);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>Categories</h1>
        <button onClick={openNew} className="zbtn-or flex items-center gap-2"><Plus size={16} /> Add Category</button>
      </div>

      <div className="zcard p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#1E2D4A", color: "#8F9CAE", background: "#0C1E3E" }}>
              {["Name", "Parent", "Products", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 font-semibold text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#1E2D4A" }}>
            {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "#1E2D4A" }} /></td></tr>)
              : roots.map(cat => (
              <>
                <tr key={cat.id} className="transition-colors font-semibold" style={{ color: "#FFFFFF" }} onMouseEnter={e => e.currentTarget.style.background = "#1E2D4A"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-4 py-3" style={{ color: "#FFFFFF" }}>{cat.name}</td>
                  <td className="px-4 py-3" style={{ color: "#8F9CAE" }}>—</td>
                  <td className="px-4 py-3" style={{ color: "#8F9CAE" }}>{cat._count?.products ?? 0}</td>
                  <td className="px-4 py-3"><span className={`zbadge ${cat.isActive ? "zbadge-gr" : "zbadge-rd"}`}>{cat.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => openEdit(cat)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#8F9CAE" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--or)"; e.currentTarget.style.background = "#0C1E3E"; }} onMouseLeave={e => { e.currentTarget.style.color = "#8F9CAE"; e.currentTarget.style.background = "transparent"; }}><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#8F9CAE" }} onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = "#8F9CAE"; e.currentTarget.style.background = "transparent"; }}><Trash2 size={14} /></button>
                  </td>
                </tr>
                {children(cat.id).map(child => (
                  <tr key={child.id} className="transition-colors" style={{ color: "#FFFFFF" }} onMouseEnter={e => e.currentTarget.style.background = "#1E2D4A"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 pl-10" style={{ color: "#FFFFFF" }}>↳ {child.name}</td>
                    <td className="px-4 py-3" style={{ color: "#8F9CAE" }}>{cat.name}</td>
                    <td className="px-4 py-3" style={{ color: "#8F9CAE" }}>{child._count?.products ?? 0}</td>
                    <td className="px-4 py-3"><span className={`zbadge ${child.isActive ? "zbadge-gr" : "zbadge-rd"}`}>{child.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => openEdit(child)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#8F9CAE" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--or)"; e.currentTarget.style.background = "#0C1E3E"; }} onMouseLeave={e => { e.currentTarget.style.color = "#8F9CAE"; e.currentTarget.style.background = "transparent"; }}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(child.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#8F9CAE" }} onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = "#8F9CAE"; e.currentTarget.style.background = "transparent"; }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(5, 17, 36, 0.7)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md zcard p-6" style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A" }}>
            <h2 className="font-bold mb-5" style={{ color: "#627d98" }}>{modal?.id ? "Edit" : "New"} Category</h2>
            <div className="space-y-4">
              <div><label className="zlabel">Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="zinp" /></div>
              <div><label className="zlabel">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="zinp resize-none" rows={2} /></div>
              <div><label className="zlabel">Parent Category</label>
                <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))} className="zinp">
                  <option value="">— Root Category —</option>
                  {roots.filter(c => c.id !== modal?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm" style={{ color: "#8F9CAE" }}>Active</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-[var(--or)]" : "bg-[#051124]"}`}
                  style={{ border: "1.5px solid #1E2D4A" }}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="zbtn-or flex-1 py-2.5">Save</button>
              <button onClick={() => setModal(null)} className="zbtn-out px-5 py-2.5">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

