"use client";
import { useSettings } from "@/lib/useSettings";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Package, ChevronLeft, Minus, Plus,
  Zap, CheckCircle, AlertCircle, Shield, Award,
  Truck, RotateCcw, Microscope, Leaf, ChevronRight,
  GlassWater, Sparkles, Droplet
} from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { productsApi, publicApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CertLogo } from "@/components/storefront/CertLogos";
import { cldOptimize } from "@/lib/utils";

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
  mid:     "#4B5563",
  light:   "#6B7280",
  altBg:   "#F8F8F8",
};

const Step1Icon = ({ className, style }: any) => (
  <svg viewBox="0 0 64 64" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Glass Rim Ellipse */}
    <ellipse cx="32" cy="24" rx="14" ry="4" stroke="#ff5c00" strokeWidth="2.5" />
    {/* Water body inside glass */}
    <path d="M19,34 C19,34 22,32 32,32 C42,32 45,34 45,34 L43,54 C43,56.2 38.1,58 32,58 C25.9,58 21,56.2 21,54 Z" fill="rgba(99, 179, 237, 0.25)" stroke="none" />
    {/* Glass body outline */}
    <path d="M18,24.5 L21,54 C21,57.3 25.9,60 32,60 C38.1,60 43,57.3 43,54 L46,24.5" stroke="#ff5c00" />
    {/* Tablet dropping from top */}
    <g transform="translate(0, -2)">
      {/* Tablet Body */}
      <ellipse cx="32" cy="11" rx="5" ry="2.2" fill="#ff5c00" stroke="none" />
      <ellipse cx="32" cy="13" rx="5" ry="2.2" fill="#ff7a00" stroke="none" />
      <rect x="27" y="11" width="10" height="2" fill="#ff7a00" stroke="none" />
      <ellipse cx="32" cy="11" rx="5" ry="2.2" fill="none" stroke="#ffffff" strokeWidth="1" />
      {/* Motion lines */}
      <path d="M29,17 L29,19 M35,17 L35,19" stroke="#ff5c00" strokeWidth="1.5" strokeDasharray="1 1" />
    </g>
  </svg>
);

const Step2Icon = ({ className, style }: any) => (
  <svg viewBox="0 0 64 64" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Glass Rim Ellipse */}
    <ellipse cx="32" cy="24" rx="14" ry="4" stroke="#ff5c00" strokeWidth="2.5" />
    {/* Water body inside glass */}
    <path d="M19,34 C19,34 22,32 32,32 C42,32 45,34 45,34 L43,54 C43,56.2 38.1,58 32,58 C25.9,58 21,56.2 21,54 Z" fill="rgba(99, 179, 237, 0.25)" stroke="none" />
    {/* Glass body outline */}
    <path d="M18,24.5 L21,54 C21,57.3 25.9,60 32,60 C38.1,60 43,57.3 43,54 L46,24.5" stroke="#ff5c00" />
    {/* Tablet at bottom of glass */}
    <ellipse cx="32" cy="54" rx="4.5" ry="1.8" fill="#ff7a00" stroke="none" />
    <ellipse cx="32" cy="55.2" rx="4.5" ry="1.8" fill="#ff5c00" stroke="none" />
    <rect x="27.5" y="54" width="9" height="1.2" fill="#ff5c00" stroke="none" />
    {/* Fizz bubbles rising from tablet */}
    <circle cx="32" cy="46" r="1.5" fill="#ff7a00" stroke="none" />
    <circle cx="29" cy="42" r="1.2" fill="#ff7a00" stroke="none" />
    <circle cx="35" cy="40" r="1" fill="#ff5c00" stroke="none" />
    <circle cx="31" cy="35" r="1.5" fill="#ff5c00" stroke="none" />
    <circle cx="33" cy="29" r="1.2" fill="#ff7a00" stroke="none" />
    <circle cx="28" cy="31" r="1" fill="#ff7a00" stroke="none" />
    {/* Fizz bubbles popping out of the top */}
    <circle cx="26" cy="19" r="1.2" fill="#ff7a00" stroke="none" />
    <circle cx="32" cy="17" r="1.5" fill="#ff5c00" stroke="none" />
    <circle cx="38" cy="18" r="1" fill="#ff7a00" stroke="none" />
  </svg>
);

