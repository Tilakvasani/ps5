"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ productId:"", type:"IN", qty:"", note:"" });

  const load = async () => {
    setLoading(true);
    try {
      const [inv, mov] = await Promise.all([adminApi.getInventory(), adminApi.getMovements()]);
      setInventory(Array.isArray(inv) ? inv : inv.items || []);
      setMovements(Array.isArray(mov) ? mov : mov.movements || []);
    } catch {} setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addMovement = async () => {
    try {
      await adminApi.addMovement({ productId:Number(form.productId), type:form.type, qty:Number(form.qty), note:form.note });
      toast.success("Inventory updated!"); setModal(false); setForm({ productId:"", type:"IN", qty:"", note:"" }); load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>INVENTORY</h1>
        <button onClick={() => setModal(true)} className="zbtn-or" style={{ fontSize:"11px", padding:"9px 16px" }}>
          <Plus size={13} /> ADD MOVEMENT
        </button>
      </div>

      {/* Stock overview */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"10px", marginBottom:"20px" }}>
        {inventory.map((item: any) => {
          const stock = item.stock ?? item.quantity ?? 0;
          const color = stock <= 0 ? "#DC2626" : stock <= 10 ? "#F59E0B" : "#16A34A";
          return (
            <div key={item.id || item.productId} className="zcard" style={{ borderTop:`3px solid ${color}` }}>
              <div style={{ fontSize:"11px", fontWeight:800, marginBottom:"4px", letterSpacing:"-0.2px" }}>{item.name || item.product?.name}</div>
              <div style={{ fontSize:"22px", fontWeight:900, letterSpacing:"-1px", color }}>{stock}</div>
              <div style={{ fontSize:"10px", color:"#888", fontWeight:700 }}>UNITS IN STOCK</div>
            </div>
          );
        })}
        {!loading && inventory.length === 0 && (
          <div style={{ padding:"20px", color:"#888", fontSize:"13px", gridColumn:"1/-1" }}>No inventory data yet.</div>
        )}
      </div>

      {/* Movements table */}
      <div style={{ fontSize:"12px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"10px" }}>RECENT MOVEMENTS</div>
      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"1.5fr 0.8fr 0.6fr 1.2fr 0.8fr" }}>
          <span>PRODUCT</span><span>TYPE</span><span>QTY</span><span>NOTE</span><span>DATE</span>
        </div>
        {movements.slice(0,20).map((m: any, i: number) => (
          <div key={m.id} className="ztr" style={{ gridTemplateColumns:"1.5fr 0.8fr 0.6fr 1.2fr 0.8fr", background:i%2?"#FFF":"#FAFAFA" }}>
            <span style={{ fontSize:"12px", fontWeight:700 }}>{m.product?.name || m.productId}</span>
            <span className={`zbadge ${m.type==="IN"?"zbadge-gr":"zbadge-rd"}`}>{m.type}</span>
            <span style={{ fontWeight:800, fontSize:"13px" }}>{m.type==="OUT" ? `-${m.qty}` : `+${m.qty}`}</span>
            <span style={{ fontSize:"11px", color:"#888" }}>{m.note || "—"}</span>
            <span style={{ fontSize:"11px", fontWeight:600 }}>{new Date(m.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}</span>
          </div>
        ))}
        {!loading && movements.length === 0 && <div style={{ padding:"30px", textAlign:"center", color:"#888", fontSize:"13px" }}>No movements recorded.</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="zcard" style={{ width:"100%", maxWidth:"380px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div style={{ fontSize:"14px", fontWeight:900 }}>ADD INVENTORY MOVEMENT</div>
              <button onClick={() => setModal(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={16} /></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <div>
                <div className="zlabel">Product</div>
                <select className="zinp" value={form.productId} onChange={e => setForm(f => ({ ...f, productId:e.target.value }))}>
                  <option value="">Select product</option>
                  {inventory.map((item: any) => <option key={item.id} value={item.productId || item.id}>{item.name || item.product?.name}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <div>
                  <div className="zlabel">Type</div>
                  <select className="zinp" value={form.type} onChange={e => setForm(f => ({ ...f, type:e.target.value }))}>
                    <option value="IN">Stock In (+)</option>
                    <option value="OUT">Stock Out (-)</option>
                  </select>
                </div>
                <div>
                  <div className="zlabel">Quantity</div>
                  <input className="zinp" type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty:e.target.value }))} />
                </div>
              </div>
              <div>
                <div className="zlabel">Note (optional)</div>
                <input className="zinp" placeholder="e.g. Restocked from supplier" value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))} />
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={() => setModal(false)} className="zbtn-out" style={{ flex:1, justifyContent:"center" }}>CANCEL</button>
                <button onClick={addMovement} className="zbtn-or" style={{ flex:2, justifyContent:"center" }}>SAVE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
