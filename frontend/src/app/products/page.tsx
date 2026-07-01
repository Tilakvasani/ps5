"use client";
import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, LayoutGrid, ListFilter } from "lucide-react";
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
    <div className="pt-24 min-h-screen bg-[#FCFAF6]">
      {/* Header Banner */}
      <div className="border-b border-[#E8E2D9] bg-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#48C062]/5 blur-3xl" />
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] font-bold text-[#48C062] uppercase tracking-[0.15em] mb-2 block">Catalog</span>
            <h1 className="font-display text-4xl md:text-5xl font-black text-[#002A30] tracking-tight">Shop All Products</h1>
            <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">{total} items available</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#45353E] uppercase tracking-wider">Home</span>
            <span className="text-[#E8E2D9]">/</span>
            <span className="text-xs font-bold text-[#002A30] uppercase tracking-wider">Products</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filter Section */}
          <aside className={`lg:w-64 flex-shrink-0 ${filterOpen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden lg:block"}`}>
            <div className="space-y-8 sticky top-28 bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl border border-[#E8E2D9] lg:border-none">
              
              {/* Sidebar Header for Mobile Overlay */}
              <div className="flex items-center justify-between lg:hidden border-b border-[#E8E2D9] pb-4 mb-4">
                <h2 className="font-display font-bold text-lg text-[#002A30]">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="h-8 w-8 rounded-full bg-[#FCFAF6] flex items-center justify-center border border-[#E8E2D9] text-[#002A30]">
                  <X size={14} />
                </button>
              </div>

              {/* Header block for Desktop */}
              <div className="hidden lg:flex items-center justify-between border-b border-[#E8E2D9]/60 pb-3">
                <span className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider flex items-center gap-2">
                  <ListFilter size={16} className="text-[#48C062]" /> Filters
                </span>
                {(selectedCat || priceMin || priceMax || search) && (
                  <button onClick={clearFilters} className="text-[10px] font-sans font-bold text-[#48C062] uppercase tracking-widest hover:underline">Clear all</button>
                )}
              </div>

              {/* Search Block */}
              <div className="space-y-2">
                <label className="font-sans text-[10px] font-bold text-[#8C8276] uppercase tracking-[0.12em] block">Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                  <input
                    type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by name..." className="input-field pl-10 text-xs font-semibold rounded-xl"
                  />
                </div>
              </div>

              {/* Category Filter list */}
              <div className="space-y-3">
                <label className="font-sans text-[10px] font-bold text-[#8C8276] uppercase tracking-[0.12em] block">Categories</label>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => { setSelectedCat(""); setPage(1); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${!selectedCat ? "bg-[#48C062]/10 text-[#48C062]" : "text-[#45353E] hover:text-[#002A30] hover:bg-[#FCFAF6]"}`}>
                    ✓ All Categories
                  </button>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => { setSelectedCat(cat.slug); setPage(1); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${selectedCat === cat.slug ? "bg-[#48C062]/10 text-[#48C062]" : "text-[#45353E] hover:text-[#002A30] hover:bg-[#FCFAF6]"}`}>
                      ● {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <label className="font-sans text-[10px] font-bold text-[#8C8276] uppercase tracking-[0.12em] block">Price Range (₹)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                    placeholder="Min" className="input-field text-xs font-semibold py-2 px-3 rounded-xl text-center"
                  />
                  <span className="text-[#8C8276] font-bold text-xs">-</span>
                  <input
                    type="number" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                    placeholder="Max" className="input-field text-xs font-semibold py-2 px-3 rounded-xl text-center"
                  />
                </div>
              </div>

              {/* Mobile View Apply Button */}
              {filterOpen && (
                <button onClick={() => setFilterOpen(false)} className="btn-primary w-full py-3 font-sans text-xs uppercase tracking-wider font-bold">
                  Apply Filters
                </button>
              )}
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <div className="flex-1 min-w-0">
            {/* Sort Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap border-b border-[#E8E2D9]/40 pb-4">
              <button onClick={() => setFilterOpen(true)} className="lg:hidden btn-outline flex items-center gap-2 text-xs py-2.5 px-4 font-bold uppercase tracking-wider">
                <SlidersHorizontal size={12} /> Filters
              </button>
              
              <div className="hidden sm:flex items-center gap-2 text-[#8C8276]">
                <LayoutGrid size={14} className="text-[#002A30]" />
                <span className="text-xs font-semibold">Grid View</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-bold text-[#8C8276] uppercase tracking-wider">Sort by:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="input-field w-auto text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer bg-white">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active filters display tags */}
            {(selectedCat || priceMin || priceMax || search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCat && <span className="flex items-center gap-1.5 badge badge-silver text-xs font-bold uppercase tracking-wider">{selectedCat} <button onClick={() => setSelectedCat("")}><X size={10} /></button></span>}
                {(priceMin || priceMax) && <span className="flex items-center gap-1.5 badge badge-silver text-xs font-bold uppercase tracking-wider">₹{priceMin || "0"}–{priceMax || "Max"} <button onClick={() => { setPriceMin(""); setPriceMax(""); }}><X size={10} /></button></span>}
                {search && <span className="flex items-center gap-1.5 badge badge-silver text-xs font-bold uppercase tracking-wider">"{search}" <button onClick={() => setSearch("")}><X size={10} /></button></span>}
              </div>
            )}

            {/* Loading placeholder skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-3xl border border-[#E8E2D9] bg-white aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-[#E8E2D9] shadow-soft">
                <div className="h-16 w-16 bg-[#FCFAF6] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#E8E2D9]">
                  <X size={28} className="text-[#8C8276]" />
                </div>
                <p className="font-display font-bold text-xl text-[#002A30] mb-2">No products found</p>
                <p className="text-xs text-[#8C8276] mb-6">Try refining your selection keywords or price points.</p>
                <button onClick={clearFilters} className="btn-primary text-xs uppercase tracking-widest font-bold py-2.5 px-6">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination buttons */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(i + 1)}
                    className={`h-10 w-10 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? "bg-[#48C062] text-white shadow-md shadow-[#48C062]/20" : "border border-[#E8E2D9] bg-white text-[#45353E] hover:border-[#48C062] hover:text-[#48C062]"}`}>
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <Suspense fallback={
        <div className="pt-40 flex justify-center py-24">
          <div className="h-8 w-8 rounded-full border-2 border-[#48C062] border-t-transparent animate-spin" />
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
