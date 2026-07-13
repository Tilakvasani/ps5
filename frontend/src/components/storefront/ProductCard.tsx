"use client";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useSettings } from "@/lib/useSettings";

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
  inventory?: { qtyInStock: number; lowStockThreshold: number }[];
  _count?: { reviews: number };
  avgRating?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const { cgstRate, sgstRate } = useSettings();
  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const discount = Number(product.discountPercent);
  const finalPrice = Math.round(Number(product.sellingPrice) * (1 + cgstRate + sgstRate));

  const isOutOfStock = !product.inventory || product.inventory.length === 0 || product.inventory.every(inv => inv.qtyInStock <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
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
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
      <div className={`zpcard group ${isOutOfStock ? "opacity-90" : ""}`}>
        {/* Image */}
        <div
          className="relative overflow-hidden flex items-center justify-center p-4"
          style={{
            aspectRatio: "1/1",
            background: "#F8F8F8",
            borderBottom: "1.5px solid #EAEAEA",
          }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ color: "#0C1E39" }}
            >
              💊
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div 
              className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <span 
                className="px-3.5 py-1.5 text-[10px] font-black tracking-widest text-white rounded-lg uppercase shadow-sm"
                style={{ backgroundColor: "#E53E3E" }}
              >
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px" }}>
          {product.brand && (
            <p style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              {product.brand}
            </p>
          )}
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#0C1E39",
              lineHeight: 1.3,
              marginBottom: "4px",
              letterSpacing: "-0.02em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h3>
          <p style={{ fontSize: "10px", color: "#6B7280", marginBottom: "8px" }}>
            {product.unit}
          </p>

          {product.avgRating && (
            <div className="flex items-center gap-1" style={{ marginBottom: "8px" }}>
              <Star size={11} style={{ fill: "#FFB800", color: "#FFB800" }} />
              <span style={{ fontSize: "10px", color: "#6B7280" }}>
                {product.avgRating.toFixed(1)} ({product._count?.reviews})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontSize: "15px", fontWeight: 900, color: "#FF5C00", letterSpacing: "-0.5px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", marginRight: "3px", textTransform: "uppercase" }}>mrp</span>₹{finalPrice}
              </span>
              <p style={{ fontSize: "9px", color: "#6B7280", marginTop: "1px" }}>includes all taxes</p>
            </div>
            {isOutOfStock ? (
              <button
                disabled
                className="bg-gray-200 text-gray-400 font-bold border-none text-[10px] tracking-wide"
                style={{ padding: "8px 12px", borderRadius: "30px", cursor: "not-allowed" }}
              >
                SOLD OUT
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="zbtn-or animate-pulse-subtle"
                style={{ padding: "8px 16px", fontSize: "11px", borderRadius: "30px" }}
              >
                <ShoppingCart size={11} /> ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
