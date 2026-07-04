"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("best");

  useEffect(() => {
    productsApi.list().then(d => { setProducts(d.products || d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = (Array.isArray(products) ? products : [])
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "price-asc" ? a.sellingPrice - b.sellingPrice : sort === "price-desc" ? b.sellingPrice - a.sellingPrice : b.id - a.id);

  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div style={{ background: "var(--dk)", padding: "28px 24px", borderBottom: "1.5px solid var(--bd-soft)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#627D98", letterSpacing: "1px", marginBottom: "6px" }}>
            <Link href="/" style={{ color: "#627D98", textDecoration: "none" }}>HOME</Link> / SHOP
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-2px", color: "#FFF", lineHeight: 1 }}>
            ALL PRODUCTS
          </h1>
          <div style={{ fontSize: "12px", color: "#8F9CAE", fontWeight: 600, marginTop: "6px" }}>
            {filtered.length} products dropping heat
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Search + Sort Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input className="zinp" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }} />
          <select className="zinp" value={sort} onChange={e => setSort(e.target.value)} style={{ width: "180px" }}>
            <option value="best">Sort: Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          {search && (
            <button onClick={() => setSearch("")} className="zbtn-out" style={{ padding: "10px 14px" }}>
              <X size={14} /> CLEAR
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "14px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)", borderRadius: "10px", height: "280px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "14px" }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔍</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px", color: "var(--wh)" }}>NO RESULTS FOUND</h2>
            <p style={{ color: "#8F9CAE", fontSize: "13px", marginBottom: "20px" }}>Try a different search term</p>
            <button onClick={() => setSearch("")} className="zbtn-or" style={{ borderRadius: "30px" }}>CLEAR SEARCH</button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
