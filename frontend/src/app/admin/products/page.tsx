"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit3, Trash2, Eye, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { Toggle } from "@/components/ui";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProducts({ page, perPage, search });
      setProducts(data.products);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await adminApi.deleteProduct(id);
      toast.success(res.message || "Product deleted");
      fetchProducts();
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleActive = async (product: any) => {
    const fd = new FormData();
    fd.append("isActive", String(!product.isActive));
    try {
      await adminApi.updateProduct(product.id, fd);
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    } catch (err: any) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#0C1E39" }}>Products</h1>
          <p className="text-sm mt-1" style={{ color: "#4A5568" }}>{total} total products</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </motion.button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..." className="input-field pl-9 text-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }} />
        </div>
        <button onClick={fetchProducts} className="btn-outline p-2.5" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}><RefreshCw size={16} /></button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#0C1E39", color: "#F8F8F8" }}>
                {["Image", "Name", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(12, 30, 57, 0.08)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(12, 30, 57, 0.08)" }} /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center" style={{ color: "#4A5568" }}>No products found</td></tr>
              ) : products.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition-colors border-b"
                  style={{ color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.08)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden" style={{ background: "#F8F8F8", border: "1px solid rgba(12, 30, 57, 0.08)" }}>
                      {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-gray-200" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold line-clamp-1 max-w-[200px]" style={{ color: "#0C1E39" }}>{p.name}</p>
                    {p.brand && <p className="text-xs" style={{ color: "#6B7280" }}>{p.brand}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#6B7280" }}>{p.sku}</td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold" style={{ color: "#0C1E39" }}>₹{Number(p.sellingPrice).toFixed(2)}</p>
                    {Number(p.discountPercent) > 0 && <p className="text-xs" style={{ color: "var(--or)" }}>-{p.discountPercent}% off</p>}
                  </td>
                  <td className="px-4 py-3">
                    {p.inventory?.[0] ? (
                      <span className={`badge ${p.inventory[0].qtyInStock <= p.inventory[0].lowStockThreshold ? "badge-warning" : "badge-success"}`}>
                        {p.inventory[0].qtyInStock}
                      </span>
                    ) : <span style={{ color: "#6B7280" }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle checked={p.isActive} onChange={() => toggleActive(p)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/products/${p.slug}`} target="_blank">
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#0C1E39" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--or)"; (e.currentTarget as HTMLElement).style.background = "rgba(12, 30, 57, 0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#0C1E39"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}><Eye size={14} /></button>
                      </Link>
                      <Link href={`/admin/products/${p.id}`}>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#0C1E39" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--or)"; (e.currentTarget as HTMLElement).style.background = "rgba(12, 30, 57, 0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#0C1E39"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}><Edit3 size={14} /></button>
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#0C1E39" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#0C1E39"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
            <p className="text-xs" style={{ color: "#4A5568" }}>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className="h-8 w-8 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: page === i + 1 ? "var(--or)" : "transparent", color: page === i + 1 ? "#FFFFFF" : "#0C1E39", border: page === i + 1 ? "none" : "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
