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
  _count?: { reviews: number };
  avgRating?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const { cgstRate, sgstRate } = useSettings();
  const primaryImage = product.images?.find((i) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const discount = Number(product.discountPercent);
  const finalPrice = Math.round(Number(product.sellingPrice) * (1 + cgstRate + sgstRate));

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
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
      <div className="zpcard group">
        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "1/1",
            background: "#F8F8F8",
            borderBottom: "1.5px solid var(--bd-soft)",
          }}
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ color: "#1E2D4A" }}
            >
              💊
            </div>
          )}
          {/* Discount badge removed */}
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
              color: "#627d98",
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
          <p style={{ fontSize: "10px", color: "#8F9CAE", marginBottom: "8px" }}>
            {product.unit}
          </p>

          {product.avgRating && (
            <div className="flex items-center gap-1" style={{ marginBottom: "8px" }}>
              <Star size={11} style={{ fill: "var(--or)", color: "var(--or)" }} />
              <span style={{ fontSize: "10px", color: "#8F9CAE" }}>
                {product.avgRating.toFixed(1)} ({product._count?.reviews})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontSize: "15px", fontWeight: 900, color: "#F8F8F8", letterSpacing: "-0.5px" }}>
                Price ₹{finalPrice}
              </span>
              <p style={{ fontSize: "9px", color: "#8F9CAE", marginTop: "1px" }}>includes all taxes</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="zbtn-or"
              style={{ padding: "8px 12px", fontSize: "11px", borderRadius: "7px" }}
            >
              <ShoppingCart size={11} /> ADD
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
