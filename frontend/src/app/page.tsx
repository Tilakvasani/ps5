"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight, CheckCircle, Quote, Droplets, Brain, Flame, Leaf, Sparkles, Activity, FlaskConical, Tag, Citrus } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CertLogo } from "@/components/storefront/CertLogos";
import { publicApi, productsApi } from "@/lib/api";
import { useSettings } from "@/lib/useSettings";
import { fadeUp, cldOptimize } from "@/lib/utils";


const FEATURE_ICONS = [Zap, Shield, Truck, Award];

const CATEGORIES = [
  { name: "Electrolytes", emoji: "⚡", slug: "electrolytes", desc: "Hydration & recovery drinks" },
  { name: "Protein",      emoji: "💪", slug: "protein",      desc: "Whey, plant & blends" },
  { name: "Vitamins",     emoji: "🌿", slug: "vitamins",     desc: "Daily essentials & multis" },
  { name: "Immunity",     emoji: "🛡️", slug: "immunity",     desc: "Zinc, Vitamin C & more" },
  { name: "Effervescent", emoji: "🫧", slug: "effervescent", desc: "Fizzy tablets & sachets" },
  { name: "Wellness",     emoji: "🧘", slug: "wellness",     desc: "Sleep, stress & gut health" },
];


const D = {
  hero_title:       "Hydration\nSupport.\nElectrolyte\nBalance.",
  hero_subtext:     "Enjoy refreshing orange-flavoured electrolyte effervescent tablets with essential electrolytes and vitamins. Fast dissolving and convenient for everyday hydration support with a great-tasting fizz.",
  hero_stat1_value: "200+",  hero_stat1_label: "Products",
  hero_stat2_value: "50K+",  hero_stat2_label: "Happy Customers",
  hero_stat3_value: "100%",  hero_stat3_label: "Authentic",
  feature1_title: "Science-Backed",   feature1_desc: "Formulated with clinically studied ingredients for maximum effectiveness.",
  feature2_title: "Sugar-Free",       feature2_desc: "Great taste without the sugar load. Health that's actually delicious.",
  feature3_title: "Instant Energy",   feature3_desc: "Fast-absorbing effervescent formula. Drop, fizz, drink, go.",
  feature4_title: "Best Flavour",     feature4_desc: "We believe health shouldn't taste boring. Every sip is a vibe.",
  founder_name:    "Parag Hirpara",
  founder_title:   "Founder & CEO",
  founder_message: "At Zupwell, I started with a simple observation: traditional supplements often feel like a chore — hard to swallow, slow to absorb, and difficult to integrate into a busy life. I founded Zupwell to bridge the gap between clinical effectiveness and modern convenience. Through Zupwell, my endeavor is to ensure that everyone can fulfil their dreams without compromising their health.",
  founder_photo:   "",
};

const s = (settings: Record<string, string>, key: string) =>
  settings[key] || D[key as keyof typeof D] || "";

