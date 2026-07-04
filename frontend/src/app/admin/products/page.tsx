"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.getProducts({ search }).then((d: any) => {
      setProducts(Array.isArray(d) ? d : d.products || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try { await adminApi.deleteProduct(id); toast.success("Deleted!"); setProducts(p => p.filter(x => x.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0)  return <span className="zbadge zbadge-rd">OUT OF STOCK</span>;
    if (stock <= 10) return <span className="zbadge zbadge-am">LOW STOCK</span>;
    return <span className="zbadge zbadge-gr">ACTIVE</span>;
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>PRODUCTS</h1>
        <Link href="/admin/products/new" className="zbtn-or" style={{ fontSize:"11px", padding:"9px 16px" }}>
          <Plus size={13} /> ADD PRODUCT
        </Link>
      </div>

      <div style={{ position:"relative", marginBottom:"16px" }}>
        <Search size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#888" }} />
        <input className="zinp" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:"34px" }} />
      </div>

      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"42px 1.6fr 0.8fr 0.7fr 0.8fr 100px 70px" }}>
          <span></span><span>PRODUCT</span><span>SKU</span><span>PRICE</span><span>STOCK</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {loading ? (
          [...Array(5)].map((_,i) => (
            <div key={i} className="ztr" style={{ gridTemplateColumns:"42px 1.6fr 0.8fr 0.7fr 0.8fr 100px 70px", background: i%2?"#FFF":"#FAFAFA" }}>
              {[...Array(7)].map((_,j) => <div key={j} style={{ height:"14px", background:"#F0F0F0", borderRadius:"4px" }} />)}
            </div>
          ))
        ) : products.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:"13px" }}>
            {search ? `No products matching "${search}"` : "No products yet. "}<Link href="/admin/products/new" style={{ color:"#FF4500", fontWeight:700, textDecoration:"none" }}>Add one!</Link>
          </div>
        ) : products.map((p, i) => (
          <div key={p.id} className="ztr" style={{ gridTemplateColumns:"42px 1.6fr 0.8fr 0.7fr 0.8fr 100px 70px", background: i%2?"#FFF":"#FAFAFA" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"6px", background:"#F0F0F0", border:"1.5px solid #0A0A0A", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={p.name} /> : <span style={{ fontSize:"14px" }}>📦</span>}
            </div>
            <div><div style={{ fontWeight:800, fontSize:"12px" }}>{p.name}</div><div style={{ fontSize:"10px", color:"#888" }}>{p.unit}</div></div>
            <span style={{ fontSize:"11px", color:"#888", fontWeight:600 }}>{p.hsnCode || p.slug}</span>
            <span style={{ fontSize:"13px", fontWeight:800 }}>₹{Number(p.sellingPrice||0).toFixed(0)}</span>
            <span style={{ fontSize:"12px", fontWeight:700, color:(p.stock??999)<=0?"#DC2626":(p.stock??999)<=10?"#F59E0B":"#0A0A0A" }}>
              {p.stock ?? "—"} units
            </span>
            {getStockBadge(p.stock ?? 999)}
            <div style={{ display:"flex", gap:"10px" }}>
              <Link href={`/admin/products/${p.id}`}><Edit size={15} color="#FF4500" /></Link>
              <button onClick={() => handleDelete(p.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}><Trash2 size={15} color="#DC2626" /></button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"12px" }}>
        <span style={{ fontSize:"11px", color:"#888", fontWeight:700 }}>SHOWING {products.length} PRODUCTS</span>
      </div>
    </div>
  );
}
