"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, HeartPulse } from "lucide-react";
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
          className="group rounded-2xl overflow-hidden transition-all duration-300 bg-[#C8DCEA]"
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#C3E5D9";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px transparent";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#C8DCEA";
            
          }}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#F1FAFF]">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#C8DCEA]">
                <HeartPulse size={56} />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 rounded-full px-2 py-1 text-[10px] font-bold text-white"
                style={{ background: "#45B08C" }}>
                -{discount}%
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            {product.brand && (
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-[#45B08C]">
                {product.brand}
              </p>
            )}
            <h3 className="font-semibold text-[#1D3557] text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-xs mb-3 text-[#7A9BB5]">HSN: {product.hsnCode} · {product.unit}</p>

            {product.avgRating && (
              <div className="flex items-center gap-1 mb-3">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-[#4A6A82]">
                  {product.avgRating.toFixed(1)} ({product._count?.reviews})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-[#1D3557]">₹{Number(product.sellingPrice).toFixed(2)}</span>
                {discount > 0 && (
                  <span className="ml-1 text-xs line-through text-[#7A9BB5]">
                    ₹{Number(product.basePrice).toFixed(2)}
                  </span>
                )}
                <p className="text-[10px] text-[#7A9BB5]">+ GST</p>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 bg-[#45B08C] hover:bg-[#389475]"
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