const STATIC_REVIEWS = [
  {
    id: "static_1",
    name: "Aarav Patel",
    location: "Verified Purchaser",
    rating: 5,
    body: "Must buy for Ahmedabad summer heat! I take 1 tablet daily before my evening run. No more muscle cramps and dehydration. Taste is also very nice, exactly like orange juice.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_2",
    name: "Sneha Rao",
    location: "Verified Purchaser",
    rating: 5,
    body: "Highly recommended. I travel everyday in Mumbai local and get completely exhausted by afternoon. This Zupwell tablet gives a quick boost of energy and keeps me active throughout the day.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_3",
    name: "Kabir Malhotra",
    location: "Verified Purchaser",
    rating: 5,
    body: "Really good for morning recovery after a late night party. Just drop one tablet in cold water and drink. Headache vanishes very quickly. Hydration is instant.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_4",
    name: "Priya Sharma",
    location: "Verified Purchaser",
    rating: 5,
    body: "Switched my afternoon coffee with Zupwell. Best decision ever. No coffee jitters or acidity anymore, and it keeps me super focused and hydrated in the AC office all day.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_5",
    name: "Rajesh Iyer",
    location: "Verified Purchaser",
    rating: 5,
    body: "Excellent product. It is completely sugar-free so safe for my diabetes. The orange flavour is very natural, not like other medicines which taste artificial.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_6",
    name: "Ananya Gupta",
    location: "Verified Purchaser",
    rating: 5,
    body: "My gym trainer told me to try this during workouts. Very easy to drink compared to heavy sports drinks, and muscle recovery is much faster. No stomach heaviness.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_7",
    name: "Vikram Singh",
    location: "Verified Purchaser",
    rating: 5,
    body: "Took these tablets on our family trip to Jaisalmer last week. Life saver in the hot sun. Very easy to carry in pocket, just drop in normal water bottles. Everyone loved it.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_8",
    name: "Meera Deshmukh",
    location: "Verified Purchaser",
    rating: 5,
    body: "My daughter gifted this to me for my daily morning walks. I feel much less tired now. Tastes very refreshing and so easy to use, just drop in water and watch it fizz.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_9",
    name: "Aditya Verma",
    location: "Verified Purchaser",
    rating: 5,
    body: "I play football on weekends and used to get bad calf cramps. Started taking Zupwell before the match and haven't got a single cramp since then. Very good product.",
    productName: "Effervescent Tablet"
  },
  {
    id: "static_10",
    name: "Riya Sen",
    location: "Verified Purchaser",
    rating: 5,
    body: "Replacing cold drinks with this fizz tablet. Tastes amazing, very refreshing, and helps a lot with daily hydration. Perfect drink for the 3 PM office slump.",
    productName: "Effervescent Tablet"
  }
];


const BLOG_POSTS = [
  {
    emoji: "💧",
    tag: "Hydration",
    date: "",
    title: "Why Hydration is the #1 Performance Hack",
    body: "Most people underestimate the power of hydration. Even a 2% drop in body water can reduce your physical performance by up to 20% and cloud your mental focus. Plain water alone doesn't cut it — your body also needs electrolytes like sodium, potassium, and magnesium to actually absorb and use that water at the cellular level. That's exactly why Zupwell's effervescent formula is built around rapid hydration science — giving your cells what they need in seconds, not hours.",
  },
  {
    emoji: "🔍",
    tag: "Science",
    date: "",
    title: "Electrolytes vs Sports Drinks — What's the Difference?",
    body: "Sports drinks are loaded with sugar, artificial colours, and calories you don't need. Electrolyte supplements like Zupwell deliver the same hydration benefits — sodium, potassium, magnesium, vitamin C — with less sugar and zero compromise. The effervescent technology ensures faster absorption compared to gulping down a sugary drink. If you're working out, commuting in the heat, or simply staying productivity all day, pure electrolytes beat sports drinks every single time.",
  },
  {
    emoji: "💪",
    tag: "Performance",
    date: "",
    title: "Pre-Workout Nutrition: What Actually Works",
    body: "Forget complicated pre-workout stacks. The most effective pre-workout routine is surprisingly simple: hydration + fast energy. Start with an electrolyte tablet in water 20–30 minutes before training. This primes your muscles with the minerals they need for contraction and recovery. Add a light carb source if you're doing heavy lifting. Skip the mega-dose caffeine powders — they spike and crash. Zupwell's clean formula gives you steady energy without the jitters or the inevitable afternoon crash.",
  },
];

