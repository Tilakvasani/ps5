"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [movementModal, setMovementModal] = useState<any>(null);
  const [movement, setMovement] = useState({ qty: "", movementType: "in", notes: "" });

  const fetchInventory = async () => {
    setLoading(true);
    try { const data = await adminApi.getInventory(); setInventory(data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = inventory.filter(i =>
    i.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMovement = async () => {
    if (!movementModal || !movement.qty) return;
    try {
      await adminApi.addMovement({
        productId: movementModal.productId,
        variantId: movementModal.variantId,
        movementType: movement.movementType,
        qty: Number(movement.qty),
        notes: movement.notes,
      });
      toast.success("Stock updated!");
      setMovementModal(null);
      setMovement({ qty: "", movementType: "in", notes: "" });
      fetchInventory();
    } catch (err: any) { toast.error(err.message); }
  };

  const lowStock = filtered.filter(i => i.qtyInStock <= i.lowStockThreshold);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#0B1B3D]">Inventory</h1>
          <p className="text-[#45353E] text-sm mt-1">{inventory.length} SKUs tracked</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 mb-4 text-sm">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span className="text-yellow-200"><span className="font-bold">{lowStock.length} items</span> are at or below low stock threshold</span>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45353E]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="input-field pl-9 text-sm" />
        </div>
        <button onClick={fetchInventory} className="btn-outline p-2.5"><RefreshCw size={16} /></button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#45353E] text-left">
                {["Product", "SKU / Variant", "In Stock", "Reserved", "Available", "Low Stock At", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 rounded bg-[#FCFAF6] animate-pulse" /></td></tr>
              )) : filtered.map(item => {
                const available = item.qtyInStock - item.reservedQty;
                const isLow = item.qtyInStock <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className={`hover:bg-[#FCFAF6] transition-colors ${isLow ? "bg-yellow-500/5" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0B1B3D] line-clamp-1 max-w-[180px]">{item.product?.name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#45353E] text-xs">
                      {item.variant ? item.variant.sku : item.product?.sku}
                      {item.variant && <p className="text-[#45353E]">{item.variant.variantName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-lg ${isLow ? "text-yellow-400" : "text-[#0B1B3D]"}`}>{item.qtyInStock}</span>
                    </td>
                    <td className="px-4 py-3 text-[#45353E]">{item.reservedQty}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${available > 0 ? "badge-success" : "badge-danger"}`}>{available}</span>
                    </td>
                    <td className="px-4 py-3 text-[#45353E]">{item.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setMovementModal(item)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#EB9220] hover:text-[#EB9220] border border-[#EB9220]/20 hover:border-[#EB9220]/40 px-3 py-1.5 rounded-lg transition-all">
                        <Plus size={12} /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      {movementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white  px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md card p-6">
            <h2 className="font-bold text-[#0B1B3D] mb-1">Adjust Stock</h2>
            <p className="text-sm text-[#45353E] mb-5">{movementModal.product?.name}{movementModal.variant ? ` — ${movementModal.variant.variantName}` : ""}</p>
            <div className="space-y-4">
              <div>
                <label className="label-text">Movement Type</label>
                <select value={movement.movementType} onChange={e => setMovement(m => ({ ...m, movementType: e.target.value }))} className="input-field">
                  <option value="in">Stock In (Purchase / Return)</option>
                  <option value="out">Stock Out (Damage / Manual)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="label-text">Quantity</label>
                <input type="number" min="1" value={movement.qty} onChange={e => setMovement(m => ({ ...m, qty: e.target.value }))} className="input-field" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="label-text">Notes (optional)</label>
                <input value={movement.notes} onChange={e => setMovement(m => ({ ...m, notes: e.target.value }))} className="input-field" placeholder="Reason or reference" />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleMovement} className="btn-primary flex-1 py-2.5">Save Movement</motion.button>
                <button onClick={() => setMovementModal(null)} className="btn-outline px-5 py-2.5">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
