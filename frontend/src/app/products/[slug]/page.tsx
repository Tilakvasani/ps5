"use client";
import { useSettings } from "@/lib/useSettings";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Package, ChevronLeft, Minus, Plus, Droplets, Zap, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { productsApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";

const HOW_TO_USE = [
  { icon: Droplets, step: "1", title: "Drop It",         desc: "Drop the tablet into a glass of water (250ml)" },
  { icon: Zap,      step: "2", title: "Watch the Magic", desc: "Watch the fizz! Let it dissolve completely" },
  { icon: CheckCircle, step: "3", title: "Vibe On",      desc: "Sip and get back to work, powered up!" },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "howto" | "nutrition" | "specs" | "reviews">("desc");
  const { addToCart } = useStore();
  const { cgstRate, sgstRate } = useSettings();

  useEffect(() => {
    productsApi.get(params.slug)
      .then((d) => { setProduct(d); if (d.variants?.length) setSelectedVariant(d.variants[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <main className="min-h-screen bg-[#F4F6FA]"><Navbar />
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-[#F47C41] border-t-transparent animate-spin" />
      </div>
    </main>
  );

  if (!product) return (
    <main className="min-h-screen bg-[#F4F6FA]"><Navbar />
      <div className="pt-40 text-center text-[#6B7280]">Product not found</div>
    </main>
  );

  const price     = selectedVariant ? Number(selectedVariant.price) : Number(product.sellingPrice);
  const cgst      = price * qty * cgstRate;
  const sgst      = price * qty * sgstRate;
  const rawTotal  = price * qty + cgst + sgst;
  const total     = Math.round(rawTotal);
  const roundOffDiff = total - rawTotal;
  const cgstPct   = (cgstRate * 100).toFixed(1);
  const sgstPct   = (sgstRate * 100).toFixed(1);
  const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const images    = product.images?.length ? product.images : [{ imageUrl: null }];

  const handleAddToCart = () => {
    addToCart({ productId: product.id, variantId: selectedVariant?.id, name: product.name, sku: product.sku, price, qty, imageUrl: primaryImage, unit: product.unit });
    toast.success("Added to cart! 🛒");
  };

  // Parse nutritional facts from product meta or description
  const nutritionalFacts = product.nutritionalFacts || null;

  const TABS = [
    { id: "desc",      label: "Description" },
    { id: "howto",     label: "How to Use" },
    { id: "nutrition", label: "Nutrition" },
    { id: "specs",     label: "Specifications" },
    { id: "reviews",   label: `Reviews (${product._count?.reviews || 0})` },
  ] as const;

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
                <div className="w-full h-full flex items-center justify-center text-[#111827]/20"><Package size={80} /></div>
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
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedVariant?.id === v.id ? "border-[#F47C41] bg-[#F47C41]/20 text-[#F47C41]" : "border-[#D9DEE8] text-[#6B7280]"}`}>
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
                <div className="flex justify-between"><span>CGST @{cgstPct}%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @{sgstPct}%</span><span>₹{sgst.toFixed(2)}</span></div>
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-xs text-[#9CA3AF] italic"><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-[#111827] border-t border-[#D9DEE8] pt-2 mt-1"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              </div>
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3 rounded-xl border border-[#D9DEE8] bg-[#F4F6FA] p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors"><Minus size={14} /></button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors"><Plus size={14} /></button>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                <ShoppingCart size={16} /> Add to Cart
              </motion.button>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                This is a <strong>health supplement</strong> and not for medicinal use. Not intended to diagnose, treat, cure, or prevent any disease. Consult your doctor before use if pregnant, nursing, or on medication.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="mt-12 rounded-2xl border border-[#D9DEE8] overflow-hidden">
          <div className="flex border-b border-[#D9DEE8] overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-[#F47C41] border-b-2 border-[#F47C41]" : "text-[#6B7280] hover:text-[#111827] bg-[#F4F6FA]"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 bg-white">

            {/* Description */}
            {activeTab === "desc" && (
              <div className="text-sm text-[#374151] leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || "No description available." }} />
              </div>
            )}

            {/* How to Use */}
            {activeTab === "howto" && (
              <div>
                <h3 className="font-display font-black text-xl text-[#111827] mb-6">How to Use <span className="text-[#F47C41]">(The Cool Way)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {HOW_TO_USE.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F4F6FA] border border-[#D9DEE8]">
                      <div className="h-14 w-14 rounded-2xl bg-[#F47C41]/10 flex items-center justify-center mb-4">
                        <step.icon size={24} className="text-[#F47C41]" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest text-[#F47C41] mb-1">Step {step.step}</div>
                      <h4 className="font-display font-bold text-[#111827] mb-2">{step.title}</h4>
                      <p className="text-sm text-[#6B7280]">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-[#F47C41]/5 border border-[#F47C41]/20">
                  <p className="text-sm text-[#374151]">
                    <span className="font-bold text-[#F47C41]">Pro tip:</span> Use cold water for the best fizz experience. One tablet per 250ml glass. Take daily for best results.
                  </p>
                </div>
              </div>
            )}

            {/* Nutritional Facts */}
            {activeTab === "nutrition" && (
              <div>
                <h3 className="font-display font-black text-xl text-[#111827] mb-6">Nutritional Facts</h3>
                {nutritionalFacts ? (
                  <div className="max-w-sm border-4 border-[#111827] rounded-lg p-4">
                    <p className="text-2xl font-black text-[#111827] border-b-8 border-[#111827] pb-2 mb-2">Nutrition Facts</p>
                    <p className="text-sm text-[#374151] mb-2">Per serving</p>
                    <div className="border-t-4 border-[#111827] space-y-1">
                      {Object.entries(nutritionalFacts).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-sm py-0.5 border-b border-[#D9DEE8]">
                          <span className="text-[#374151] capitalize">{key}</span>
                          <span className="font-bold text-[#111827]">{val as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-sm border-4 border-[#111827] rounded-lg p-4">
                    <p className="text-2xl font-black text-[#111827] border-b-8 border-[#111827] pb-2 mb-2">Nutrition Facts</p>
                    <p className="text-xs text-[#6B7280] mb-3">Per tablet (approx. values)</p>
                    <div className="border-t-4 border-[#111827] space-y-1">
                      {[["Energy","20 kcal"],["Carbohydrates","5g"],["Sugars","<1g"],["Sodium","300mg"],["Potassium","200mg"],["Magnesium","100mg"],["Vitamin C","100mg"],["Vitamin B6","1.4mg"],["Zinc","5mg"]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm py-0.5 border-b border-[#D9DEE8]">
                          <span className="text-[#374151]">{k}</span>
                          <span className="font-bold text-[#111827]">{v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-3">* Approximate values. Actual values may vary by variant.</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {activeTab === "specs" && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#D9DEE8]">
                  {[["SKU", product.sku],["HSN Code", product.hsnCode],["Unit", product.unit],["Brand", product.brand || "—"],["Category", product.category?.name || "—"]].map(([k, v]) => (
                    <tr key={k}><td className="py-3 text-[#6B7280] w-1/3 font-medium">{k}</td><td className="py-3 text-[#111827]">{v}</td></tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Reviews */}
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
                      <p className="text-[#6B7280] text-sm">{r.body}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[#6B7280] text-sm">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}