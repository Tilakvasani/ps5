"use client";
import { useSettings } from "@/lib/useSettings";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Package, ChevronLeft, Minus, Plus,
  Droplets, Zap, CheckCircle, AlertCircle, Shield, Award,
  Truck, RotateCcw, Microscope, Leaf, ChevronRight
} from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { productsApi, publicApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { CertLogo } from "@/components/storefront/CertLogos";

/* ── Simple HTML sanitizer (strips script/iframe tags) ── */
function sanitizeHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "")
             .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
             .replace(/on\w+="[^"]*"/gi, "")
             .replace(/on\w+='[^']*'/gi, "");
}

/* ── Dark navy/orange palette ── */
const C = {
  bg:      "var(--gy)",
  surface: "#FFFFFF",
  blue:    "#0C1E39",
  mint:    "var(--or)",
  mintHex: "#FF5C00",
  mintDim: "#FF5C00",
  border:  "rgba(12, 30, 57, 0.08)",
  mid:     "#4A5568",
  light:   "#6B7280",
  altBg:   "#F8F8F8",
};

const HOW_TO_USE = [
  { icon: Droplets,    step: "1", title: "Drop It",         desc: "Drop the tablet into a glass of water (200 ml)" },
  { icon: Zap,         step: "2", title: "Watch the Magic", desc: "Watch the fizz! Let it dissolve completely" },
  { icon: CheckCircle, step: "3", title: "Vibe On",         desc: "Sip and get back to work, powered up!" },
];

const TRUST_BADGES = [
  { logoLabel: "GMP",   label: "GMP Certified"  },
  { logoLabel: "FSSAI", label: "FSSAI Approved" },
  { logoLabel: "HACCP", label: "HACCP Certified" },
  { logoLabel: "ISO",   label: "ISO 9001:2015"  },
];

const FALLBACK_REVIEWS = [
  { id: "f1", name: "Rohan Mehta",     rating: 5, title: "Great energy boost", body: "Dissolves fast and tastes great. I feel more hydrated after workouts." },
  { id: "f2", name: "Priya Sharma",    rating: 5, title: "Perfect for summer", body: "Keeps me going through Ahmedabad heat. No sugar crash, just steady energy." },
  { id: "f3", name: "Arjun Patel",     rating: 4, title: "Good taste, works well", body: "Orange flavour is refreshing and not too sweet. Repeat customer now." },
  { id: "f4", name: "Sneha Iyer",      rating: 5, title: "Helped with fatigue", body: "Used it during a work trip and it really helped with tiredness and cramps." },
  { id: "f5", name: "Vikram Nair",     rating: 4, title: "Solid daily supplement", body: "Easy to carry the tube around. Fizzes up nicely in cold water." },
  { id: "f6", name: "Ananya Reddy",    rating: 5, title: "My gym essential now", body: "Take it post workout every day. Noticeably less soreness the next day." },
];

