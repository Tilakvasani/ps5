"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  slug: string;
  sellingPrice: number;
  basePrice: number;
  discountPercent: number;
  unit: string;
  hsnCode: string;
  brand?: string;
  images: { imageUrl: string; isPrimary: boolean }[];
  _count?: { reviews: number };
  avgRating?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const discount = Number(product.discountPercent);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      sku: product.slug,
      price: Number(product.sellingPrice),
      qty: 1,
      imageUrl: primaryImage,
      unit: product.unit,
    });
    toast.success("Added to cart!");
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/products/${product.slug}`}>
        <div
          className="group rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(244,124,65,0.4)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 24px rgba(244,124,65,0.15)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(244,246,250,1)" }}>
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)" }}>
                <svg viewBox="0 0 24 24" className="w-16 h-16" fill="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 rounded-full px-2 py-1 text-[10px] font-bold text-[#111827]"
                style={{ background: "#F47C41", boxShadow: "0 0 10px rgba(244,124,65,0.5)" }}>
                -{discount}%
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            {product.brand && (
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#00F0FF" }}>
                {product.brand}
              </p>
            )}
            <h3 className="font-display font-semibold text-[#111827] text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>HSN: {product.hsnCode} · {product.unit}</p>

            {product.avgRating && (
              <div className="flex items-center gap-1 mb-3">
                <Star size={12} style={{ fill: "#F47C41", color: "#F47C41" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {product.avgRating.toFixed(1)} ({product._count?.reviews})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-[#111827]">₹{Number(product.sellingPrice).toFixed(2)}</span>
                {discount > 0 && (
                  <span className="ml-1 text-xs line-through" style={{ color: "rgba(255,255,255,0.3)" }}>
                    ₹{Number(product.basePrice).toFixed(2)}
                  </span>
                )}
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>+ GST</p>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[#111827] transition-all hover:scale-105 active:scale-95"
                style={{ background: "#F47C41", boxShadow: "0 0 14px rgba(244,124,65,0.45)" }}
              >
                <ShoppingCart size={12} /> Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}