"use client";
import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

interface Product {
  id: number; name: string; slug: string;
  sellingPrice: number; basePrice: number; discountPercent: number;
  unit: string; hsnCode: string; brand?: string;
  images: { imageUrl: string; isPrimary: boolean }[];
  avgRating?: number; _count?: { reviews: number };
}
interface Category { id: number; name: string; slug: string; }

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

// BUG FIX: useSearchParams must be wrapped in Suspense in Next.js 13+
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const perPage = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.list({
        page, perPage, search, sort,
        category: selectedCat, priceMin, priceMax,
      });
      setProducts(data.products);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [page, search, sort, selectedCat, priceMin, priceMax]);

  useEffect(() => { productsApi.categories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(total / perPage);
  const clearFilters = () => { setSelectedCat(""); setPriceMin(""); setPriceMax(""); setSearch(""); setPage(1); };

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="relative border-b border-[#C8DCEA] py-12 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-[#45B08C]/10 " />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h1 className="text-4xl font-black text-[#1D3557] mb-2">All <span className="gradient-text">Products</span></h1>
          <p className="text-[#4A6A82]">{total} products available</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 flex-shrink-0 ${filterOpen ? "block" : "hidden lg:block"}`}>
          <div className="card sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#1D3557]">Filters</h2>
              <button onClick={clearFilters} className="text-xs text-[#45B08C] hover:text-[#45B08C]">Clear all</button>
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-[#4A6A82] uppercase tracking-wider mb-2 block">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6A82]" />
                <input
                  type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search products..." className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-[#4A6A82] uppercase tracking-wider mb-2 block">Category</label>
              <div className="space-y-1">
                <button onClick={() => { setSelectedCat(""); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!selectedCat ? "bg-[#45B08C]/20 text-[#45B08C]" : "text-[#4A6A82] hover:text-[#1D3557] hover:bg-[#F1FAFF]"}`}>
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCat(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedCat === cat.slug ? "bg-[#45B08C]/20 text-[#45B08C]" : "text-[#4A6A82] hover:text-[#1D3557] hover:bg-[#F1FAFF]"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-[#4A6A82] uppercase tracking-wider mb-2 block">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" className="input-field text-sm" />
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" className="input-field text-sm" />
              </div>
              <button onClick={fetchProducts} className="mt-2 w-full btn-primary text-sm py-2">Apply</button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <button onClick={() => setFilterOpen(!filterOpen)} className="lg:hidden btn-outline flex items-center gap-2 text-sm py-2">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="ml-auto input-field w-auto text-sm py-2 cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active filters */}
          {(selectedCat || priceMin || priceMax || search) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCat && <span className="flex items-center gap-1 badge badge-info">{selectedCat} <button onClick={() => setSelectedCat("")}><X size={10} /></button></span>}
              {(priceMin || priceMax) && <span className="flex items-center gap-1 badge badge-info">₹{priceMin}–{priceMax} <button onClick={() => { setPriceMin(""); setPriceMax(""); }}><X size={10} /></button></span>}
              {search && <span className="flex items-center gap-1 badge badge-info">"{search}" <button onClick={() => setSearch("")}><X size={10} /></button></span>}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#C8DCEA] bg-[#F1FAFF] aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-[#4A6A82]">
              <p className="text-2xl mb-2">No products found</p>
              <button onClick={clearFilters} className="text-[#45B08C] hover:text-[#45B08C] text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition-all ${page === i + 1 ? "bg-[#45B08C] text-white" : "border border-[#C8DCEA] text-[#4A6A82] hover:border-[#C8DCEA] hover:text-[#1D3557]"}`}>
                  {i + 1}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#F1FAFF]">
      <Navbar />
      <Suspense fallback={
        <div className="pt-20 flex justify-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-[#45B08C] border-t-transparent animate-spin" />
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
