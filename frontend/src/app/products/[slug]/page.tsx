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

const HOW_TO_USE = [
  { icon: Droplets,    step: "1", title: "Drop It",         desc: "Drop 1 tablet into a glass of cold water (250ml)" },
  { icon: Zap,         step: "2", title: "Watch the Fizz",  desc: "Watch the magic bubble up! Let it dissolve completely" },
  { icon: CheckCircle, step: "3", title: "Vibe On",         desc: "Drink up and claim your daily energy!" },
];

const TRUST_BADGES = [
  { icon: Shield,     label: "GMP Certified"  },
  { icon: Award,      label: "FSSAI Approved" },
  { icon: Microscope, label: "Lab Tested"     },
  { icon: Leaf,       label: "Clean Label"    },
];

const DELIVERY_PERKS = [
  { icon: Truck,     label: "Free delivery on orders above ₹499" },
  { icon: RotateCcw, label: "Easy 7-day hassle-free returns"     },
  { icon: Shield,    label: "100% secure payment checkout"       },
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
    const handler = () => setStickyVisible(window.scrollY > 480);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (loading) return (
    <main className="min-h-screen bg-[#FCFAF6]"><Navbar />
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin border-[#48C062]" />
      </div>
    </main>
  );

  if (!product) return (
    <main className="min-h-screen bg-[#FCFAF6]"><Navbar />
      <div className="pt-40 text-center text-[#45353E]">Product not found</div>
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
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />

      {/* Sticky Buy Bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -72, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-45 px-4"
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 rounded-3xl px-6 py-3 bg-white border border-[#E8E2D9] shadow-premium">
              <div className="flex items-center gap-3 min-w-0">
                {primaryImage && <img src={primaryImage} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0 border border-[#E8E2D9]" />}
                <div className="min-w-0">
                  <p className="font-display font-bold truncate text-sm text-[#002A30]">{product.name}</p>
                  <p className="text-xs text-[#8C8276]">₹{price.toFixed(0)} per unit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 rounded-xl p-1 border border-[#E8E2D9] bg-[#FCFAF6]">
                  <button onClick={() => setQty(Math.max(1,qty-1))} className="h-7 w-7 flex items-center justify-center rounded-lg text-[#002A30] hover:bg-white transition-colors"><Minus size={12}/></button>
                  <span className="w-6 text-center text-sm font-bold text-[#002A30]">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="h-7 w-7 flex items-center justify-center rounded-lg text-[#002A30] hover:bg-white transition-colors"><Plus size={12}/></button>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs font-sans font-bold uppercase tracking-[0.12em]">
                  <ShoppingCart size={14}/> Claim Your Energy · ₹{total}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 text-[#8C8276]">
          <Link href="/products" className="flex items-center gap-1 transition-colors hover:text-[#48C062]">
            <ChevronLeft size={14}/> Products
          </Link>
          <ChevronRight size={12} className="text-[#E8E2D9]"/>
          <span className="text-[#002A30]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Images & Badges */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-3xl aspect-square overflow-hidden bg-white border border-[#E8E2D9] shadow-soft group">
              {images[activeImage]?.imageUrl ? (
                <img src={images[activeImage].imageUrl} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#E8E2D9]"><Package size={80}/></div>
              )}
              {Number(product.discountPercent) > 0 && (
                <div className="absolute top-4 left-4 text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-[#48C062] uppercase tracking-wider">
                  -{product.discountPercent}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 h-20 w-20 rounded-2xl overflow-hidden transition-all duration-200"
                    style={{ border: `2px solid ${activeImage===i ? "#48C062" : "#E8E2D9"}` }}>
                    {img.imageUrl ? <img src={img.imageUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-[#FCFAF6]"/>}
                  </button>
                ))}
              </div>
            )}

            {/* Quality trust badges */}
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#E8E2D9]/40">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center border border-[#E8E2D9] bg-white shadow-soft">
                  <b.icon size={16} className="text-[#48C062] animate-pulse" />
                  <span className="font-sans text-[10px] font-bold text-[#002A30] uppercase tracking-wider leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Info & Buy Flow */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {product.brand && (
                <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] mb-2">{product.brand}</span>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-black text-[#002A30] leading-snug tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-[#8C8276] uppercase tracking-wider">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>HSN: {product.hsnCode}</span>
                <span>•</span>
                <span>Unit: {product.unit}</span>
              </div>
            </div>

            {/* Review Badge */}
            {product.avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#FFF9EB] px-3 py-1.5 rounded-xl border border-[#F0D5A8]">
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,i) => (
                      <Star key={i} size={12} className={i<Math.round(product.avgRating)?"fill-yellow-400 text-yellow-400":""}
                        style={i>=Math.round(product.avgRating)?{color:"#E8E2D9"}:{}}/>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#002A30] ml-1">{product.avgRating?.toFixed(1)}</span>
                </div>
                <span className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider">({product._count?.reviews} community reviews)</span>
              </div>
            )}

            {/* Variants Selector */}
            {product.variants?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8C8276]">Select Pack Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider border ${
                        selectedVariant?.id===v.id 
                          ? "border-[#48C062] bg-[#48C062]/10 text-[#48C062]" 
                          : "border-[#E8E2D9] bg-white text-[#45353E] hover:border-[#48C062]"
                      }`}>
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Calculations Card */}
            <div className="rounded-3xl p-6 bg-white border border-[#E8E2D9] shadow-soft space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-black text-[#002A30]">₹{price.toFixed(0)}</span>
                {Number(product.discountPercent)>0 && (
                  <span className="text-lg line-through text-[#8C8276]">₹{Number(product.basePrice).toFixed(0)}</span>
                )}
                {Number(product.discountPercent)>0 && (
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                    {product.discountPercent}% off
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider space-y-2 pt-4 border-t border-[#E8E2D9]/40">
                <div className="flex justify-between"><span>Price (×{qty})</span><span className="text-[#002A30] font-bold">₹{(price*qty).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>CGST @{cgstPct}%</span><span className="text-[#002A30] font-bold">₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @{sgstPct}%</span><span className="text-[#002A30] font-bold">₹{sgst.toFixed(2)}</span></div>
                {roundOffDiff!==0 && (
                  <div className="flex justify-between italic">
                    <span>Round Off</span><span>{roundOffDiff>0?"+":""}₹{roundOffDiff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display font-bold text-base pt-3 border-t border-[#E8E2D9]/40 text-[#002A30]">
                  <span>Total (Incl. Tax)</span><span className="text-xl font-black text-[#48C062]">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Qty & Purchase CTA */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl p-1.5 border border-[#E8E2D9] bg-[#FCFAF6] shrink-0">
                <button onClick={() => setQty(Math.max(1,qty-1))}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white hover:bg-[#E8E2D9]/20 transition-colors text-[#002A30]">
                  <Minus size={14}/>
                </button>
                <span className="w-8 text-center font-bold text-lg text-[#002A30]">{qty}</span>
                <button onClick={() => setQty(qty+1)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white hover:bg-[#E8E2D9]/20 transition-colors text-[#002A30]">
                  <Plus size={14}/>
                </button>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                <ShoppingCart size={16}/> Claim Your Energy
              </motion.button>
            </div>

            {/* Perks list */}
            <div className="space-y-3 pt-2">
              {DELIVERY_PERKS.map((perk,i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-semibold text-[#45353E] uppercase tracking-wider">
                  <perk.icon size={14} className="text-[#48C062] shrink-0"/>
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>

            {/* Quality Standard redirect link */}
            <Link href="/science" className="flex items-center justify-between p-4 rounded-3xl border border-[#E8E2D9] bg-white shadow-soft group hover:border-[#48C062]/20 transition-colors">
              <div className="flex items-center gap-3">
                <Microscope size={18} className="text-[#002A30]"/>
                <div>
                  <p className="font-display font-bold text-xs uppercase tracking-wider text-[#002A30]">GMP · ISO · FSSAI · Tested</p>
                  <p className="text-[10px] text-[#8C8276] font-semibold uppercase tracking-wider mt-0.5">Read our full safety test reports ➔</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8C8276] group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Safety Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-3xl border border-[#F0D5A8] bg-[#FFFBF0]">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#9A6700]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A5200] leading-relaxed">
                This is a <strong>health supplement</strong> and not for medicinal use. Consult your medical practitioner before use if pregnant, lactating, or on prescription medicines.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Block */}
        <div className="mt-20 rounded-3xl overflow-hidden border border-[#E8E2D9] bg-white shadow-soft">
          <div className="flex overflow-x-auto border-b border-[#E8E2D9] bg-[#FCFAF6]">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab===tab.id 
                    ? "bg-white text-[#48C062] border-[#48C062]" 
                    : "text-[#8C8276] border-transparent hover:text-[#002A30]"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab==="desc" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-sm leading-relaxed text-[#45353E]">
                <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
              </motion.div>
            )}

            {activeTab==="howto" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                <h3 className="font-display font-bold text-xl text-[#002A30]">How to Use — <span className="text-[#48C062]">The Simple Way</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {HOW_TO_USE.map((step,i) => (
                    <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="flex flex-col items-center text-center p-6 rounded-3xl border border-[#E8E2D9] bg-[#FCFAF6]">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 bg-white border border-[#E8E2D9]">
                        <step.icon size={22} className="text-[#48C062]" />
                      </div>
                      <span className="font-sans text-[10px] font-bold text-[#48C062] uppercase tracking-[0.12em] mb-1">Step {step.step}</span>
                      <h4 className="font-display font-bold text-base text-[#002A30] mb-2">{step.title}</h4>
                      <p className="text-xs text-[#45353E] leading-relaxed">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-semibold text-[#2E7D32] tracking-wider uppercase">
                  ⚡ Pro tip: Use cold water for the best fizzy flavor experience! One tablet daily is recommended.
                </div>
              </motion.div>
            )}

            {activeTab==="nutrition" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                <h3 className="font-display font-bold text-xl text-[#002A30]">Nutritional Analysis</h3>
                <div className="max-w-sm rounded-3xl overflow-hidden border border-[#002A30] bg-white">
                  <div className="p-5 bg-[#002A30] text-white">
                    <p className="font-display text-lg font-bold">Nutrition Facts</p>
                    <p className="text-white/60 text-[10px] uppercase tracking-wider mt-1">Per tablet (approximate values)</p>
                  </div>
                  <div className="divide-y divide-[#E8E2D9]">
                    {(nutritionalFacts?Object.entries(nutritionalFacts):[
                      ["Energy","20 kcal"],["Carbohydrates","5g"],["Sugars","<1g"],
                      ["Sodium","300mg"],["Potassium","200mg"],["Magnesium","100mg"],
                      ["Vitamin C","100mg"],["Vitamin B6","1.4mg"],["Zinc","5mg"]
                    ]).map(([k,v]) => (
                      <div key={k as string} className="flex justify-between px-5 py-3 text-xs font-semibold text-[#45353E] uppercase tracking-wider">
                        <span>{k as string}</span>
                        <span className="font-sans font-bold text-[#002A30]">{v as string}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-[#FCFAF6] border-t border-[#E8E2D9]">
                    <p className="text-[9px] font-bold text-[#8C8276] uppercase tracking-wider">* Daily Value not established. Actual metrics may vary per batch.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab==="specs" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                <h3 className="font-display font-bold text-xl text-[#002A30]">Specifications</h3>
                <div className="rounded-3xl overflow-hidden border border-[#E8E2D9]">
                  {[["SKU",product.sku],["HSN Code",product.hsnCode],["Unit",product.unit],["Brand",product.brand||"—"],["Category",product.category?.name||"—"]].map(([k,v],i) => (
                    <div key={k} className="flex text-xs font-semibold uppercase tracking-wider" style={{ background: i%2===0 ? "#FCFAF6" : "#FFFFFF", borderBottom: i<4?"1px solid #E8E2D9":"none" }}>
                      <div className="w-1/3 px-5 py-4 text-[#8C8276] font-bold">{k}</div>
                      <div className="flex-1 px-5 py-4 text-[#002A30] font-bold">{v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab==="reviews" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                {/* Existing Reviews */}
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-[#002A30]">Customer Testimonials</h3>
                  {product.reviews?.length ? (
                    <div className="space-y-4">
                      {product.reviews.map((r: any) => (
                        <div key={r.id} className="p-5 rounded-3xl border border-[#E8E2D9] bg-[#FCFAF6]">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={11} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-[#E8E2D9]"}/>)}</div>
                            <span className="text-xs font-bold text-[#002A30] uppercase tracking-wider">{r.user?.name}</span>
                          </div>
                          {r.title && <p className="font-display font-bold text-sm text-[#002A30] uppercase tracking-wide mb-1">{r.title}</p>}
                          <p className="text-xs text-[#45353E] leading-relaxed italic">"{r.body}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-[#E8E2D9] rounded-3xl bg-[#FCFAF6]">
                      <Star size={36} className="mx-auto mb-3 text-[#E8E2D9]" />
                      <p className="text-xs font-bold text-[#8C8276] uppercase tracking-wider">No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>

                {/* Write Review Block */}
                <div className="rounded-3xl p-6 bg-[#FCFAF6] border border-[#E8E2D9]">
                  <h3 className="font-display font-bold text-lg text-[#002A30] mb-5">Write a Review</h3>

                  {!token ? (
                    <div className="text-center py-6">
                      <p className="text-xs font-bold text-[#8C8276] uppercase tracking-wider mb-4">Please sign in to write a review.</p>
                      <a href="/login" className="btn-primary text-xs uppercase tracking-widest font-bold py-2.5 px-6">Sign In</a>
                    </div>
                  ) : reviewSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle size={40} className="mx-auto mb-3 text-[#48C062]" />
                      <p className="font-display font-bold text-base text-[#002A30]">Review submitted!</p>
                      <p className="text-xs text-[#8C8276] uppercase tracking-wider mt-1">Thank you. It will appear on this page after verification.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Star rating */}
                      <div>
                        <label className="text-xs font-bold text-[#8C8276] uppercase tracking-wider block mb-2">Your Rating</label>
                        <div className="flex gap-1">
                          {Array.from({length:5}).map((_,i) => (
                            <button key={i} type="button"
                              onMouseEnter={() => setReviewHover(i+1)}
                              onMouseLeave={() => setReviewHover(0)}
                              onClick={() => setReviewRating(i+1)}>
                              <Star size={24}
                                className={(reviewHover || reviewRating) > i ? "fill-yellow-400 text-yellow-400" : "text-[#E8E2D9]"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-xs font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">Review Title</label>
                        <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                          placeholder="e.g. Great product!"
                          className="input-field text-xs font-semibold rounded-xl"
                          style={{ background: "#FFFFFF" }} />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="text-xs font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">Comments</label>
                        <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                          rows={4} placeholder="Describe your experience with this supplement..."
                          className="input-field text-xs font-semibold rounded-xl resize-none"
                          style={{ background: "#FFFFFF" }} />
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
                        className="btn-primary w-full py-3.5 text-xs font-sans font-bold uppercase tracking-wider transition-opacity disabled:opacity-50">
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