function BlogSection({ reviews, settings }: { reviews: any[], settings: Record<string, string> }) {
  const [modal, setModal] = useState<number | null>(null);
  const post = modal !== null ? BLOG_POSTS[modal] : null;
  return (
    <section className="py-24 px-6" style={{ background: "#0C1E39" }}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "12px" }}>Health Tips & Insights</p>
          <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#F8F8F8", letterSpacing: "-0.04em" }}>
            {settings["home_blog_title"] || "From Our Blog"}
          </h2>
          <p style={{ color: "#F8F8F8" }}>{settings["home_blog_subtext"] || "Science-backed articles to fuel your health journey"}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="zcard flex flex-col cursor-pointer"
              style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}
              onClick={() => setModal(i)}>
              <div className="text-4xl mb-4">{post.emoji}</div>
              <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", textTransform: "uppercase", letterSpacing: "1px" }}>{post.tag}</span>
              <h3 className="font-black mt-2 mb-3 leading-snug" style={{ color: "#0C1E39", fontSize: "15px", letterSpacing: "-0.03em" }}>{post.title}</h3>
              <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: "#4A5568" }}>{post.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(12, 30, 57, 0.08)" }}>
                <span style={{ fontSize: "10px", color: "#6B7280" }}>{post.date}</span>
                <span style={{ fontSize: "11px", color: "var(--or)", fontWeight: 700 }} className="flex items-center gap-1">
                  Read more <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal overlay */}
      {post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,17,36,0.8)", backdropFilter: "blur(4px)" }}
          onClick={() => setModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="zcard max-w-lg w-full p-8 relative"
            style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 20px 50px rgba(12, 30, 57, 0.15)", borderRadius: "24px" }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
              style={{ background: "#0C1E39", color: "#FFFFFF" }}>
              ✕
            </button>
            <div className="text-4xl mb-3">{post.emoji}</div>
            <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", textTransform: "uppercase", letterSpacing: "1px" }}>{post.tag}</span>
            <h3 className="text-xl font-black mt-2 mb-4 leading-snug" style={{ color: "#0C1E39", letterSpacing: "-0.03em" }}>{post.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#4A5568" }}>{post.body}</p>
            <p style={{ fontSize: "10px", color: "#6B7280", marginTop: "24px" }}>{post.date}</p>
          </motion.div>
        </div>
      )}


    </section>
  );
}