const Step3Icon = ({ className, style }: any) => (
  <svg viewBox="0 0 64 64" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Straw sticking out */}
    <path d="M32,38 L43,10 L48,9" stroke="#ff7a00" strokeWidth="2.5" />
    {/* Glass Rim Ellipse */}
    <ellipse cx="32" cy="24" rx="14" ry="4" stroke="#ff5c00" strokeWidth="2.5" />
    {/* Fully dissolved orange liquid inside glass */}
    <path d="M19,34 C19,34 22,32 32,32 C42,32 45,34 45,34 L43,54 C43,56.2 38.1,58 32,58 C25.9,58 21,56.2 21,54 Z" fill="rgba(255, 92, 0, 0.25)" stroke="none" />
    {/* Glass body outline */}
    <path d="M18,24.5 L21,54 C21,57.3 25.9,60 32,60 C38.1,60 43,57.3 43,54 L46,24.5" stroke="#ff5c00" />
    {/* Bubbles representing completed carbonated drink */}
    <circle cx="26" cy="48" r="1.2" fill="#ff7a00" stroke="none" />
    <circle cx="37" cy="46" r="1" fill="#ff7a00" stroke="none" />
    <circle cx="30" cy="40" r="1.5" fill="#ff5c00" stroke="none" />
    <circle cx="34" cy="49" r="0.8" fill="#ff7a00" stroke="none" />
    <circle cx="25" cy="38" r="1" fill="#ff7a00" stroke="none" />
    <circle cx="39" cy="36" r="1.2" fill="#ff5c00" stroke="none" />
  </svg>
);

const HOW_TO_USE = [
  { icon: Step1Icon,   step: "1", title: "Drop It",         desc: "Drop the tablet into a glass of water (200 ml)" },
  { icon: Step2Icon,   step: "2", title: "Watch the Magic", desc: "Watch the fizz! Let it dissolve completely" },
  { icon: Step3Icon,   step: "3", title: "Vibe On",         desc: "Sip and get back to work, powered up!" },
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
  { icon: RotateCcw, label: "Easy 24 hours return"               },
  { icon: Shield,    label: "100% authentic & safe"              },
  { icon: Truck,     label: "Order Now | Est. Delivery: 5–7 Days" },
];

const GrowequalLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative shrink-0">
      <svg className="h-8 w-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer stylized crescent shape */}
        <path
          d="M80,50 C80,66.57 66.57,80 50,80 C36.25,80 24.71,70.73 21.14,58.07 C23.63,60.85 27.27,62.73 31.42,63.07 C33.15,50.72 40.23,43.23 50.15,43.23 C60.07,43.23 67.15,50.72 68.88,63.07 C75.29,56.66 77.29,46.66 73.29,38.66 C68.29,28.66 56.29,23.66 45.29,27.66 C34.29,31.66 27.29,42.66 28.29,54.66 C26.29,44.66 30.29,33.66 38.29,27.66 C46.29,21.66 57.29,21.66 65.29,26.66 C74.29,32.25 78.89,40.85 80,50 Z"
          fill="#70155a"
        />
        {/* Head */}
        <circle cx="50" cy="30" r="7" fill="#70155a" />
        {/* Torso/Arms */}
        <path
          d="M38,50 C38,43 62,43 62,50 C62,55 58,60 50,60 C42,60 38,55 38,50 Z"
          fill="#70155a"
        />
      </svg>
      {/* Trademark symbol */}
      <span className="absolute -top-1 -right-1 text-[8px] font-bold text-[#70155a]">®</span>
    </div>
    <div className="flex flex-col select-none">
      <span className="text-[17px] font-serif font-black tracking-tight text-[#70155a] leading-none">GROWEQUAL</span>
      <span className="text-[8px] font-bold tracking-widest text-[#70155a]/90 leading-none uppercase self-end mt-0.5" style={{ letterSpacing: "1.5px" }}>Limited</span>
    </div>
  </div>
);

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
  const router = useRouter();

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
  const nutritionalFacts = product.nutritionFacts || null;
  let nutritionRows: [string, string][] = [
    ["Energy", "20 kcal"],
    ["Carbohydrates", "5g"],
    ["Sugars", "<1g"],
    ["Sodium", "300mg"],
    ["Potassium", "200mg"],
    ["Magnesium", "100mg"],
    ["Vitamin C", "100mg"],
    ["Vitamin B6", "1.4mg"],
    ["Zinc", "5mg"]
  ];

  if (nutritionalFacts) {
    if (Array.isArray(nutritionalFacts)) {
      nutritionRows = nutritionalFacts.map((x: any) => [x.key || x[0] || "", x.value || x[1] || ""]);
    } else if (typeof nutritionalFacts === "object") {
      nutritionRows = Object.entries(nutritionalFacts);
    }
  }

  const isOutOfStock = !product.inventory || product.inventory.length === 0 || product.inventory.every((inv: any) => inv.qtyInStock <= 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
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
    { id: "specs",     label: "Key Features" },
    { id: "info",      label: "Additional Product Info" },
    { id: "reviews",   label: `Reviews (${product.reviews?.length ? product._count?.reviews || product.reviews.length : FALLBACK_REVIEWS.length})` },
  ] as const;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.map((img: any) => img.imageUrl),
    description: product.description || product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Zupwell" },
    aggregateRating: product.avgRating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.avgRating.toFixed(1),
          reviewCount: product._count?.reviews || product.reviews?.length || 1,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: unitPrice,
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zupwell.com"}/products/${product.slug}`,
    },
  };

  return (
    <main style={{ minHeight: "100vh", background: C.bg }}>
      {/* Product structured data — lets Google show price/stock/rating
          directly in search results. Injected client-side since this page
          is a client component; for the strongest SEO signal this would
          ideally be server-rendered via generateMetadata, which needs a
          bigger refactor (splitting into a server page + client component). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
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
                {primaryImage && <img src={cldOptimize(primaryImage, 80)} alt="" width={80} height={80} className="h-10 w-10 rounded-xl object-cover shrink-0" style={{ border: `1px solid ${C.border}` }}  loading="lazy" decoding="async" />}
                <div className="min-w-0">
                  <p className="font-bold truncate text-sm" style={{ color: C.blue }}>{product.name}</p>
                  <p className="text-xs" style={{ color: C.mid }}>₹{price.toFixed(0)} per unit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {!isOutOfStock && (
                  <div className="flex items-center gap-1 rounded-xl p-1" style={{ border: `1.5px solid ${C.border}`, background: C.bg }}>
                    <button onClick={() => setQty(Math.max(1,qty-1))} className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: C.blue }}><Minus size={12}/></button>
                    <span className="w-6 text-center text-sm font-bold" style={{ color: C.blue }}>{qty}</span>
                    <button onClick={() => setQty(qty+1)} className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: C.blue }}><Plus size={12}/></button>
                  </div>
                )}
                {isOutOfStock ? (
                  <button disabled
                    className="bg-gray-200 text-gray-400 font-bold py-2 px-5 text-sm rounded-xl cursor-not-allowed border-none">
                    SOLD OUT
                  </button>
                ) : (
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                    className="btn-primary flex items-center gap-2 py-2 px-5 text-sm"
                    style={{ color: "#ffffff" }}>
                    <ShoppingCart size={14}/> Add To Cart · ₹{total}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 overflow-x-auto whitespace-nowrap scrollbar-none py-1" style={{ color: C.mid }}>
          <Link href="/products" className="flex items-center gap-1 transition-colors shrink-0"
            style={{ color: C.mid }}
            onMouseEnter={e => (e.currentTarget.style.color = C.mintHex)}
            onMouseLeave={e => (e.currentTarget.style.color = C.mid)}
          >
            <ChevronLeft size={14}/> Products
          </Link>
          <ChevronRight size={12} style={{ color: C.border }} className="shrink-0"/>
          <span style={{ color: C.blue }} className="shrink-0">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Images ── */}
          <div>
            <div className="relative rounded-3xl overflow-hidden aspect-square mb-4 shadow-sm flex items-center justify-center p-6"
              style={{ background: C.altBg, border: `1.5px solid ${C.border}` }}>
              {images[activeImage]?.imageUrl ? (
                <img src={cldOptimize(images[activeImage].imageUrl, 800)} alt={product.name} width={800} height={800}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-[1.03]" loading="eager" fetchPriority="high" decoding="async" />
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
                    {img.imageUrl ? <img src={cldOptimize(img.imageUrl, 160)} alt="" width={160} height={160} className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" /> : <div className="w-full h-full" style={{ background: C.surface }}/>}
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges — dark tiles */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {TRUST_BADGES.map((b, i) => (
                <div key={i}
                  className="flex flex-col items-center justify-center p-2 rounded-xl text-center h-[86px] overflow-hidden"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
                  <CertLogo label={b.logoLabel} className="h-14 w-auto object-contain shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Info ── */}
          <div>
            {isOutOfStock && (
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-black tracking-widest text-white uppercase mb-4" style={{ backgroundColor: "#E53E3E" }}>
                Out of Stock
              </span>
            )}
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.mintHex, letterSpacing: "0.15em" }}>{product.brand}</p>
            )}
            <div className="flex justify-between items-start gap-4 mb-3">
              <h1 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: C.blue, letterSpacing: "-0.02em" }}>
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
              {!isOutOfStock && (
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
              )}
              {isOutOfStock ? (
                <button disabled
                  className="w-full bg-gray-200 text-gray-400 font-bold py-3.5 rounded-2xl cursor-not-allowed border-none text-center"
                  style={{ textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px" }}>
                  Out of Stock
                </button>
              ) : (
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base"
                  style={{ color: "#ffffff" }}>
                  <ShoppingCart size={18}/> Add To Cart
                </motion.button>
              )}
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
              ? `Reviews (${product.reviews?.length ? product._count?.reviews || product.reviews.length : FALLBACK_REVIEWS.length})` 
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
                      <div className="px-6 py-3 md:px-8 md:py-4" style={{ background: "#0c1e39", borderTop: "1.5px solid rgba(255, 255, 255, 0.1)" }}>
                        {tab.id === "desc" && (
                          <div className="text-sm leading-relaxed" style={{ color: "#f8f8f8", opacity: 0.85 }}>
                            <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
                          </div>
                        )}

                        {tab.id === "howto" && (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              {HOW_TO_USE.map((step, i) => (
                                <div key={i}
                                  className="flex flex-col items-center text-center p-7 rounded-2xl"
                                  style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                                  {/* Dark Orange Rounded-2xl Icon Container */}
                                  <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg select-none"
                                    style={{ background: "rgba(255, 92, 0, 0.04)", border: "1.5px solid rgba(255, 92, 0, 0.12)" }}>
                                    <step.icon className="h-14 w-14" />
                                  </div>
                                  
                                  {/* Step Tag */}
                                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#ff5c00", letterSpacing: "0.15em" }}>
                                    Step {step.step}
                                  </div>

                                  {/* Bold Title */}
                                  <h4 className="font-bold text-lg mb-2 text-white">{step.title}</h4>
                                  
                                  {/* Description */}
                                  <p className="text-sm text-white/80 leading-relaxed">{step.desc}</p>
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
                          <div className="space-y-6">
                            {/* Serving Info Headers */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-2xl" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                              <div>
                                <span className="text-xs uppercase font-black text-gray-400 tracking-wider">Serving Size</span>
                                <p className="text-lg font-bold text-white mt-0.5">1 Tablet</p>
                              </div>
                              <div className="hidden sm:block w-px bg-white/10" />
                              <div>
                                <span className="text-xs uppercase font-black text-gray-400 tracking-wider">Servings Per Pack</span>
                                <p className="text-lg font-bold text-white mt-0.5">15 Effervescent Tablets</p>
                              </div>
                            </div>

                            {/* Side-by-side Tables Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Table: Nutrients */}
                              <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: "#051124" }}>
                                <div className="grid grid-cols-3 p-4 font-bold text-xs uppercase tracking-wider text-white/90 border-b border-white/10" style={{ background: "#0c1e39" }}>
                                  <span>Nutrients</span>
                                  <span className="text-right">Amount / Serving</span>
                                  <span className="text-right">%RDA</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                  {[
                                    ["Energy", "1.08 kcal", "0.05%"],
                                    ["Protein", "0 g", "0%"],
                                    ["Carbohydrate", "0.27 g", "**"],
                                    ["Fat", "0 g", "0%"],
                                    ["Total Sugar", "0.3 g", "**"],
                                    ["Sodium", "335 mg", "16.75%"]
                                  ].map(([name, amt, rda]) => (
                                    <div key={name} className="grid grid-cols-3 px-4 py-3 text-sm text-white/80">
                                      <span className="font-semibold">{name}</span>
                                      <span className="text-right">{amt}</span>
                                      <span className="text-right font-semibold" style={{ color: rda.includes("0%") ? "inherit" : "var(--or)" }}>{rda}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Table: Ingredients */}
                              <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: "#051124" }}>
                                <div className="grid grid-cols-3 p-4 font-bold text-xs uppercase tracking-wider text-white/90 border-b border-white/10" style={{ background: "#0c1e39" }}>
                                  <span>Ingredients</span>
                                  <span className="text-right">Amount / Serving</span>
                                  <span className="text-right">%RDA</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                  {[
                                    ["Chloride", "220 mg", "9.56%"],
                                    ["Magnesium", "56 mg", "12.72%"],
                                    ["Potassium", "115 mg", "3.28%"],
                                    ["Calcium", "100 mg", "10%"],
                                    ["Vitamin C", "40 mg", "50%"],
                                    ["Zinc", "5 mg", "29.4%"]
                                  ].map(([name, amt, rda]) => (
                                    <div key={name} className="grid grid-cols-3 px-4 py-3 text-sm text-white/80">
                                      <span className="font-semibold">{name}</span>
                                      <span className="text-right">{amt}</span>
                                      <span className="text-right font-semibold" style={{ color: "var(--or)" }}>{rda}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* RDA Disclaimer Footer */}
                            <p className="text-[11px] leading-relaxed text-gray-400 mt-2">
                              * % RDA calculated based on ICMR 2020 guidelines for moderate work men and labelling & display regulation.
                            </p>
                          </div>
                        )}

                        {tab.id === "specs" && (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { text: "Fast Dissolving Formula", emoji: "⚡" },
                                { text: "Refreshing Orange Flavour", emoji: "🍊" },
                                { text: "Supports Hydration", emoji: "💧" },
                                { text: "Supports Electrolyte Balance", emoji: "⚖️" },
                                { text: "Supports Nerve Function", emoji: "🧠" },
                                { text: "Helps Reduce Fatigue", emoji: "😫" },
                                { text: "Contains Vitamin C", emoji: "🍋" },
                                { text: "Easy to Carry", emoji: "🎒" },
                                { text: "Sugar Conscious Formula", emoji: "🍃" },
                                { text: "Vegetarian", emoji: "🌱" }
                              ].map((feat) => (
                                <div key={feat.text} className="flex items-center gap-3.5 p-4 rounded-xl"
                                  style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                                  <span className="text-lg shrink-0 select-none">{feat.emoji}</span>
                                  <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>{feat.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tab.id === "info" && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Marketed By */}
                              <div className="p-6 rounded-2xl" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                                <h4 className="text-[10px] uppercase tracking-widest mb-3 font-black text-gray-400">Marketed By</h4>
                                <p className="text-lg font-black text-white mb-2 tracking-tight">GLOBENT</p>
                                <p className="text-sm leading-relaxed text-white/80">
                                  A-102, Adarsh Lifestyle, New India Colony Road, Nr. Devashya School, Ahmedabad, Gujarat, 382350.
                                </p>
                                <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                  <img src="/fssai.png" alt="FSSAI" className="h-6 object-contain" />
                                  <p className="text-xs font-semibold text-white/90">
                                    <span className="opacity-60 uppercase mr-1">Lic No.:</span>10726026000527
                                  </p>
                                </div>
                              </div>

                              {/* Manufactured By */}
                              <div className="p-6 rounded-2xl" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                                <h4 className="text-[10px] uppercase tracking-widest mb-4 font-black text-gray-400">Manufactured By</h4>
                                
                                <div className="mb-4">
                                  <GrowequalLogo />
                                </div>
                                
                                <p className="text-xs font-black mb-3 tracking-wide" style={{ color: "#d065b3" }}>(A WHO-GMP, HACCP Certified Company)</p>
                                <p className="text-sm leading-relaxed text-white/80">
                                  D-15, Sahjanand Business Park, S.P. Ring Road, Nikol, Ahmedabad, Gujarat - 382350, India.
                                </p>
                                <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                  <img src="/fssai.png" alt="FSSAI" className="h-6 object-contain" />
                                  <p className="text-xs font-semibold text-white/90">
                                    <span className="opacity-60 uppercase mr-1">Lic No.:</span>10723999000788
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Country of Origin */}
                            <div className="p-5 rounded-2xl flex items-center justify-between gap-4" style={{ background: "#051124", border: "1.5px solid rgba(255, 255, 255, 0.08)" }}>
                              <span className="text-xs font-black text-white/60 uppercase tracking-widest">Country of Origin</span>
                              <span className="text-sm font-black text-white px-4 py-2 rounded-xl uppercase tracking-wider" style={{ background: C.mint }}>India</span>
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

                              {reviewSuccess ? (
                                <div className="text-center py-6">
                                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: C.mintHex }} />
                                  <p className="font-bold" style={{ color: "#ffffff" }}>Thank you for your review!</p>
                                  <p className="text-sm mt-1" style={{ color: "#f8f8f8", opacity: 0.85 }}>It will appear after approval.</p>
                                </div>
                              ) : (
                                <div className="space-y-4" onClickCapture={() => {
                                  if (!token) {
                                    toast.error("Please login first to write a review!");
                                    router.push("/login");
                                  }
                                }}>
                                  <div>
                                    <label className="text-sm font-semibold block mb-2" style={{ color: "#ffffff" }}>Your Rating</label>
                                    <div className="flex gap-1">
                                      {Array.from({length:5}).map((_,i) => (
                                        <button key={i} type="button"
                                          onMouseEnter={() => token && setReviewHover(i+1)}
                                          onMouseLeave={() => token && setReviewHover(0)}
                                          onClick={() => token && setReviewRating(i+1)}>
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
                                      style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)", background: "#0c1e39", color: "#ffffff" }}
                                      readOnly={!token} />
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: "#ffffff" }}>Your Review</label>
                                    <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                                      rows={4} placeholder="Share your experience with this product..."
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                      style={{ border: "1.5px solid rgba(255, 255, 255, 0.1)", background: "#0c1e39", color: "#ffffff" }}
                                      readOnly={!token} />
                                  </div>

                                  <button
                                    disabled={token && (!reviewBody.trim() || reviewSubmitting)}
                                    onClick={async () => {
                                      if (!token) return;
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
