"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/useSettings";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    productsApi
      .list({ page: 1, perPage: 24 })
      .then((data) => {
        setProducts(data?.products || []);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const { raw: settingsRaw } = useSettings();
  const shopBadge = settingsRaw["shop_badge"] || "⚡ FUEL YOUR HUSTLE";
  const shopTitle = settingsRaw["shop_title"] || "Shop Product";
  const shopSubtext = settingsRaw["shop_subtext"] || "Performance-driven nutrition.";

  return (
    <main className="min-h-screen flex flex-col justify-between" style={{ background: "var(--gy)" }}>
      <div>
        <Navbar />

        <div className="pt-32 pb-16 px-6 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-block zbadge mb-4" style={{ background: "#0C1E39", color: "#FFFFFF", fontSize: "10px", letterSpacing: "1px" }}>
              {shopBadge}
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-3" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>
              {shopTitle.split(" ").map((w, idx) => (
                idx === shopTitle.split(" ").length - 1 ? (
                  <span key={idx} style={{ color: "var(--or)" }}>{w} </span>
                ) : (
                  w + " "
                )
              ))}
            </h1>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "#4A5568", fontWeight: 500 }}>
              {shopSubtext}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)" }} />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p style={{ color: "#4A5568" }}>Failed to load products. Please check back later.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: "#4A5568" }}>No products available right now.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
