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
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Link href={`/products/${product.slug}`}>
        <div className="group rounded-3xl overflow-hidden border border-[#E8E2D9] bg-white shadow-soft transition-all duration-300 hover:shadow-premium hover:border-[#48C062]/20">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#FCFAF6] border-b border-[#E8E2D9]">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#E8E2D9]">
                <HeartPulse size={48} />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <div className="rounded-lg px-2.5 py-1 text-[10px] font-sans font-bold text-white bg-[#48C062] uppercase tracking-wider">
                  -{discount}%
                </div>
              )}
              {product.avgRating && product.avgRating >= 4.5 && (
                <div className="rounded-lg px-2.5 py-1 text-[10px] font-sans font-bold text-[#002A30] bg-[#FCFAF6] border border-[#E8E2D9] uppercase tracking-wider">
                  Best Seller
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            {/* Rating + Brand */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.avgRating ? (
                <div className="flex items-center gap-1 bg-[#FFF9EB] px-2 py-0.5 rounded-lg border border-[#F0D5A8]">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-sans font-bold text-[#002A30]">
                    {product.avgRating.toFixed(1)} ({product._count?.reviews || 0})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-[#FCFAF6] px-2 py-0.5 rounded-lg border border-[#E8E2D9]">
                  <Star size={10} className="text-[#8C8276]" />
                  <span className="text-[10px] font-sans font-bold text-[#8C8276]">New</span>
                </div>
              )}
              {product.brand && (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#8C8276]">
                  {product.brand}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-sm text-[#002A30] leading-snug mb-1 line-clamp-2 group-hover:text-[#48C062] transition-colors">{product.name}</h3>
            <p className="text-[10px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mb-4">{product.unit} · {product.sku}</p>

            <div className="flex items-center justify-between border-t border-[#E8E2D9]/40 pt-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-sans font-bold text-[#002A30]">₹{Number(product.sellingPrice).toFixed(0)}</span>
                  {discount > 0 && (
                    <span className="text-[11px] line-through text-[#8C8276]">
                      ₹{Number(product.basePrice).toFixed(0)}
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-sans font-bold text-[#8C8276] uppercase tracking-wider">Incl. GST</p>
              </div>
              
              {/* Green Circle Plus Button */}
              <button
                onClick={handleAddToCart}
                className="h-9 w-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 bg-[#48C062] hover:bg-[#359E4C] shadow-sm"
                title="Add to cart"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