const DELIVERY_PERKS = [
  { icon: RotateCcw, label: "Easy 48 hours return"               },
  { icon: Shield,    label: "100% authentic & safe"              },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("desc");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const { addToCart, token } = useStore();
  const { cgstRate, sgstRate } = useSettings();

  useEffect(() => {
    productsApi.get(params.slug)
      .then((d) => { setProduct(d); if (d.variants?.length) setSelectedVariant(d.variants[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    const handler = () => setStickyVisible(window.scrollY > 460);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: C.bg }}><Navbar />
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.mintHex }} />
      </div>
    </main>
  );

  if (!product) return (
    <main style={{ minHeight: "100vh", background: C.bg }}><Navbar />
      <div className="pt-40 text-center" style={{ color: C.mid }}>Product not found</div>
    </main>
  );

  const price        = selectedVariant ? Number(selectedVariant.price) : Number(product.sellingPrice);
  const cgst         = price * qty * cgstRate;
  const sgst         = price * qty * sgstRate;
  const rawTotal     = price * qty + cgst + sgst;
  const total        = Math.round(rawTotal);
  const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const images       = product.images?.length ? product.images : [{ imageUrl: null }];
  const nutritionalFacts = product.nutritionalFacts || null;

  const handleAddToCart = () => {
    addToCart({ productId: product.id, variantId: selectedVariant?.id, name: product.name, sku: product.sku, price, qty, imageUrl: primaryImage, unit: product.unit });
    toast.success("Added to cart! 🛒");
  };

  const handleScrollToReviews = () => {
    setActiveTab("reviews");
    setTimeout(() => {
      const el = document.getElementById("accordion-reviews");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const TABS = [
    { id: "desc",      label: "Description" },
    { id: "howto",     label: "How to Use" },
    { id: "nutrition", label: "Nutrition" },
    { id: "specs",     label: "Specifications" },
    { id: "reviews",   label: `Reviews (${product.reviews?.length ? product._count?.reviews || product.reviews.length : FALLBACK_REVIEWS.length})` },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: C.bg }}>
      <Navbar />

      {/* ── Sticky Buy Bar ── */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 px-4"
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 rounded-2xl px-6 py-3"
              style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
              <div className="flex items-center gap-3 min-w-0">
                {primaryImage && <img src={primaryImage} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" style={{ border: `1px solid ${C.border}` }} />}
                <div className="min-w-0">
                  <p className="font-bold truncate text-sm" style={{ color: C.blue }}>{product.name}</p>
                  <p className="text-xs" style={{ color: C.mid }}>₹{price.toFixed(0)} per unit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 rounded-xl p-1" style={{ border: `1.5px solid ${C.border}`, background: C.bg }}>
                  <button onClick={() => setQty(Math.max(1,qty-1))} className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: C.blue }}><Minus size={12}/></button>
                  <span className="w-6 text-center text-sm font-bold" style={{ color: C.blue }}>{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: C.blue }}><Plus size={12}/></button>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="btn-primary flex items-center gap-2 py-2 px-5 text-sm"
                  style={{ color: "#ffffff" }}>
                  <ShoppingCart size={14}/> Claim Your Energy · ₹{total}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: C.mid }}>
          <Link href="/products" className="flex items-center gap-1 transition-colors"
            style={{ color: C.mid }}
            onMouseEnter={e => (e.currentTarget.style.color = C.mintHex)}
            onMouseLeave={e => (e.currentTarget.style.color = C.mid)}
          >
            <ChevronLeft size={14}/> Products
          </Link>
          <ChevronRight size={12} style={{ color: C.border }}/>
          <span style={{ color: C.blue }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Images ── */}
          <div>
            <div className="relative rounded-3xl overflow-hidden aspect-square mb-4 shadow-sm"
              style={{ background: C.altBg, border: `1.5px solid ${C.border}` }}>
              {images[activeImage]?.imageUrl ? (
                <img src={images[activeImage].imageUrl} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: C.border }}><Package size={80}/></div>
              )}

              {/* Discount badge removed */}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden transition-all"
                    style={{ border: `2px solid ${activeImage===i ? C.mintHex : C.border}` }}>
                    {img.imageUrl ? <img src={img.imageUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full" style={{ background: C.surface }}/>}
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges — dark tiles */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {TRUST_BADGES.map((b, i) => (
                <div key={i}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center justify-between min-h-[76px]"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                  <div className="h-6 flex items-center justify-center">
                    <CertLogo label={b.logoLabel} className="h-5 object-contain" />
                  </div>
                  <span className="text-[9px] font-semibold leading-tight mt-0.5" style={{ color: "#F8F8F8" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mintHex, letterSpacing: "0.15em" }}>{product.brand}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight" style={{ color: C.blue, letterSpacing: "-0.03em" }}>
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-5">
              <button 
                onClick={handleScrollToReviews}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i) => (
                      <Star key={i} size={13} className={i < Math.round(product.avgRating || 5) ? "fill-yellow-400 text-yellow-400" : ""}
                        style={i >= Math.round(product.avgRating || 5) ? { color: C.border } : {}}/>
                    ))}
                  </div>
                  <span className="text-sm font-bold ml-1" style={{ color: C.blue }}>{(product.avgRating || 5).toFixed(1)}</span>
                </div>
                <span className="text-sm border-b border-dashed hover:text-[var(--or)] hover:border-[var(--or)] transition-colors" style={{ color: C.mid, borderColor: C.border }}>
                  ({product.reviews?.length ? product._count?.reviews || product.reviews.length : FALLBACK_REVIEWS.length} reviews)
                </span>
              </button>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: C.blue }}>Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150"
                      style={{
                        border: `1.5px solid ${selectedVariant?.id===v.id ? C.mintHex : C.border}`,
                        background: selectedVariant?.id===v.id ? "rgba(255,92,0,0.15)" : C.surface,
                        color: selectedVariant?.id===v.id ? C.mintHex : C.mid,
                      }}>
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price card — dark surface */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold" style={{ color: C.blue, letterSpacing: "-0.04em" }}>
                  <span className="text-lg font-bold text-[#F8F8F8] mr-1.5 uppercase" style={{ verticalAlign: "middle", color: C.blue }}>mrp:</span>
                  ₹{Math.round(price * (1 + cgstRate + sgstRate))}
                </span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: C.light }}>includes all taxes</p>
              {qty > 1 && (
                <div className="text-sm mt-3 pt-3" style={{ color: C.mid, borderTop: `1.5px solid ${C.border}` }}>
                  <div className="flex justify-between font-bold text-base" style={{ color: C.blue }}>
                    <span>Total Price (×{qty})</span><span>₹{total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-2 rounded-xl p-1" style={{ border: `1.5px solid ${C.border}`, background: C.surface }}>
                <button onClick={() => setQty(Math.max(1,qty-1))}
                  className="h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: C.blue }}>
                  <Minus size={14}/>
                </button>
                <span className="w-8 text-center font-bold text-lg" style={{ color: C.blue }}>{qty}</span>
                <button onClick={() => setQty(qty+1)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: C.blue }}>
                  <Plus size={14}/>
                </button>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base"
                style={{ color: "#ffffff" }}>
                <ShoppingCart size={18}/> Claim Your Energy
              </motion.button>
            </div>

            {/* Delivery perks */}
            <div className="space-y-2 mb-5">
              {DELIVERY_PERKS.map((perk,i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: C.mid }}>
                  <perk.icon size={14} style={{ color: C.mintHex }} className="shrink-0"/>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>

            {/* Science link block removed */}

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-4 rounded-2xl" style={{ background: "rgba(255,92,0,0.07)", border: "1.5px solid rgba(255,92,0,0.2)" }}>
              <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: C.mintHex }}/>
              <p className="text-xs leading-relaxed" style={{ color: C.blue }}>
                This is a <strong>health supplement</strong> and not for medicinal use. Not intended to diagnose, treat, cure, or prevent any disease. Consult your doctor before use if pregnant, nursing, or on medication.
              </p>
            </div>
          </div>
        </div>

        {/* ── Accordion List (Dropdown style) ── */}
        <div className="mt-16 space-y-4">
          {TABS.map((tab) => {
            const isOpen = activeTab === tab.id;
            const label = tab.id === "reviews" 
              ? `Reviews (${product.reviews?.length || 0})` 
              : tab.label;
            
            return (
              <div key={tab.id} id={`accordion-${tab.id}`} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.border}`, background: C.surface }}>
                <button
                  onClick={() => setActiveTab(isOpen ? "" : tab.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-base font-bold transition-all text-left"
                  style={{ color: isOpen ? C.mintHex : C.blue }}
                >
                  <span>{label}</span>
                  <span className="transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: C.mintHex }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="p-6 md:p-8" style={{ background: C.altBg, borderTop: `1.5px solid ${C.border}` }}>
                        {tab.id === "desc" && (
                          <div className="text-sm leading-relaxed" style={{ color: C.mid }}>
                            <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
                          </div>
                        )}

                        {tab.id === "howto" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-8" style={{ color: C.blue }}>
                              How to Use — <span style={{ color: C.mintHex }}>The Simple Way</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                              {HOW_TO_USE.map((step,i) => (
                                <div key={i}
                                  className="flex flex-col items-center text-center p-7 rounded-2xl"
                                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: "rgba(255,92,0,0.1)" }}>
                                    <step.icon size={22} style={{ color: C.mintHex }}/>
                                  </div>
                                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mintHex, letterSpacing:"0.15em" }}>
                                    Step {step.step}
                                  </div>
                                  <h4 className="font-bold text-lg mb-2" style={{ color: C.blue }}>{step.title}</h4>
                                  <p className="text-sm" style={{ color: C.mid }}>{step.desc}</p>
                                </div>
                              ))}
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,92,0,0.08)", border: "1.5px solid rgba(255,92,0,0.2)" }}>
                              <p className="text-sm" style={{ color: C.blue }}>
                                <span className="font-bold" style={{ color: C.mintHex }}>Pro tip:</span> Use cold water for best fizz. One tablet per 200 ml glass. Take daily for best results.
                              </p>
                            </div>
                          </div>
                        )}

                        {tab.id === "nutrition" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-8" style={{ color: C.blue }}>Nutritional Facts</h3>
                            <div className="max-w-sm rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.border}` }}>
                              <div className="p-5" style={{ background: C.surface }}>
                                <p className="text-xl font-bold" style={{ color: C.blue }}>Nutrition Facts</p>
                                <p className="text-xs mt-1" style={{ color: C.mid }}>Per tablet (approx. values)</p>
                              </div>
                              <div className="divide-y" style={{ background: C.altBg, borderColor: C.border }}>
                                {(nutritionalFacts?Object.entries(nutritionalFacts):[
                                  ["Energy","20 kcal"],["Carbohydrates","5g"],["Sugars","<1g"],
                                  ["Sodium","300mg"],["Potassium","200mg"],["Magnesium","100mg"],
                                  ["Vitamin C","100mg"],["Vitamin B6","1.4mg"],["Zinc","5mg"]
                                ]).map(([k,v]) => (
                                  <div key={k as string} className="flex justify-between px-5 py-3 text-sm" style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <span style={{ color: C.mid }}>{k as string}</span>
                                    <span className="font-semibold" style={{ color: C.blue }}>{v as string}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="px-5 py-3" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
                                <p className="text-[10px]" style={{ color: C.light }}>* Approximate values. Actual values may vary by variant.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {tab.id === "specs" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-6" style={{ color: C.blue }}>Specifications</h3>
                            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.border}` }}>
                              {[["Brand",product.brand||"—"],["Category",product.category?.name||"—"]].map(([k,v],i,arr) => (
                                <div key={k} className="flex text-sm" style={{ background: i%2===0 ? C.altBg : C.surface, borderBottom: i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                                  <div className="w-1/3 px-5 py-4 font-semibold" style={{ color: C.mid }}>{k}</div>
                                  <div className="flex-1 px-5 py-4" style={{ color: C.blue }}>{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tab.id === "reviews" && (
                          <div className="space-y-8">
                            <div>
                              <h3 className="font-bold text-2xl mb-6" style={{ color: C.blue }}>Customer Reviews</h3>
                              {product.reviews?.length ? (
                                <div className="space-y-4">
                                  {product.reviews.map((r: any) => (
                                    <div key={r.id} className="p-5 rounded-2xl" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: C.border} : {}}/>)}</div>
                                        <span className="font-semibold text-sm" style={{ color: C.blue }}>{r.user?.name}</span>
                                      </div>
                                      {r.title && <p className="font-medium mb-1" style={{ color: C.blue }}>{r.title}</p>}
                                      <p className="text-sm" style={{ color: C.mid }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {FALLBACK_REVIEWS.map((r) => (
                                    <div key={r.id} className="p-5 rounded-2xl" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: C.border} : {}}/>)}</div>
                                        <span className="font-semibold text-sm" style={{ color: C.blue }}>{r.name}</span>
                                      </div>
                                      <p className="font-medium mb-1" style={{ color: C.blue }}>{r.title}</p>
                                      <p className="text-sm" style={{ color: C.mid }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="rounded-3xl p-6" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                              <h3 className="font-bold text-xl mb-5" style={{ color: C.blue }}>Write a Review</h3>

                              {!token ? (
                                <div className="text-center py-6">
                                  <p className="text-sm mb-3" style={{ color: C.mid }}>Please sign in to leave a review</p>
                                  <a href="/login" className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: C.mint }}>Sign In</a>
                                </div>
                              ) : reviewSuccess ? (
                                <div className="text-center py-6">
                                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: C.mintHex }} />
                                  <p className="font-bold" style={{ color: C.blue }}>Thank you for your review!</p>
                                  <p className="text-sm mt-1" style={{ color: C.mid }}>It will appear after approval.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-semibold block mb-2" style={{ color: C.blue }}>Your Rating</label>
                                    <div className="flex gap-1">
                                      {Array.from({length:5}).map((_,i) => (
                                        <button key={i} type="button"
                                          onMouseEnter={() => setReviewHover(i+1)}
                                          onMouseLeave={() => setReviewHover(0)}
                                          onClick={() => setReviewRating(i+1)}>
                                          <Star size={28}
                                            className={(reviewHover || reviewRating) > i ? "fill-yellow-400 text-yellow-400" : ""}
                                            style={(reviewHover || reviewRating) > i ? {} : {color: C.border}} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: C.blue }}>Review Title <span className="font-normal opacity-60">(optional)</span></label>
                                    <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                                      placeholder="e.g. Great product!"
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                      style={{ border: `1.5px solid ${C.border}`, background: C.altBg, color: C.blue }} />
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: C.blue }}>Your Review</label>
                                    <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                                      rows={4} placeholder="Share your experience with this product..."
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                      style={{ border: `1.5px solid ${C.border}`, background: C.altBg, color: C.blue }} />
                                  </div>

                                  <button
                                    disabled={!reviewBody.trim() || reviewSubmitting}
                                    onClick={async () => {
                                      if (!reviewBody.trim()) return;
                                      setReviewSubmitting(true);
                                      try {
                                        await publicApi.submitReview({ productId: product.id, rating: reviewRating, title: reviewTitle || undefined, body: reviewBody });
                                        setReviewSuccess(true);
                                      } catch (err: any) {
                                        toast.error(err.response?.data?.error || "Failed to submit review");
                                      }
                                      setReviewSubmitting(false);
                                    }}
                                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-50"
                                    style={{ background: C.mint }}>
                                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
