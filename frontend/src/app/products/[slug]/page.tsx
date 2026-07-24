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

const PRODUCT_FAQS = [
  {
    q: "1. What are Zupwell Electrolyte Effervescent Tablets?",
    a: "Zupwell Electrolyte Effervescent Tablets are fast-dissolving hydration tablets formulated with 5 essential electrolytes (Sodium, Potassium, Magnesium, Calcium, and Chloride) along with Vitamin C to support hydration, electrolyte balance, muscle function, and everyday wellness.",
  },
  {
    q: "2. What are the benefits of electrolyte tablets?",
    intro: "Electrolyte tablets help:",
    bullets: [
      "Maintain hydration",
      "Replace electrolytes lost through sweat",
      "Support muscle function",
      "Help reduce fatigue",
      "Support nerve function",
      "Promote normal fluid balance",
    ],
  },
  {
    q: "3. How do I use these tablets?",
    a: "Simply dissolve 1 tablet in 200–250 ml of drinking water. Wait until it fully dissolves before drinking.",
  },
  {
    q: "4. Can I take these tablets every day?",
    a: "Yes. When used as directed, Zupwell Electrolyte Effervescent Tablets can be consumed daily to support hydration and electrolyte balance.",
  },
  {
    q: "5. When should I drink an electrolyte tablet?",
    intro: "You can consume it:",
    bullets: [
      "Before exercise",
      "During workouts",
      "After exercise",
      "During travel",
      "In hot weather",
      "After excessive sweating",
      "Whenever you need hydration support",
    ],
  },
  {
    q: "6. Does this product contain sugar?",
    a: "Yes. Each serving contains a small amount [0.3 grams] of sugar for improved taste.",
  },
  {
    q: "7. Is it suitable for gym workouts?",
    a: "Yes. It helps replenish electrolytes lost through sweat during exercise and supports hydration for an active lifestyle.",
  },
  {
    q: "8. Is it suitable for both men and women?",
    a: "Yes. It is suitable for healthy adults, including both men and women.",
  },
  {
    q: "9. Does it contain Vitamin C?",
    a: "Yes. Each tablet contains Vitamin C, which supports normal immune function and acts as an antioxidant.",
  },
  {
    q: "10. Is it vegan?",
    a: "Yes. It is suitable for vegetarians.",
  },
  {
    q: "11. How many tablets are in one tube?",
    a: "One tube contains 15 effervescent tablets.",
  },
  {
    q: "12. Can I take more than one tablet a day?",
    a: "Use only as directed on the label or as advised by your healthcare professional. Do not exceed the recommended daily usage.",
  },
  {
    q: "13. Is this a medicine?",
    a: "No. Zupwell Electrolyte Effervescent Tablets are a health supplement and should not be used as a substitute for a varied diet or prescribed medication.",
  },
  {
    q: "14. Who should avoid this product?",
    a: "Pregnant or breastfeeding women, children, or individuals with any medical condition should consult a healthcare professional before use.",
  },
];

const GrowequalLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative shrink-0">
      <img
        src="/growequal.png"
        alt="Growequal Logo"
        className="h-9 w-auto object-contain"
        loading="lazy"
      />
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOrigin, setPanOrigin] = useState({ x: 0.5, y: 0.5 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomScale === 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPanOrigin({ x, y });
  };

  const handleImageClick = () => {
    setZoomScale(zoomScale === 1 ? 2.5 : 1);
  };

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

  const ALL_PACK_NUMBERS = [1, 2, 3, 4, 6, 8, 10];
  const availablePacks = (() => {
    let pd: any = null;
    if (product?.packDiscounts) {
      try {
        pd = typeof product.packDiscounts === "string" ? JSON.parse(product.packDiscounts) : product.packDiscounts;
      } catch (e) {}
    }
    const list: { pack: number; label: string; sub: string; discountPercent: number }[] = [];
    for (const p of ALL_PACK_NUMBERS) {
      const info = pd?.[p] || (p <= 4 ? { enabled: true, discountPercent: p === 1 ? 0 : p === 2 ? 5 : p === 3 ? 8 : 12 } : { enabled: false, discountPercent: 0 });
      if (info.enabled) {
        list.push({
          pack: p,
          label: `Pack Of ${p}`,
          sub: `${p * 15} Tablets`,
          discountPercent: Number(info.discountPercent) || 0
        });
      }
    }
    return list.length ? list : [
      { pack: 1, label: "Pack Of 1", sub: "15 Tablets", discountPercent: 0 },
      { pack: 2, label: "Pack Of 2", sub: "30 Tablets", discountPercent: 5 },
      { pack: 3, label: "Pack Of 3", sub: "45 Tablets", discountPercent: 8 },
      { pack: 4, label: "Pack Of 4", sub: "60 Tablets", discountPercent: 12 },
    ];
  })();

  const selectedPackInfo = availablePacks.find(p => p.pack === selectedPack) || availablePacks[0];
  const packDiscountPercent = selectedPackInfo ? selectedPackInfo.discountPercent : 0;

  const baseUnitPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.sellingPrice);
  const baseMrpWithGst = baseUnitPrice * (1 + cgstRate + sgstRate);

  const originalPackMrp = Math.round(baseMrpWithGst * selectedPack);
  const discountedPackPrice = Math.round(originalPackMrp * (1 - packDiscountPercent / 100));
  const savingsAmount = originalPackMrp - discountedPackPrice;

  const effectiveSellingUnitPrice = Number(product.sellingPrice) * (1 - packDiscountPercent / 100);
  const price = effectiveSellingUnitPrice * selectedPack;
  const rawTotal = discountedPackPrice * qty;
  const total = Math.round(rawTotal);

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
      price: effectiveSellingUnitPrice, 
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
    { id: "desc",      label: "Product Overview" },
    { id: "howto",     label: "Directions for Use" },
    { id: "nutrition", label: "Nutrition Information" },
    { id: "specs",     label: "Key Benefits" },
    { id: "info",      label: "Product Details" },
    { id: "faqs",      label: "Frequently Asked Questions" },
    { id: "reviews",   label: "Customer Reviews" },
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
      price: baseUnitPrice,
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
            key="sticky-buy-bar"
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
            <div className="relative rounded-3xl overflow-hidden aspect-square mb-4 shadow-sm flex items-center justify-center p-6 cursor-zoom-in"
              style={{ background: C.altBg }}
              onClick={() => setIsZoomOpen(true)}>
              {images[activeImage]?.imageUrl ? (
                <motion.div
                  key={activeImage}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(event, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      // Next image
                      setActiveImage((prev) => (prev + 1) % images.length);
                    } else if (info.offset.x > swipeThreshold) {
                      // Previous image
                      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
                    }
                  }}
                  className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  <img src={cldOptimize(images[activeImage].imageUrl, 800)} alt={product.name} width={800} height={800}
                    className="max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-500 hover:scale-[1.03]" loading="eager" fetchPriority="high" decoding="async" />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: C.border }}><Package size={80}/></div>
              )}

              {/* Prev Button Overlay */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md z-10 transition-colors"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <ChevronLeft size={16} className="text-[#0C1E39]" />
                </button>
              )}

              {/* Next Button Overlay */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md z-10 transition-colors"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <ChevronRight size={16} className="text-[#0C1E39]" />
                </button>
              )}
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
                {availablePacks.map((item) => (
                  <button key={item.pack} onClick={() => setSelectedPack(item.pack)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl transition-colors duration-150 text-center relative cursor-pointer overflow-hidden"
                    style={{
                      border: `1.5px solid ${selectedPack===item.pack ? "#ffb800" : C.border}`,
                      background: selectedPack===item.pack ? "#ffb800" : C.surface,
                      color: selectedPack===item.pack ? "#051124" : C.blue,
                      minHeight: "74px"
                    }}>
                    {item.discountPercent > 0 && (
                      <span className="absolute top-0 right-0 bg-[#FF5C00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl">
                        {item.discountPercent}% OFF
                      </span>
                    )}
                    <span className="text-[14px] font-bold leading-tight">{item.label}</span>
                    <span className="text-[12px] opacity-80 mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price card — dark surface */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: "#0c1e39", border: `1.5px solid ${C.border}`, color: "#ffffff" }}>
              <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                <span className="text-sm font-bold uppercase" style={{ color: "#ffffff", opacity: 0.9 }}>mrp:</span>
                {packDiscountPercent > 0 ? (
                  <>
                    <span className="line-through text-gray-400 text-2xl font-bold">₹{originalPackMrp}</span>
                    <span className="text-4xl font-black text-white" style={{ letterSpacing: "-0.04em" }}>
                      ₹{discountedPackPrice}
                    </span>
                    <span className="bg-[#FF5C00] text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {packDiscountPercent}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold" style={{ color: "#ffffff", letterSpacing: "-0.04em" }}>
                    ₹{originalPackMrp}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "#f8f8f8", opacity: 0.85 }}>
                {packDiscountPercent > 0 ? `You save ₹${savingsAmount} · includes all taxes` : "includes all taxes"}
              </p>
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
            const label = tab.label;
            
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
                          <div className="p-6 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                            <div className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                              <div dangerouslySetInnerHTML={{__html: sanitizeHtml(product.description || product.shortDescription || "No description available.")}}/>
                            </div>
                          </div>
                        )}

                        {tab.id === "howto" && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {HOW_TO_USE.map((step, i) => (
                                <div key={i}
                                  className="flex flex-col items-center text-center p-7 rounded-2xl shadow-sm"
                                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
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
                                  <h4 className="font-bold text-lg mb-2 text-[#0C1E39]">{step.title}</h4>
                                  
                                  {/* Description */}
                                  <p className="text-sm text-[#4B5563] leading-relaxed">{step.desc}</p>
                                </div>
                              ))}
                            </div>
                            <div className="p-4 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                              <p className="text-sm" style={{ color: "#4B5563" }}>
                                <span className="font-bold" style={{ color: "#ff5c00" }}>Pro tip:</span> Use cold water for best fizz. One tablet per 200 ml glass. Take daily for best results.
                              </p>
                            </div>
                          </div>
                        )}

                        {tab.id === "nutrition" && (
                          <div className="space-y-6">
                            {/* Serving Info Headers */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                              <div>
                                <span className="text-xs uppercase font-black text-gray-500 tracking-wider">Serving Size</span>
                                <p className="text-lg font-bold text-[#0C1E39] mt-0.5">1 Tablet</p>
                              </div>
                              <div className="hidden sm:block w-px bg-gray-200" />
                              <div>
                                <span className="text-xs uppercase font-black text-gray-500 tracking-wider">Servings Per Pack</span>
                                <p className="text-lg font-bold text-[#0C1E39] mt-0.5">15 Effervescent Tablets</p>
                              </div>
                            </div>

                            {/* Side-by-side Tables Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Table: Nutrients */}
                              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ background: "#FFFFFF" }}>
                                <div className="grid grid-cols-3 p-4 font-bold text-xs uppercase tracking-wider text-[#0C1E39] border-b border-gray-200" style={{ background: "#F8F8F8" }}>
                                  <span>Nutrients</span>
                                  <span className="text-right">Amount / Serving</span>
                                  <span className="text-right">%RDA</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {[
                                    ["Energy", "1.08 kcal", "0.05%"],
                                    ["Protein", "0 g", "0%"],
                                    ["Carbohydrate", "0.27 g", "**"],
                                    ["Fat", "0 g", "0%"],
                                    ["Total Sugar", "0.3 g", "**"],
                                    ["Sodium", "335 mg", "16.75%"]
                                  ].map(([name, amt, rda]) => (
                                    <div key={name} className="grid grid-cols-3 px-4 py-3 text-sm text-[#4B5563]">
                                      <span className="font-semibold">{name}</span>
                                      <span className="text-right">{amt}</span>
                                      <span className="text-right font-semibold" style={{ color: rda.includes("0%") ? "inherit" : "var(--or)" }}>{rda}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Table: Ingredients */}
                              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ background: "#FFFFFF" }}>
                                <div className="grid grid-cols-3 p-4 font-bold text-xs uppercase tracking-wider text-[#0C1E39] border-b border-gray-200" style={{ background: "#F8F8F8" }}>
                                  <span>Ingredients</span>
                                  <span className="text-right">Amount / Serving</span>
                                  <span className="text-right">%RDA</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {[
                                    ["Chloride", "220 mg", "9.56%"],
                                    ["Magnesium", "56 mg", "12.72%"],
                                    ["Potassium", "115 mg", "3.28%"],
                                    ["Calcium", "100 mg", "10%"],
                                    ["Vitamin C", "40 mg", "50%"],
                                    ["Zinc", "5 mg", "29.4%"]
                                  ].map(([name, amt, rda]) => (
                                    <div key={name} className="grid grid-cols-3 px-4 py-3 text-sm text-[#4B5563]">
                                      <span className="font-semibold">{name}</span>
                                      <span className="text-right">{amt}</span>
                                      <span className="text-right font-semibold" style={{ color: "var(--or)" }}>{rda}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Ingredients list at bottom of the tables */}
                            <div className="p-5 rounded-2xl border border-gray-200 shadow-sm" style={{ background: "#FFFFFF" }}>
                              <p className="text-sm leading-relaxed text-[#4B5563]">
                                <strong className="text-[#0C1E39] font-bold block mb-1.5 text-xs uppercase tracking-wider text-gray-500">Ingredients:</strong>
                                Chloride, Magnesium, Potassium, Calcium, Vitamin C, Zinc, Acidity regulators (INS 330, INS 500(ii)), Malic Acid, Artificial sweetener (INS 955), Preservative (INS 211), Dextrose, Sodium Chloride, PVP K30 (Polyvinylpyrrolidone K30) (INS 1201), Natural food colour, Natural flavouring substance (Orange).
                              </p>
                            </div>

                            {/* RDA Disclaimer Footer */}
                            <p className="text-[11px] leading-relaxed text-gray-500 mt-2">
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
                                <div key={feat.text} className="flex items-center gap-3.5 p-4 rounded-xl shadow-sm"
                                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                  <span className="text-lg shrink-0 select-none">{feat.emoji}</span>
                                  <span className="text-sm font-semibold" style={{ color: "#0C1E39" }}>{feat.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tab.id === "info" && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Marketed By */}
                              <div className="p-6 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                <h4 className="text-[10px] uppercase tracking-widest mb-3 font-black text-gray-500">Marketed By</h4>
                                <p className="text-lg font-black mb-2 tracking-tight" style={{ color: "#0C1E39" }}>GLOBENT</p>
                                <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                                  A-102, Adarsh Lifestyle, New India Colony Road, Nr. Devashya School, Ahmedabad, Gujarat, 382350.
                                </p>
                                <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                  <img src="/fssai.png" alt="FSSAI" className="h-6 object-contain" />
                                  <p className="text-xs font-semibold" style={{ color: "#0C1E39" }}>
                                    <span className="opacity-60 uppercase mr-1">Lic No.:</span>10726026000527
                                  </p>
                                </div>
                              </div>

                              {/* Manufactured By */}
                              <div className="p-6 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                <h4 className="text-[10px] uppercase tracking-widest mb-4 font-black text-gray-500">Manufactured By</h4>
                                
                                <div className="mb-4">
                                  <GrowequalLogo />
                                </div>
                                
                                <p className="text-xs font-black mb-3 tracking-wide" style={{ color: "#d065b3" }}>(A WHO-GMP, HACCP Certified Company)</p>
                                <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                                  D-15, Sahjanand Business Park, S.P. Ring Road, Nikol, Ahmedabad, Gujarat - 382350, India.
                                </p>
                                <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                  <img src="/fssai.png" alt="FSSAI" className="h-6 object-contain" />
                                  <p className="text-xs font-semibold" style={{ color: "#0C1E39" }}>
                                    <span className="opacity-60 uppercase mr-1">Lic No.:</span>10723999000788
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Country of Origin */}
                            <div className="p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#4B5563" }}>Country of Origin</span>
                              <span className="text-sm font-black text-white px-4 py-2 rounded-xl uppercase tracking-wider" style={{ background: C.mint }}>India</span>
                            </div>
                          </div>
                        )}

                        {tab.id === "faqs" && (
                          <div className="space-y-3 py-1">
                            {PRODUCT_FAQS.map((faq, i) => {
                              const isFaqOpen = openFaqIndex === i;
                              return (
                                <div 
                                  key={i} 
                                  className="rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                                  style={{ 
                                    background: "#FFFFFF", 
                                    border: isFaqOpen ? "1.5px solid #FF5C00" : "1.5px solid rgba(12, 30, 57, 0.08)" 
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setOpenFaqIndex(isFaqOpen ? null : i)}
                                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors"
                                  >
                                    <span className="font-semibold text-sm md:text-base leading-snug" style={{ color: isFaqOpen ? "#FF5C00" : "#0C1E39" }}>
                                      {faq.q}
                                    </span>
                                    <span 
                                      className="shrink-0 transition-transform duration-200" 
                                      style={{ transform: isFaqOpen ? "rotate(180deg)" : "rotate(0deg)", color: isFaqOpen ? "#FF5C00" : "#0C1E39" }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                      </svg>
                                    </span>
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {isFaqOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ overflow: "hidden" }}
                                      >
                                        <div className="px-5 pb-5 pt-2 text-sm leading-relaxed" style={{ color: "#4B5563", borderTop: "1px solid rgba(12, 30, 57, 0.06)" }}>
                                          {faq.a && <p>{faq.a}</p>}
                                          {faq.intro && (
                                            <div>
                                              <p className="font-medium text-[#0C1E39] mb-2">{faq.intro}</p>
                                              <ul className="space-y-2 pl-1">
                                                {faq.bullets?.map((item, idx) => (
                                                  <li key={idx} className="flex items-start gap-2.5">
                                                    <span className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" style={{ background: "#FF5C00" }} />
                                                    <span>{item}</span>
                                                  </li>
                                                ))}
                                              </ul>
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
                        )}

                        {tab.id === "reviews" && (
                          <div className="space-y-8">
                            <div>
                              {product.reviews?.length ? (
                                <div className="space-y-4">
                                  {product.reviews.map((r: any) => (
                                    <div key={r.id} className="p-5 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: "rgba(12, 30, 57, 0.15)"} : {}}/>)}</div>
                                          <span className="font-semibold text-sm" style={{ color: "#0C1E39" }}>{r.user?.name || "Verified Buyer"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70">
                                          <CheckCircle size={12} className="text-emerald-600" />
                                          <span>Verified Purchaser</span>
                                        </div>
                                      </div>
                                      {r.title && <p className="font-medium mb-1" style={{ color: "#0C1E39" }}>{r.title}</p>}
                                      <p className="text-sm" style={{ color: "#4B5563" }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {FALLBACK_REVIEWS.map((r) => (
                                    <div key={r.id} className="p-5 rounded-2xl shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : ""} style={i >= r.rating ? {color: "rgba(12, 30, 57, 0.15)"} : {}}/>)}</div>
                                          <span className="font-semibold text-sm" style={{ color: "#0C1E39" }}>{r.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70">
                                          <CheckCircle size={12} className="text-emerald-600" />
                                          <span>Verified Purchaser</span>
                                        </div>
                                      </div>
                                      <p className="font-medium mb-1" style={{ color: "#0C1E39" }}>{r.title}</p>
                                      <p className="text-sm" style={{ color: "#4B5563" }}>{r.body}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="rounded-3xl p-6 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                              <h3 className="font-bold text-xl mb-5" style={{ color: "#0C1E39" }}>Write a Review</h3>

                              {reviewSuccess ? (
                                <div className="text-center py-6">
                                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: C.mintHex }} />
                                  <p className="font-bold" style={{ color: "#0C1E39" }}>Thank you for your review!</p>
                                  <p className="text-sm mt-1" style={{ color: "#4B5563" }}>It will appear after approval.</p>
                                </div>
                              ) : (
                                <div className="space-y-4" onClickCapture={() => {
                                  if (!token) {
                                    toast.error("Please login first to write a review!");
                                    router.push("/login");
                                  }
                                }}>
                                  <div>
                                    <label className="text-sm font-semibold block mb-2" style={{ color: "#0C1E39" }}>Your Rating</label>
                                    <div className="flex gap-1">
                                      {Array.from({length:5}).map((_,i) => (
                                        <button key={i} type="button"
                                          onMouseEnter={() => token && setReviewHover(i+1)}
                                          onMouseLeave={() => token && setReviewHover(0)}
                                          onClick={() => token && setReviewRating(i+1)}>
                                          <Star size={28}
                                            className={(reviewHover || reviewRating) > i ? "fill-yellow-400 text-yellow-400" : ""}
                                            style={(reviewHover || reviewRating) > i ? {} : {color: "rgba(12, 30, 57, 0.15)"}} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: "#0C1E39" }}>Review Title <span className="font-normal opacity-60">(optional)</span></label>
                                    <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                                      placeholder="e.g. Great product!"
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                      style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#FFFFFF", color: "#0C1E39" }}
                                      readOnly={!token} />
                                  </div>

                                  <div>
                                    <label className="text-sm font-semibold block mb-1" style={{ color: "#0C1E39" }}>Your Review</label>
                                    <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                                      rows={4} placeholder="Share your experience with this product..."
                                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                                      style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#FFFFFF", color: "#0C1E39" }}
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
      {/* ── Zoom Lightbox Modal ── */}
      {isZoomOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white z-10">
            <span className="text-sm font-semibold opacity-75">
              Image {activeImage + 1} of {images.length}
            </span>
            <button 
              onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Main Interactive Zoom View */}
          <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
            {/* Prev Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setActiveImage((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-4 h-10 w-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#0C1E39] z-10 transition-colors shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale(1);
                  setActiveImage((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 h-10 w-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-[#0C1E39] z-10 transition-colors shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            )}

            <motion.div
              className="w-full h-full flex items-center justify-center overflow-hidden"
              style={{ cursor: zoomScale === 1 ? "zoom-in" : "zoom-out" }}
              onMouseMove={handleMouseMove}
              onClick={handleImageClick}
              drag={zoomScale === 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (zoomScale > 1) return;
                const swipeThreshold = 50;
                if (info.offset.x < -swipeThreshold) {
                  // Swipe Left -> Next
                  setZoomScale(1);
                  setActiveImage((prev) => (prev + 1) % images.length);
                } else if (info.offset.x > swipeThreshold) {
                  // Swipe Right -> Prev
                  setZoomScale(1);
                  setActiveImage((prev) => (prev - 1 + images.length) % images.length);
                }
              }}
            >
              {images[activeImage]?.imageUrl ? (
                <img
                  src={cldOptimize(images[activeImage].imageUrl, 1200)}
                  alt=""
                  className="max-w-full max-h-[72vh] md:max-h-[85vh] object-contain transition-transform duration-200 select-none pointer-events-none"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: `${panOrigin.x * 100}% ${panOrigin.y * 100}%`,
                  }}
                />
              ) : (
                <Package size={80} className="text-white/20" />
              )}
            </motion.div>
          </div>

          {/* Instruction Footer */}
          <div className="p-4 text-center text-xs text-white/50 z-10">
            {zoomScale === 1 ? "Click the image to zoom in. Move mouse to pan." : "Click to zoom out."}
          </div>
        </motion.div>
      )}

      <Footer />
    </main>
  );
}
