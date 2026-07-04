"use client";
import Link from "next/link";
import { ShoppingCart, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: number; name: string; slug: string;
  sellingPrice: number; basePrice: number; discountPercent: number;
  unit: string; hsnCode: string; brand?: string;
  images: { imageUrl: string; isPrimary: boolean }[];
  _count?: { reviews: number }; avgRating?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const primaryImage = product.images?.find(i => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const discount = Number(product.discountPercent);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product.id, name: product.name, sku: product.slug, price: Number(product.sellingPrice), qty: 1, imageUrl: primaryImage, unit: product.unit });
    toast.success("Added to cart!");
  };

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
      <div className="zpcard" style={{ cursor: "pointer" }}>

        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#F8F8F8", borderBottom: "1.5px solid var(--bd-soft)" }}>
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={48} color="#E0E0E0" />
            </div>
          )}
          {discount > 0 && (
            <div className="zbadge zbadge-or" style={{ position: "absolute", top: "10px", left: "10px" }}>
              -{discount}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "14px" }}>
          {product.brand && (
            <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", letterSpacing: "1px", marginBottom: "4px" }}>
              {product.brand.toUpperCase()}
            </div>
          )}
          <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#627d98", lineHeight: 1.2, marginBottom: "4px", letterSpacing: "-0.3px" }}>
            {product.name}
          </h3>
          <p style={{ fontSize: "10px", color: "#8f9cae", fontWeight: 600, marginBottom: "8px" }}>
            {product.unit}
          </p>

          {product.avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
              <span style={{ fontSize: "10px", color: "var(--or)", fontWeight: 900 }}>★★★★★</span>
              <span style={{ fontSize: "10px", color: "#8f9cae", fontWeight: 600 }}>
                {product.avgRating.toFixed(1)} ({product._count?.reviews})
              </span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "-0.5px", color: "#f8f8f8" }}>
                ₹{Number(product.sellingPrice).toFixed(0)}
              </span>
              {discount > 0 && (
                <span style={{ fontSize: "11px", color: "#8f9cae", textDecoration: "line-through", marginLeft: "6px", fontWeight: 600 }}>
                  ₹{Number(product.basePrice).toFixed(0)}
                </span>
              )}
            </div>
            <button onClick={handleAddToCart} className="zbtn-or" style={{ padding: "8px 12px", fontSize: "11px", gap: "4px" }}>
              <ShoppingCart size={12} /> ADD
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
