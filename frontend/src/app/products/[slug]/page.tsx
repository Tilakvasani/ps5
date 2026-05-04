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

/* ── Simple HTML sanitizer (strips script/iframe tags) ── */
function sanitizeHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "")
             .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
             .replace(/on\w+="[^"]*"/gi, "")
             .replace(/on\w+='[^']*'/gi, "");
}

/* ── Matte palette ── */
const C = {
  bg:      "#F1FAFF",
  surface: "#FFFFFF",
  blue:    "#1D3557",
  mint:    "#45B08C",
  mintDim: "#389475",
  border:  "#C8DCEA",
  mid:     "#4A6A82",
  light:   "#7A9BB5",
  altBg:   "#EBF7F3",
};

const HOW_TO_USE = [
  { icon: Droplets,    step: "1", title: "Drop It",         desc: "Drop the tablet into a glass of water (250ml)" },
  { icon: Zap,         step: "2", title: "Watch the Magic", desc: "Watch the fizz! Let it dissolve completely" },
  { icon: CheckCircle, step: "3", title: "Vibe On",         desc: "Sip and get back to work, powered up!" },
];

const TRUST_BADGES = [
  { icon: Shield,     label: "GMP Certified"  },
  { icon: Award,      label: "FSSAI Approved" },
  { icon: Microscope, label: "Lab Tested"     },
  { icon: Leaf,       label: "Clean Label"    },
];