export default function HomePage() {
  const { raw: settings, loading } = useSettings();
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const activeIndex = reviewsList.length > 0 ? (virtualIndex % reviewsList.length) : 0;

  useEffect(() => {
    publicApi.getReviews().then((dbReviews) => {
      // Filter to only include 5-star reviews from database
      const db5Star = (dbReviews || []).filter((r: any) => Number(r.rating) === 5);
      
      const formattedDb = db5Star.map((r: any) => ({
        id: `db_${r.id}`,
        name: r.user?.name || "Verified Buyer",
        location: "Verified Purchaser",
        rating: 5,
        body: r.body,
        productName: r.product?.name || "Effervescent Tablet",
      }));

      const staticMapped = STATIC_REVIEWS.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        rating: r.rating,
        body: r.body,
        productName: r.productName,
      }));

      const combined = [...formattedDb, ...staticMapped];
      setReviewsList(combined);
      setVirtualIndex(combined.length);
    }).catch(() => {
      const staticMapped = STATIC_REVIEWS.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        rating: r.rating,
        body: r.body,
        productName: r.productName,
      }));
      setReviewsList(staticMapped);
      setVirtualIndex(staticMapped.length);
    });

    productsApi.list({ page: 1, perPage: 1 })
      .then(data => {
        if (data?.products?.length) setFeaturedProduct(data.products[0]);
      })
      .catch(() => {});
  }, []);

  // Auto-slide effect every 5 seconds by shifting the virtualIndex
  useEffect(() => {
    if (reviewsList.length === 0) return;
    const interval = setInterval(() => {
      setVirtualIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviewsList]);

  // Instantly re-enable transitions after boundary reset jumps
  useEffect(() => {
    if (!isTransitionEnabled) {
      const timeout = setTimeout(() => {
        setIsTransitionEnabled(true);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [isTransitionEnabled]);

  const features = [1, 2, 3, 4].map(n => ({
    icon: FEATURE_ICONS[n - 1],
    title: s(settings, `feature${n}_title`),
    desc:  s(settings, `feature${n}_desc`),
  }));

  const stats = [
    [s(settings, "hero_stat1_value"), s(settings, "hero_stat1_label")],
    [s(settings, "hero_stat2_value"), s(settings, "hero_stat2_label")],
    [s(settings, "hero_stat3_value"), s(settings, "hero_stat3_label")],
  ];

  const certEntries = [
    { key: "cert_fssai_logo", label: "FSSAI" },
    { key: "cert_iso_logo",   label: "ISO" },
    { key: "cert_gmp_logo",   label: "GMP" },
    { key: "cert_haccp_logo", label: "HACCP" },
    { key: "cert_gst_logo",   label: "GST" },
    { key: "cert_iec_logo",   label: "IEC" },
    { key: "cert_msme_logo",  label: "MSME" },
    { key: "cert_tm_logo",    label: "TM" },
  ];
  const hasCerts = certEntries.some(({ key }) => s(settings, key));

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--dk)" }}>
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)" }} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-10 h-[600px] w-[600px] rounded-full filter blur-[120px] opacity-25" style={{ background: "radial-gradient(circle, var(--or) 0%, transparent 70%)" }} />
          <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full filter blur-[100px] opacity-10" style={{ background: "radial-gradient(circle, var(--lm) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bold Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div {...fadeUp(0.0)} className="mb-6">
              <span 
                className="inline-flex items-center gap-2 font-black uppercase tracking-wider px-4 py-2 rounded-full" 
                style={{ 
                  background: "rgba(255, 92, 0, 0.12)", 
                  color: "var(--or)",
                  border: "1px solid rgba(255, 92, 0, 0.25)",
                  boxShadow: "0 0 16px rgba(255, 92, 0, 0.15)",
                  fontSize: "14px"
                }}
              >
                {s(settings, "hero_badge") || "⚡ ELECTROLYTE EFFERVESCENT TABLET"}
              </span>
            </motion.div>

            <motion.h1 
              {...fadeUp(0.05)} 
              className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 text-white" 
              style={{ letterSpacing: "-0.03em" }}
            >
              {s(settings, "hero_title").split("\n").map((line, idx, arr) => {
                // If title is stored as a single line (or fails to split by newline), split it at "Electrolyte"
                if (arr.length === 1) {
                  const target = "Electrolyte";
                  const targetIdx = line.indexOf(target);
                  if (targetIdx !== -1) {
                    const firstPart = line.substring(0, targetIdx);
                    const secondPart = line.substring(targetIdx);
                    return (
                      <span key={idx}>
                        {firstPart} <br />
                        <span style={{ color: "var(--or)" }} className="gradient-text">
                          {secondPart}
                        </span>
                      </span>
                    );
                  }
                }
                const isHighlight = idx >= 2 || line.toLowerCase().includes("electrolyte") || line.toLowerCase().includes("balance");
                return (
                  <span 
                    key={idx} 
                    style={isHighlight ? { color: "var(--or)" } : {}}
                    className={isHighlight ? "gradient-text" : ""}
                  >
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </span>
                );
              })}
            </motion.h1>


            <motion.p 
              {...fadeUp(0.12)} 
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl text-left" 
              style={{ color: "#F8F8F8", opacity: 0.8 }}
            >
              {s(settings, "hero_subtext")}
            </motion.p>

            <motion.div {...fadeUp(0.18)} className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Link href="/products" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="zbtn-or flex items-center justify-center gap-2 w-full"
                  style={{ padding: "16px 36px", fontSize: "14px", borderRadius: "30px", boxShadow: "0 8px 24px rgba(255, 92, 0, 0.25)" }}
                >
                  Shop 15 Tablets Pack →
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Premium Mockup display */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <Link href={featuredProduct ? `/products/${featuredProduct.slug}` : "/products"} className="w-full max-w-[420px] aspect-[4/5] block">
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#0C1E39] cursor-pointer relative"
                style={{ 
                  backgroundImage: `url(${featuredProduct?.images?.[0]?.imageUrl || ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4)"
                }}
              />
            </Link>
          </div>

        </div>
      </section>


      {/* ── Certificate logos — infinite scroll marquee ── */}
      <section className="pt-10 pb-5 overflow-hidden" style={{ background: "#FFFFFF", borderTop: "1.5px solid #EAEAEA", borderBottom: "1.5px solid #EAEAEA" }}>
        <p className="text-center mb-6" style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "#0C1E39", opacity: 0.85, textTransform: "uppercase" }}>
          Certified & Compliant
        </p>
        <div className="relative flex overflow-x-hidden">
          <div className="flex gap-16 animate-marquee whitespace-nowrap shrink-0 pr-16" style={{ animationDuration: "25s" }}>
            {certEntries.map(({ key, label }, idx) => {
              const isIso = label.toUpperCase().includes("ISO");
              const isGst = label.toUpperCase().includes("GST");
              const isIec = label.toUpperCase().includes("IEC");
              const isMsme = label.toUpperCase().includes("MSME");
              const isTm = label.toUpperCase().includes("TM");
              return s(settings, key) ? (
                (isIso || isMsme) ? (
                  <div key={idx} className="inline-flex items-center justify-center shrink-0 rounded-full opacity-70 hover:opacity-100 transition-opacity" style={{ background: "#FFFFFF", width: "56px", height: "56px", padding: "3px" }}>
                    <img src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={112} className="w-full h-full object-contain rounded-full"  loading="lazy" decoding="async" />
                  </div>
                ) : (isGst || isIec || isTm) ? (
                  <div key={idx} className="inline-flex items-center justify-center shrink-0 rounded-full opacity-70 hover:opacity-100 transition-opacity overflow-hidden relative" style={{ background: "#FFFFFF", width: "56px", height: "56px" }}>
                    <img src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={112} className={`w-full h-full object-contain rounded-full ${isGst ? "scale-[1.12]" : "scale-[1.08]"}`}  loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <img key={idx} src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={56} className="h-14 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0"  loading="lazy" decoding="async" />
                )
              ) : (
                <CertLogo key={idx} label={label} className="h-14 opacity-70 hover:opacity-100 transition-opacity" />
              );
            })}
          </div>
          <div className="flex gap-16 animate-marquee whitespace-nowrap shrink-0 pr-16" style={{ animationDuration: "25s" }} aria-hidden="true">
            {certEntries.map(({ key, label }, idx) => {
              const isIso = label.toUpperCase().includes("ISO");
              const isGst = label.toUpperCase().includes("GST");
              const isIec = label.toUpperCase().includes("IEC");
              const isMsme = label.toUpperCase().includes("MSME");
              const isTm = label.toUpperCase().includes("TM");
              return s(settings, key) ? (
                (isIso || isMsme) ? (
                  <div key={idx} className="inline-flex items-center justify-center shrink-0 rounded-full opacity-70 hover:opacity-100 transition-opacity" style={{ background: "#FFFFFF", width: "56px", height: "56px", padding: "3px" }}>
                    <img src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={112} className="w-full h-full object-contain rounded-full"  loading="lazy" decoding="async" />
                  </div>
                ) : (isGst || isIec || isTm) ? (
                  <div key={idx} className="inline-flex items-center justify-center shrink-0 rounded-full opacity-70 hover:opacity-100 transition-opacity overflow-hidden relative" style={{ background: "#FFFFFF", width: "56px", height: "56px" }}>
                    <img src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={112} className={`w-full h-full object-contain rounded-full ${isGst ? "scale-[1.12]" : "scale-[1.08]"}`}  loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <img key={idx} src={cldOptimize(s(settings, key), 112)} alt={label} width={112} height={56} className="h-14 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0"  loading="lazy" decoding="async" />
                )
              ) : (
                <CertLogo key={idx} label={label} className="h-14 opacity-70 hover:opacity-100 transition-opacity" />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Founder's Message ── */}
      {s(settings, "founder_message") && (
        <section className="pt-12 pb-12 px-6" style={{ background: "var(--gy)" }}>
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="overflow-hidden" style={{ borderRadius: "20px", border: "1.5px solid #EAEAEA", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                <div className="flex flex-col md:flex-row">

                  {/* Left: Photo panel */}
                  <div className="relative md:w-56 shrink-0 flex flex-col" style={{ background: "#0C1E39" }}>
                    {/* Orange left accent stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ background: "linear-gradient(180deg, var(--or) 0%, #FFB800 100%)" }} />
                    {/* Photo */}
                    <div className="flex-1 overflow-hidden" style={{ minHeight: 240 }}>
                      {s(settings, "founder_photo") ? (
                        <img
                          src={cldOptimize(s(settings, "founder_photo"), 448)}
                          alt={s(settings, "founder_name")}
                          width={448}
                          height={480}
                          className="w-full h-full"
                          style={{ objectFit: "cover", objectPosition: "top center", minHeight: 240 }}
                         loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 240, fontSize: 64, fontWeight: 900, color: "var(--or)" }}>
                          {s(settings, "founder_name").charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Name plate */}
                    <div className="px-5 py-4" style={{ borderTop: "1px solid #051124", background: "#0C1E39" }}>
                      <p className="font-black text-sm leading-tight" style={{ color: "#FFFFFF" }}>{s(settings, "founder_name")}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: "var(--or)" }}>{s(settings, "founder_title")}</p>
                    </div>
                  </div>

                  {/* Right: Quote panel */}
                  <div className="flex-1 flex flex-col justify-center px-8 py-10 relative" style={{ background: "#FFFFFF" }}>
                    {/* Big decorative quote marks */}
                    <div className="absolute top-6 left-6 text-7xl font-black leading-none select-none" style={{ color: "var(--or)", opacity: 0.10 }}>"</div>
                    <div className="absolute bottom-4 right-8 text-7xl font-black leading-none select-none rotate-180" style={{ color: "var(--or)", opacity: 0.10 }}>"</div>

                    <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "16px" }}>Founder's Message</p>

                    <p className="text-lg leading-relaxed font-medium italic relative z-10 text-[#0C1E39]">
                      "{s(settings, "founder_message")}"
                    </p>

                    <div className="mt-8 pt-5 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: "1px solid #EAEAEA" }}>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Customer Reviews Slider ── */}
      <section className="pt-10 pb-24 px-6 overflow-hidden relative" style={{ background: "var(--gy)" }}>
        <style dangerouslySetInnerHTML={{__html: `
          .reviews-container {
            --card-w: 380px;
            --card-g: 24px;
          }
          @media (max-width: 768px) {
            .reviews-container {
              --card-w: 320px;
              --card-g: 20px;
            }
          }
          @media (max-width: 480px) {
            .reviews-container {
              --card-w: 285px;
              --card-g: 16px;
            }
          }
        `}} />

        <div className="mx-auto max-w-7xl reviews-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "12px" }}>Real People, Real Results</p>
            <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>
              What Our Customers Say
            </h2>
            <p style={{ color: "#4A5568", opacity: 0.8 }}>Join thousands of happy customers across India</p>
          </motion.div>

          {reviewsList.length > 0 && (
            <div className="relative w-full overflow-visible py-8">
              <div 
                className="flex items-center py-4"
                style={{
                  transform: `translate3d(calc(50% - var(--card-w) / 2 - ${virtualIndex} * (var(--card-w) + var(--card-g))), 0, 0)`,
                  gap: 'var(--card-g)',
                  transition: isTransitionEnabled ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                }}
                onTransitionEnd={() => {
                  const N = reviewsList.length;
                  if (N === 0) return;
                  if (virtualIndex >= 2 * N) {
                    setIsTransitionEnabled(false);
                    setVirtualIndex(virtualIndex - N);
                  } else if (virtualIndex < N) {
                    setIsTransitionEnabled(false);
                    setVirtualIndex(virtualIndex + N);
                  }
                }}
              >
                {[...reviewsList, ...reviewsList, ...reviewsList].map((review, idx) => {
                  const N = reviewsList.length;
                  const isActive = idx === virtualIndex;
                  return (
                    <div 
                      key={`${review.id}_rep_${Math.floor(idx / N)}`}
                      className="flex flex-col items-center shrink-0 select-none"
                      style={{ width: 'var(--card-w)' }}
                    >
                      {/* Name & Location */}
                      <div className="text-center mb-4">
                        <h4 className="font-black text-base text-[#0C1E39] leading-tight">{review.name}</h4>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{review.location}</p>
                      </div>

                      {/* Card body container */}
                      <div 
                        className="w-full rounded-2xl p-6 transition-all duration-500 flex flex-col gap-3 min-h-[190px] shadow-sm relative cursor-pointer"
                        style={{
                          background: isActive 
                            ? 'linear-gradient(135deg, #FF5C00 0%, #FF8C00 100%)' 
                            : '#FFFFFF',
                          border: isActive 
                            ? '1.5px solid #FF5C00' 
                            : '1.5px solid rgba(12, 30, 57, 0.08)',
                          color: isActive ? '#FFFFFF' : '#0C1E39',
                          transform: isActive ? 'scale(1.04)' : 'scale(0.96)',
                          boxShadow: isActive ? '0 12px 32px rgba(255, 92, 0, 0.2)' : '0 4px 20px rgba(12, 30, 57, 0.01)',
                        }}
                        onClick={() => setVirtualIndex(idx)}
                      >
                        {/* Five stars */}
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star 
                              key={j} 
                              size={14} 
                              style={{ 
                                fill: isActive ? '#FFFFFF' : '#FFB800', 
                                color: isActive ? '#FFFFFF' : '#FFB800' 
                              }} 
                            />
                          ))}
                        </div>

                        {/* Body */}
                        <p 
                          className="text-xs sm:text-sm leading-relaxed flex-1"
                          style={{ color: isActive ? 'rgba(255, 255, 255, 0.95)' : '#4A5568' }}
                        >
                          "{review.body}"
                        </p>

                        {/* Product Name tag */}
                        {review.productName && (
                          <div 
                            className="text-[9px] uppercase font-bold self-start px-2.5 py-1 rounded-full mt-2"
                            style={{
                              background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(12, 30, 57, 0.04)',
                              color: isActive ? '#FFFFFF' : '#0C1E39',
                            }}
                          >
                            {review.productName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button 
              onClick={() => setVirtualIndex((prev) => prev - 1)}
              className="p-2.5 rounded-full border border-[#0C1E39]/10 hover:bg-[#FF5C00]/10 hover:border-[#FF5C00] text-[#0C1E39] hover:text-[#FF5C00] transition-all bg-white shadow-sm cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>

            <div className="flex gap-2 max-w-[200px] overflow-x-auto py-1">
              {reviewsList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setVirtualIndex(reviewsList.length + idx)}
                  className="h-2 rounded-full transition-all duration-300 shrink-0 cursor-pointer"
                  style={{
                    width: idx === activeIndex ? '18px' : '8px',
                    background: idx === activeIndex ? '#FF5C00' : 'rgba(12, 30, 57, 0.15)',
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={() => setVirtualIndex((prev) => prev + 1)}
              className="p-2.5 rounded-full border border-[#0C1E39]/10 hover:bg-[#FF5C00]/10 hover:border-[#FF5C00] text-[#0C1E39] hover:text-[#FF5C00] transition-all bg-white shadow-sm cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Blog Section ── */}
      <BlogSection reviews={reviewsList} settings={settings} />

      {/* ── CTA ── */}
      <section className="py-24 px-6" style={{ background: "var(--gy)" }}>
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="p-12 text-center"
            style={{ 
              background: "linear-gradient(135deg, #0C1E39 0%, #051124 100%)", 
              borderRadius: "20px", 
              border: "1.5px solid #0C1E39" 
            }}>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
              {settings["home_cta_title"] ? (
                settings["home_cta_title"].split(" ").map((w, idx) => (
                  idx === settings["home_cta_title"].split(" ").length - 1 ? (
                    <span key={idx} style={{ color: "var(--or)" }}>{w} </span>
                  ) : (
                    w + " "
                  )
                ))
              ) : (
                <>Join the <span style={{ color: "var(--or)" }}>Zupwell Gang</span></>
              )}
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "#F8F8F8", opacity: 0.8 }}>
              {settings["home_cta_subtext"] || "Create a free account to access exclusive pricing, personalised recommendations, and your complete order history."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-or"
                  style={{ padding: "14px 36px", fontSize: "13px", borderRadius: "30px" }}>
                  Sign In
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-out"
                  style={{ padding: "14px 36px", fontSize: "13px", borderRadius: "30px" }}>
                  Upgrade Your Water
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
