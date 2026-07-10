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
  { icon: Truck,     label: "Order Now | Est. Delivery: 5–7 Days" },
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
  const [selectedFlavor, setSelectedFlavor] = useState("Orange");
  const [selectedPack, setSelectedPack] = useState(1);
  const { addToCart, token } = useStore();
  const { cgstRate, sgstRate } = useSettings();

  useEffect(() => {
    productsApi.get(params.slug)
      .then((d) => { 
        setProduct(d); 
        if (d.variants?.length) setSelectedVariant(d.variants[0]);
        if (d.flavors) {
          const flvs = d.flavors.split(",").map((s: string) => s.trim()).filter(Boolean);
          if (flvs.length) setSelectedFlavor(flvs[0]);
        } else {
          setSelectedFlavor("Orange");
        }
      })
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

  const unitPrice    = selectedVariant ? Number(selectedVariant.price) : Number(product.sellingPrice);
  const price        = unitPrice * selectedPack;
  const cgst         = price * qty * cgstRate;
  const sgst         = price * qty * sgstRate;
  const rawTotal     = price * qty + cgst + sgst;
  const total        = Math.round(rawTotal);
  const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const images       = product.images?.length ? product.images : [{ imageUrl: null }];
  const nutritionalFacts = product.nutritionalFacts || null;

  const handleAddToCart = () => {
    addToCart({ 
      productId: product.id, 
      variantId: selectedVariant?.id, 
      name: `${product.name} (Pack of ${selectedPack}) - ${selectedFlavor}`, 
      sku: product.sku, 
      price, 
      qty, 
      imageUrl: primaryImage, 
      unit: product.unit,
      pack: selectedPack
    });
    toast.success("Added to cart! 🛒");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 🔗");
    }
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
                  <ShoppingCart size={14}/> Add To Cart · ₹{total}
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
            <div className="relative rounded-3xl overflow-hidden aspect-square mb-4 shadow-sm flex items-center justify-center p-6"
              style={{ background: C.altBg, border: `1.5px solid ${C.border}` }}>
              {images[activeImage]?.imageUrl ? (
                <img src={images[activeImage].imageUrl} alt={product.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-[1.03]"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: C.border }}><Package size={80}/></div>
              )}

              {/* Discount badge removed */}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden transition-all flex items-center justify-center p-2"
                    style={{ border: `2px solid ${activeImage===i ? C.mintHex : C.border}` }}>
                    {img.imageUrl ? <img src={img.imageUrl} alt="" className="max-w-full max-h-full object-contain"/> : <div className="w-full h-full" style={{ background: C.surface }}/>}
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
                  <span className="text-[9px] font-semibold leading-tight mt-0.5" style={{ color: C.blue }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mintHex, letterSpacing: "0.15em" }}>{product.brand}</p>
            )}
            <div className="flex justify-between items-start gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.blue, letterSpacing: "-0.03em" }}>
                {product.name}
              </h1>
              <button onClick={handleShare} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold hover:opacity-85 transition-opacity shrink-0" style={{ borderColor: C.border, color: C.blue, background: C.surface }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
              </button>
            </div>

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
            {/* Flavors */}
            {(() => {
              const flavors = product.flavors 
                ? product.flavors.split(",").map((s: string) => s.trim()).filter(Boolean) 
                : ["Orange"];
              return (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2" style={{ color: C.blue }}>Flavor: {selectedFlavor}</p>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((f: string) => (
                      <button key={f} onClick={() => setSelectedFlavor(f)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150"
                        style={{
                          border: `1.5px solid ${selectedFlavor===f ? "#ff5c00" : C.border}`,
                          background: selectedFlavor===f ? "#ff5c00" : C.surface,
                          color: selectedFlavor===f ? "#ffffff" : C.mid,
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Packs */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2" style={{ color: C.blue }}>Packs: Pack Of {selectedPack}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { pack: 1, label: "Pack Of 1", sub: "15 Tablets" },
                  { pack: 2, label: "Pack Of 2", sub: "30 Tablets" },
                  { pack: 3, label: "Pack Of 3", sub: "45 Tablets" },
                  { pack: 4, label: "Pack Of 4", sub: "60 Tablets" }
                ].map((item) => (
                  <button key={item.pack} onClick={() => setSelectedPack(item.pack)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-150 text-center"
                    style={{
                      border: `1.5px solid ${selectedPack===item.pack ? "#ffb800" : C.border}`,
                      background: selectedPack===item.pack ? "#ffb800" : C.surface,
                      color: selectedPack===item.pack ? "#051124" : C.blue,
                      minHeight: "72px"
                    }}>
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                    <span className="text-[10px] opacity-75 mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price card — dark surface */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: "#0c1e39", border: `1.5px solid ${C.border}`, color: "#ffffff" }}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold" style={{ color: "#ffffff", letterSpacing: "-0.04em" }}>
                  <span className="text-lg font-bold mr-1.5 uppercase" style={{ verticalAlign: "middle", color: "#ffffff" }}>mrp:</span>
                  ₹{Math.round(price * (1 + cgstRate + sgstRate))}
                </span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#f8f8f8", opacity: 0.8 }}>includes all taxes</p>
              {qty > 1 && (
                <div className="text-sm mt-3 pt-3" style={{ color: "#f8f8f8", borderTop: `1.5px solid rgba(255, 255, 255, 0.1)` }}>
                  <div className="flex justify-between font-bold text-base" style={{ color: "#ffffff" }}>
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
                <ShoppingCart size={18}/> Add To Cart
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
              <div key={tab.id} id={`accordion-${tab.id}`} className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)", background: "#0c1e39" }}>
                <button
                  onClick={() => setActiveTab(isOpen ? "" : tab.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-base font-bold transition-all text-left"
                  style={{ color: "#ffffff" }}
                >
                  <span>{label}</span>
                  <span className="transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#ffffff" }}>
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
                      <div className="p-6 md:p-8" style={{ background: "#0c1e39", borderTop: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                        {tab.id === "desc" && (
                          <div className="text-sm leading-relaxed" style={{ color: "#f8f8f8", opacity: 0.85 }}>
                            <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
                          </div>
                        )}

                        {tab.id === "howto" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-8" style={{ color: "#ffffff" }}>
                              How to Use — <span style={{ color: "#ff5c00" }}>The Simple Way</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                              {HOW_TO_USE.map((step,i) => (
                                <div key={i}
                                  className="flex flex-col items-center text-center p-7 rounded-2xl"
                                  style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: "rgba(255,92,0,0.1)" }}>
                                    <step.icon size={22} style={{ color: "#ff5c00" }}/>
                                  </div>
                                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#ff5c00", letterSpacing: "0.15em" }}>
                                    Step {step.step}
                                  </div>
                                  <h4 className="font-bold text-lg mb-2" style={{ color: "#ffffff" }}>{step.title}</h4>
                                  <p className="text-sm" style={{ color: "#f8f8f8", opacity: 0.85 }}>{step.desc}</p>
                                </div>
                              ))}
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,92,0,0.1)", border: "1.5px solid rgba(255,92,0,0.25)" }}>
                              <p className="text-sm" style={{ color: "#ffffff" }}>
                                <span className="font-bold" style={{ color: "#ffb800" }}>Pro tip:</span> Use cold water for best fizz. One tablet per 200 ml glass. Take daily for best results.
                              </p>
                            </div>
                          </div>
                        )}

                        {tab.id === "nutrition" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-8" style={{ color: "#ffffff" }}>Nutritional Facts</h3>
                            <div className="max-w-sm rounded-2xl overflow-hidden" style={{ border: "2px solid rgba(255, 255, 255, 0.1)" }}>
                              <div className="p-5" style={{ background: "#051124" }}>
                                <p className="text-xl font-bold" style={{ color: "#ffffff" }}>Nutrition Facts</p>
                                <p className="text-xs mt-1" style={{ color: "#f8f8f8", opacity: 0.7 }}>Per tablet (approx. values)</p>
                              </div>
                              <div className="divide-y" style={{ background: "#0c1e39", borderColor: "rgba(255, 255, 255, 0.1)" }}>
                                {(nutritionalFacts?Object.entries(nutritionalFacts):[
                                  ["Energy","20 kcal"],["Carbohydrates","5g"],["Sugars","<1g"],
                                  ["Sodium","300mg"],["Potassium","200mg"],["Magnesium","100mg"],
                                  ["Vitamin C","100mg"],["Vitamin B6","1.4mg"],["Zinc","5mg"]
                                ]).map(([k,v]) => (
                                  <div key={k as string} className="flex justify-between px-5 py-3 text-sm" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                    <span style={{ color: "#f8f8f8", opacity: 0.85 }}>{k as string}</span>
                                    <span className="font-semibold" style={{ color: "#ffffff" }}>{v as string}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="px-5 py-3" style={{ background: "#051124", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                <p className="text-[10px]" style={{ color: "#f8f8f8", opacity: 0.6 }}>* Approximate values. Actual values may vary by variant.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {tab.id === "specs" && (
                          <div>
                            <h3 className="font-bold text-2xl mb-6" style={{ color: "#ffffff" }}>Specifications</h3>
                            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                              {[["Brand",product.brand||"—"],["Category",product.category?.name||"—"]].map(([k,v],i,arr) => (
                                <div key={k} className="flex text-sm" style={{ background: i%2===0 ? "#0c1e39" : "#051124", borderBottom: i<arr.length-1?"1px solid rgba(255, 255, 255, 0.1)":"none" }}>
                                  <div className="w-1/3 px-5 py-4 font-semibold" style={{ color: "#f8f8f8", opacity: 0.85 }}>{k}</div>
                                  <div className="flex-1 px-5 py-4" style={{ color: "#ffffff" }}>{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tab.id === "reviews" && (
                          <div className="space-y-8">
                            <div>
                              <h3 className="font-bold text-2xl mb-6" style={{ color: "#ffffff" }}>Customer Reviews</h3>
                              {product.reviews?.length ? (
                                <div className="space-y-4">
                                  {product.reviews.map((r: any) => (
                                    <div key={r.id} className="p-5 rounded-2xl" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: "rgba(255, 255, 255, 0.2)"} : {}}/>)}</div>
                                        <span className="font-semibold text-sm" style={{ color: "#ffffff" }}>{r.user?.name}</span>
                                      </div>
                                      {r.title && <p className="font-medium mb-1" style={{ color: "#ffffff" }}>{r.title}</p>}
                                      <p className="text-sm" style={{ color: "#f8f8f8", opacity: 0.85 }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {FALLBACK_REVIEWS.map((r) => (
                                    <div key={r.id} className="p-5 rounded-2xl" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: "rgba(255, 255, 255, 0.2)"} : {}}/>)}</div>
                                        <span className="font-semibold text-sm" style={{ color: "#ffffff" }}>{r.name}</span>
                                      </div>
                                      <p className="font-medium mb-1" style={{ color: "#ffffff" }}>{r.title}</p>
                                      <p className="text-sm" style={{ color: "#f8f8f8", opacity: 0.85 }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="rounded-3xl p-6" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                              <h3 className="font-bold text-xl mb-5" style={{ color: "#ffffff" }}>Write a Review</h3>

                              {!token ? (
                                <div className="text-center py-6">
                                  <p className="text-sm mb-3" style={{ color: "#f8f8f8", opacity: 0.85 }}>Please sign in to leave a review</p>
                                  <a href="/login" className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: C.mint }}>Sign In</a>
                                </div>
                              ) : reviewSuccess ? (
                                <div className="text-center py-6">
                                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: C.mintHex }} />
                                  <p className="font-bold" style={{ color: "#ffffff" }}>Thank you for your review!</p>
                                  <p className="text-sm mt-1" style={{ color: "#f8f8f8", opacity: 0.85 }}>It will appear after approval.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-semibold block mb-2" style={{ color: "#ffffff" }}>Your Rating</label>
                                    <div className="flex gap-1">
                                      {Array.from({length:5}).map((_,i) => (
                                        <button key={i} type="button"
                                          onMouseEnter={() => setReviewHover(i+1)}
                                          onMouseLeave={() => setReviewHover(0)}
                                          onClick={() => setReviewRating(i+1)}>
                                          <Star size={28}
                                            className={(reviewHover || reviewRating) > i ? "fill-yellow-400 text-yellow-400" : ""}
                                            style={(reviewHover || reviewRating) > i ? {} : {color: "rgba(255, 255, 255, 0.2)"}} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: "#ffffff" }}>Review Title <span className="font-normal opacity-60">(optional)</span></label>
                                    <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                                      placeholder="e.g. Great product!"
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                      style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)", background: "#0c1e39", color: "#ffffff" }} />
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: "#ffffff" }}>Your Review</label>
                                    <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                                      rows={4} placeholder="Share your experience with this product..."
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                      style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)", background: "#0c1e39", color: "#ffffff" }} />
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
