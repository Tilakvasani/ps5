"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit3, Trash2, Eye, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

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
      await adminApi.deleteProduct(id);
      toast.success("Product deleted");
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
          <h1 className="text-3xl font-black text-[#1D3557]">Products</h1>
          <p className="text-[#4A6A82] text-sm mt-1">{total} total products</p>
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6A82]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..." className="input-field pl-9 text-sm" />
        </div>
        <button onClick={fetchProducts} className="btn-outline p-2.5"><RefreshCw size={16} /></button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C8DCEA] text-[#4A6A82] text-left">
                {["Image", "Name", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded bg-[#F1FAFF] animate-pulse" /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#4A6A82]">No products found</td></tr>
              ) : products.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-[#F1FAFF] transition-colors">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded-lg bg-[#F1FAFF] overflow-hidden border border-[#C8DCEA]">
                      {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1D3557] line-clamp-1 max-w-[200px]">{p.name}</p>
                    {p.brand && <p className="text-xs text-[#4A6A82]">{p.brand}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[#4A6A82] text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-[#4A6A82]">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#1D3557]">₹{Number(p.sellingPrice).toFixed(2)}</p>
                    {Number(p.discountPercent) > 0 && <p className="text-xs text-[#45B08C]">-{p.discountPercent}% off</p>}
                  </td>
                  <td className="px-4 py-3">
                    {p.inventory?.[0] ? (
                      <span className={`badge ${p.inventory[0].qtyInStock <= p.inventory[0].lowStockThreshold ? "badge-warning" : "badge-success"}`}>
                        {p.inventory[0].qtyInStock}
                      </span>
                    ) : <span className="text-[#4A6A82]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.isActive ? "bg-[#45B08C]" : "bg-[#FFFFFF]"}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.isActive ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/products/${p.slug}`} target="_blank">
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4A6A82] hover:text-[#1D3557] hover:bg-[#FFFFFF] transition-all"><Eye size={14} /></button>
                      </Link>
                      <Link href={`/admin/products/${p.id}`}>
                        <button className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4A6A82] hover:text-[#45B08C] hover:bg-[#EBF7F3] transition-all"><Edit3 size={14} /></button>
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4A6A82] hover:text-red-400 hover:bg-red-400/10 transition-all">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#C8DCEA]">
            <p className="text-xs text-[#4A6A82]">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${page === i + 1 ? "bg-[#45B08C] text-[#1D3557]" : "text-[#4A6A82] hover:bg-[#FFFFFF]"}`}>
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