const DELIVERY_PERKS = [
  { icon: Truck,     label: "Free delivery on orders above ₹499" },
  { icon: RotateCcw, label: "Easy 7-day returns"                 },
  { icon: Shield,    label: "100% authentic & safe"              },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc"|"howto"|"nutrition"|"specs"|"reviews">("desc");
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
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.mint }} />
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
  const roundOffDiff = total - rawTotal;
  const cgstPct      = (cgstRate * 100).toFixed(1);
  const sgstPct      = (sgstRate * 100).toFixed(1);
  const primaryImage = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
  const images       = product.images?.length ? product.images : [{ imageUrl: null }];
  const nutritionalFacts = product.nutritionalFacts || null;

  const handleAddToCart = () => {
    addToCart({ productId: product.id, variantId: selectedVariant?.id, name: product.name, sku: product.sku, price, qty, imageUrl: primaryImage, unit: product.unit });
    toast.success("Added to cart! 🛒");
  };

  const TABS = [
    { id: "desc",      label: "Description" },
    { id: "howto",     label: "How to Use" },
    { id: "nutrition", label: "Nutrition" },
    { id: "specs",     label: "Specifications" },
    { id: "reviews",   label: `Reviews (${product._count?.reviews || 0})` },
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
                  className="btn-primary flex items-center gap-2 py-2 px-5 text-sm">
                  <ShoppingCart size={14}/> Add to Cart · ₹{total}
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
            onMouseEnter={e => (e.currentTarget.style.color = C.mint)}
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
            <div
              className="relative rounded-2xl aspect-square overflow-hidden mb-4 group"
              style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
            >
              {images[activeImage]?.imageUrl ? (
                <img src={images[activeImage].imageUrl} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: C.border }}><Package size={80}/></div>
              )}
              {Number(product.discountPercent) > 0 && (
                <div className="absolute top-4 left-4 text-sm font-bold text-white px-3 py-1 rounded-xl"
                  style={{ background: C.mint }}>
                  -{product.discountPercent}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden transition-all"
                    style={{ border: `2px solid ${activeImage===i ? C.mint : C.border}` }}>
                    {img.imageUrl ? <img src={img.imageUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full" style={{ background: C.bg }}/>}
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges — flat matte tiles */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {TRUST_BADGES.map((b, i) => (
                <div key={i}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                  <b.icon size={16} style={{ color: C.mint }}/>
                  <span className="text-[10px] font-semibold leading-tight" style={{ color: C.blue }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mint, letterSpacing: "0.15em" }}>{product.brand}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight" style={{ color: C.blue, letterSpacing: "-0.03em" }}>
              {product.name}
            </h1>

            <div className="flex items-center flex-wrap gap-4 mb-4 text-sm" style={{ color: C.mid }}>
              <span>SKU: {product.sku}</span>
              <span>HSN: {product.hsnCode}</span>
              <span>Unit: {product.unit}</span>
            </div>

            {product.avgRating && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: "#FFFAEC", border: "1.5px solid #EFE0A0" }}>
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i) => (
                      <Star key={i} size={13} className={i<Math.round(product.avgRating)?"fill-yellow-400 text-yellow-400":""}
                        style={i>=Math.round(product.avgRating)?{color:C.border}:{}}/>
                    ))}
                  </div>
                  <span className="text-sm font-bold ml-1" style={{ color: C.blue }}>{product.avgRating?.toFixed(1)}</span>
                </div>
                <span className="text-sm" style={{ color: C.mid }}>({product._count?.reviews} reviews)</span>
              </div>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: C.blue }}>Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150"
                      style={{
                        border: `1.5px solid ${selectedVariant?.id===v.id ? C.mint : C.border}`,
                        background: selectedVariant?.id===v.id ? C.altBg : C.surface,
                        color: selectedVariant?.id===v.id ? C.mint : C.mid,
                      }}>
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price card — flat */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold" style={{ color: C.blue, letterSpacing: "-0.04em" }}>₹{price.toFixed(0)}</span>
                {Number(product.discountPercent)>0 && (
                  <span className="text-lg line-through" style={{ color: C.light }}>₹{Number(product.basePrice).toFixed(0)}</span>
                )}
                {Number(product.discountPercent)>0 && (
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-lg" style={{ background: C.altBg, color: C.mintDim }}>
                    {product.discountPercent}% off
                  </span>
                )}
              </div>
              <div className="text-sm space-y-1.5" style={{ color: C.mid, borderTop: `1.5px solid ${C.border}`, paddingTop: "12px" }}>
                <div className="flex justify-between"><span>Price (×{qty})</span><span>₹{(price*qty).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>CGST @{cgstPct}%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @{sgstPct}%</span><span>₹{sgst.toFixed(2)}</span></div>
                {roundOffDiff!==0 && (
                  <div className="flex justify-between text-xs italic" style={{ color: C.light }}>
                    <span>Round Off</span><span>{roundOffDiff>0?"+":""}₹{roundOffDiff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2" style={{ color: C.blue, borderTop: `1.5px solid ${C.border}` }}>
                  <span>Total</span><span>₹{total}</span>
                </div>
              </div>
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-2 rounded-xl p-1" style={{ border: `1.5px solid ${C.border}`, background: C.bg }}>
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
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base">
                <ShoppingCart size={18}/> Add to Cart
              </motion.button>
            </div>

            {/* Delivery perks */}
            <div className="space-y-2 mb-5">
              {DELIVERY_PERKS.map((perk,i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: C.mid }}>
                  <perk.icon size={14} style={{ color: C.mint }} className="shrink-0"/>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>

            {/* Science link — flat panel */}
            <Link href="/science"
              className="flex items-center justify-between p-4 rounded-2xl mb-4 group transition-colors duration-150"
              style={{ background: C.bg, border: `1.5px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.mint)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <div className="flex items-center gap-3">
                <Microscope size={18} style={{ color: C.blue }}/>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.blue }}>GMP · ISO · FSSAI · Lab Tested</p>
                  <p className="text-xs" style={{ color: C.mid }}>See our full quality standards →</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: C.mid }}/>
            </Link>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-4 rounded-2xl" style={{ background: "#FFFBF0", border: "1.5px solid #E8D8A0" }}>
              <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: "#9A6700" }}/>
              <p className="text-xs leading-relaxed" style={{ color: "#7A5200" }}>
                This is a <strong>health supplement</strong> and not for medicinal use. Not intended to diagnose, treat, cure, or prevent any disease. Consult your doctor before use if pregnant, nursing, or on medication.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.border}` }}>
          <div className="flex overflow-x-auto" style={{ background: C.bg, borderBottom: `1.5px solid ${C.border}` }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-6 py-4 text-sm font-semibold whitespace-nowrap relative transition-colors duration-150"
                style={{
                  background: activeTab===tab.id ? C.surface : "transparent",
                  color: activeTab===tab.id ? C.mint : C.mid,
                  borderBottom: activeTab===tab.id ? `2px solid ${C.mint}` : "2px solid transparent",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8" style={{ background: C.surface }}>

            {activeTab==="desc" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-sm leading-relaxed" style={{ color: C.mid }}>
                <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
              </motion.div>
            )}

            {activeTab==="howto" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <h3 className="font-bold text-2xl mb-8" style={{ color: C.blue }}>
                  How to Use — <span style={{ color: C.mint }}>The Simple Way</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  {HOW_TO_USE.map((step,i) => (
                    <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="flex flex-col items-center text-center p-7 rounded-2xl"
                      style={{ background: C.bg, border: `1.5px solid ${C.border}` }}>
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: C.altBg }}>
                        <step.icon size={22} style={{ color: C.mint }}/>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mint, letterSpacing:"0.15em" }}>
                        Step {step.step}
                      </div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: C.blue }}>{step.title}</h4>
                      <p className="text-sm" style={{ color: C.mid }}>{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl" style={{ background: C.altBg, border: `1.5px solid #C3E5D9` }}>
                  <p className="text-sm" style={{ color: C.blue }}>
                    <span className="font-bold" style={{ color: C.mint }}>Pro tip:</span> Use cold water for best fizz. One tablet per 250ml glass. Take daily for best results.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab==="nutrition" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <h3 className="font-bold text-2xl mb-8" style={{ color: C.blue }}>Nutritional Facts</h3>
                <div className="max-w-sm rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.blue}` }}>
                  <div className="p-5" style={{ background: C.blue }}>
                    <p className="text-xl font-bold text-white">Nutrition Facts</p>
                    <p className="text-white/60 text-xs mt-1">Per tablet (approx. values)</p>
                  </div>
                  <div className="divide-y bg-white" style={{ "--tw-divide-opacity": 1 } as any}>
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
                  <div className="px-5 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
                    <p className="text-[10px]" style={{ color: C.light }}>* Approximate values. Actual values may vary by variant.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab==="specs" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <h3 className="font-bold text-2xl mb-6" style={{ color: C.blue }}>Specifications</h3>
                <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.border}` }}>
                  {[["SKU",product.sku],["HSN Code",product.hsnCode],["Unit",product.unit],["Brand",product.brand||"—"],["Category",product.category?.name||"—"]].map(([k,v],i) => (
                    <div key={k} className="flex text-sm" style={{ background: i%2===0 ? C.bg : C.surface, borderBottom: i<4?`1px solid ${C.border}`:"none" }}>
                      <div className="w-1/3 px-5 py-4 font-semibold" style={{ color: C.mid }}>{k}</div>
                      <div className="flex-1 px-5 py-4" style={{ color: C.blue }}>{v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab==="reviews" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">

                {/* ── Existing Reviews ── */}
                <div>
                  <h3 className="font-bold text-2xl mb-6" style={{ color: C.blue }}>Customer Reviews</h3>
                  {product.reviews?.length ? (
                    <div className="space-y-4">
                      {product.reviews.map((r: any) => (
                        <div key={r.id} className="p-5 rounded-2xl" style={{ background: C.bg, border: `1.5px solid ${C.border}` }}>
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
                    <div className="text-center py-8">
                      <Star size={36} className="mx-auto mb-4" style={{ color: C.border }}/>
                      <p style={{ color: C.mid }}>No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>

                {/* ── Write a Review ── */}
                <div className="rounded-3xl p-6" style={{ background: C.bg, border: `1.5px solid ${C.border}` }}>
                  <h3 className="font-bold text-xl mb-5" style={{ color: C.blue }}>Write a Review</h3>

                  {!token ? (
                    <div className="text-center py-6">
                      <p className="text-sm mb-3" style={{ color: C.mid }}>Please sign in to leave a review</p>
                      <a href="/login" className="inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: C.mint }}>Sign In</a>
                    </div>
                  ) : reviewSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle size={40} className="mx-auto mb-3" style={{ color: C.mint }} />
                      <p className="font-bold" style={{ color: C.blue }}>Thank you for your review!</p>
                      <p className="text-sm mt-1" style={{ color: C.mid }}>It will appear after approval.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Star picker */}
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

                      {/* Title */}
                      <div>
                        <label className="text-sm font-semibold block mb-1" style={{ color: C.blue }}>Review Title <span className="font-normal opacity-60">(optional)</span></label>
                        <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                          placeholder="e.g. Great product!"
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                          style={{ border: `1.5px solid ${C.border}`, background: "#fff", color: C.blue }} />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="text-sm font-semibold block mb-1" style={{ color: C.blue }}>Your Review</label>
                        <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                          rows={4} placeholder="Share your experience with this product..."
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                          style={{ border: `1.5px solid ${C.border}`, background: "#fff", color: C.blue }} />
                      </div>

                      {/* Submit */}
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

              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}