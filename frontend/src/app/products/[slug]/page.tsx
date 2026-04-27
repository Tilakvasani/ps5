"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Package, ChevronLeft, Minus, Plus } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { productsApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const { addToCart } = useStore();

  useEffect(() => {
    productsApi.get(params.slug)
      .then((d) => { setProduct(d); if (d.variants?.length) setSelectedVariant(d.variants[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <main className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
      <Navbar />
      <div className="h-8 w-8 rounded-full border-2 border-[#F47C41] border-t-transparent animate-spin mt-20" />
    </main>
  );

  if (!product) return (
    <main className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      <div className="pt-40 text-center text-[#6B7280]">Product not found</div>
    </main>
  );

  const price = selectedVariant ? Number(selectedVariant.price) : Number(product.sellingPrice);
  const cgst = price * qty * 0.025;
  const sgst = price * qty * 0.025;
  const rawTotal = price * qty + cgst + sgst;
  const total = Math.round(rawTotal);
  const roundOffDiff = total - rawTotal;
  const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const images = product.images?.length ? product.images : [{ imageUrl: null }];

  const handleAddToCart = () => {
    addToCart({ productId: product.id, variantId: selectedVariant?.id, name: product.name, sku: product.sku, price, qty, imageUrl: primaryImage, unit: product.unit });
    toast.success("Added to cart!");
  };

  return (
    <main className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8">
          <Link href="/products" className="flex items-center gap-1 hover:text-[#F47C41] transition-colors"><ChevronLeft size={14} /> Products</Link>
          <span>/</span>
          <span className="text-[#374151]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="rounded-2xl border border-[#D9DEE8] bg-[#F4F6FA] aspect-square overflow-hidden mb-4">
              {images[activeImage]?.imageUrl ? (
                <img src={images[activeImage].imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#111827]/20">
                  <Package size={80} />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 h-20 w-20 rounded-xl border-2 overflow-hidden transition-all ${activeImage === i ? "border-[#F47C41]" : "border-[#D9DEE8]"}`}>
                    {img.imageUrl ? <img src={img.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#F4F6FA]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && <p className="text-xs font-bold uppercase tracking-widest text-[#F47C41] mb-2">{product.brand}</p>}
            <h1 className="text-3xl font-display font-black text-[#111827] mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4 text-sm text-[#6B7280]">
              <span>SKU: {product.sku}</span>
              <span>HSN: {product.hsnCode}</span>
              <span>Unit: {product.unit}</span>
            </div>

            {/* Rating */}
            {product.avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < Math.round(product.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-[#111827]/30"} />)}</div>
                <span className="text-sm text-[#6B7280]">{product.avgRating?.toFixed(1)} ({product._count?.reviews} reviews)</span>
              </div>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#374151] mb-2">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedVariant?.id === v.id ? "border-[#F47C41] bg-[#F47C41]/20 text-[#F47C41]" : "border-[#D9DEE8] text-[#6B7280] hover:border-[#D9DEE8]"}`}>
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="card mb-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-display font-black text-[#111827]">₹{price.toFixed(2)}</span>
                {Number(product.discountPercent) > 0 && (
                  <span className="text-lg text-[#6B7280] line-through">₹{Number(product.basePrice).toFixed(2)}</span>
                )}
                <span className="badge badge-success">{Number(product.discountPercent) > 0 ? `-${product.discountPercent}%` : "In Stock"}</span>
              </div>
              <div className="border-t border-[#D9DEE8] pt-3 text-sm space-y-1 text-[#6B7280]">
                <div className="flex justify-between"><span>Price (×{qty})</span><span>₹{(price * qty).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>CGST @2.5%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @2.5%</span><span>₹{sgst.toFixed(2)}</span></div>
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-xs text-[#9CA3AF] italic">
                    <span>Round Off</span>
                    <span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#111827] border-t border-[#D9DEE8] pt-2 mt-1"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              </div>
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 rounded-xl border border-[#D9DEE8] bg-[#F4F6FA] p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#FFFFFF] transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#FFFFFF] transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                <ShoppingCart size={16} /> Add to Cart
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="rounded-2xl border border-[#D9DEE8] overflow-hidden">
              <div className="flex border-b border-[#D9DEE8]">
                {(["desc", "specs", "reviews"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-[#FFFFFF] text-[#111827]" : "text-[#6B7280] hover:text-[#0B2C6F]"}`}>
                    {tab === "desc" ? "Description" : tab === "specs" ? "Specifications" : `Reviews (${product._count?.reviews || 0})`}
                  </button>
                ))}
              </div>
              <div className="p-5 text-sm text-[#374151] leading-relaxed">
                {activeTab === "desc" && <div dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || "No description available." }} />}
                {activeTab === "specs" && (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-white/10">
                      {[["SKU", product.sku], ["HSN Code", product.hsnCode], ["Unit", product.unit], ["Brand", product.brand || "—"], ["Category", product.category?.name || "—"]].map(([k, v]) => (
                        <tr key={k}><td className="py-2 text-[#6B7280] w-1/3">{k}</td><td className="py-2 text-[#111827]">{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === "reviews" && (
                  product.reviews?.length ? (
                    <div className="space-y-4">
                      {product.reviews.map((r: any) => (
                        <div key={r.id} className="border-b border-[#D9DEE8] pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}</div>
                            <span className="font-semibold text-[#111827] text-xs">{r.user?.name}</span>
                          </div>
                          {r.title && <p className="text-[#111827] font-medium mb-1">{r.title}</p>}
                          <p className="text-[#6B7280]">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p>No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
