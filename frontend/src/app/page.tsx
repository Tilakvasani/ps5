"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight, CheckCircle, Quote, Droplets, Brain, Flame, Leaf, Sparkles, Activity, FlaskConical, Tag, Citrus } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CertLogo } from "@/components/storefront/CertLogos";
import { publicApi } from "@/lib/api";
import { getSettingsCache, fetchSettings } from "@/lib/useSettings";
import { fadeUp } from "@/lib/utils";


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
  hero_title:       "Give Your Water a\nProfessional Upgrade.",
  hero_tagline:     "તમારા સ્વાસ્થ્ય સાથે ચાલો — ઝુપવેલ!",
  hero_subtext:     "A new and powerful addition to your water. Because plain water isn't enough for your hustle.",
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

function BlogSection() {
  const [modal, setModal] = useState<number | null>(null);
  const post = modal !== null ? BLOG_POSTS[modal] : null;
  return (
    <section className="py-24 px-6" style={{ background: "#0C1E3E" }}>
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "12px" }}>Health Tips & Insights</p>
          <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>
            From Our Blog
          </h2>
          <p style={{ color: "#8F9CAE" }}>Science-backed articles to fuel your health journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="zcard flex flex-col cursor-pointer"
              onClick={() => setModal(i)}>
              <div className="text-4xl mb-4">{post.emoji}</div>
              <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", textTransform: "uppercase", letterSpacing: "1px" }}>{post.tag}</span>
              <h3 className="font-black mt-2 mb-3 leading-snug" style={{ color: "#627d98", fontSize: "15px", letterSpacing: "-0.03em" }}>{post.title}</h3>
              <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: "#8F9CAE" }}>{post.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #1E2D4A" }}>
                <span style={{ fontSize: "10px", color: "#627d98" }}>{post.date}</span>
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
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
              style={{ background: "#1E2D4A", color: "#8F9CAE" }}>
              ✕
            </button>
            <div className="text-4xl mb-3">{post.emoji}</div>
            <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", textTransform: "uppercase", letterSpacing: "1px" }}>{post.tag}</span>
            <h3 className="text-xl font-black mt-2 mb-4 leading-snug" style={{ color: "#627d98", letterSpacing: "-0.03em" }}>{post.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8F9CAE" }}>{post.body}</p>
            <p style={{ fontSize: "10px", color: "#627d98", marginTop: "24px" }}>{post.date}</p>
          </motion.div>
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const cached = getSettingsCache();
    if (Object.keys(cached).length > 0) setSettings(cached);
    fetchSettings().then(setSettings).catch(() => {});
    publicApi.getReviews().then(setReviews).catch(() => {});
  }, []);

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
  ];
  const hasCerts = certEntries.some(({ key }) => s(settings, key));

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
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full" 
                style={{ 
                  background: "rgba(255, 92, 0, 0.12)", 
                  color: "var(--or)",
                  border: "1px solid rgba(255, 92, 0, 0.25)",
                  boxShadow: "0 0 16px rgba(255, 92, 0, 0.15)"
                }}
              >
                ⚡ ELECTROLYTE EFFERVESCENT TABLET
              </span>
            </motion.div>

            <motion.h1 
              {...fadeUp(0.05)} 
              className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 text-white" 
              style={{ letterSpacing: "-0.03em" }}
            >
              Instant <br />
              <span style={{ color: "var(--wh)" }}>Hydration.</span> <br />
              <span className="gradient-text">Unstoppable <br />Stamina.</span>
            </motion.h1>

            <motion.p 
              {...fadeUp(0.12)} 
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl text-left" 
              style={{ color: "#F8F8F8", opacity: 0.8 }}
            >
              Give your water an instant upgrade with Zupwell Orange Flavour effervescent tablets. Fast dissolving, refreshing taste, and clinically designed to beat fatigue.
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
              <Link href="/products" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="zbtn-out flex items-center justify-center gap-2 w-full"
                  style={{ padding: "16px 36px", fontSize: "14px", borderRadius: "30px" }}
                >
                  Explore Flavours
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Premium Mockup display */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] p-10 flex flex-col items-center justify-center overflow-hidden border-2 border-[#0C1E39]"
              style={{ 
                background: "radial-gradient(circle at 50% 50%, rgba(12, 30, 57, 0.8) 0%, rgba(5, 17, 36, 0.9) 100%)",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
              }}
            >
              {/* Product mockup card inner plate */}
              <div 
                className="w-full flex-1 rounded-3xl p-8 flex flex-col items-center justify-between text-center relative border border-white/5"
                style={{ 
                  background: "#051124",
                  boxShadow: "0 16px 32px rgba(0,0,0,0.3)"
                }}
              >
                {/* badge label */}
                <span 
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{ background: "var(--or)", color: "var(--wh)" }}
                >
                  HEALTH SUPPLEMENT
                </span>

                {/* center visual (mockup citrus illustration) */}
                <div className="my-6 relative flex flex-col items-center">
                  <div className="text-6xl animate-bounce" style={{ filter: "drop-shadow(0 8px 16px rgba(255,184,0,0.3))" }}>🍊</div>
                  <div className="text-4xl mt-2 select-none">⚡</div>
                </div>

                {/* branding info */}
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">zupwell</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: "var(--lm)" }}>ELECTROLYTE</p>
                  <p className="text-[9px] mt-2 opacity-60" style={{ color: "#F8F8F8" }}>ORANGE FLAVOUR • 15 TABLETS</p>
                </div>

                {/* price tag button */}
                <div 
                  className="w-full py-3.5 rounded-2xl font-black text-base transition-transform cursor-pointer"
                  style={{ background: "var(--lm)", color: "var(--dk)" }}
                >
                  ₹299.00
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>


      {/* ── Why is Our Product Special? ── */}
      <section className="py-20 px-6" style={{ background: "var(--dk)" }}>
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
              Why is Our Product <span style={{ color: "var(--or)" }}>Special?</span>
            </h2>
            <p style={{ color: "#F8F8F8", opacity: 0.85 }}>Zero-Compromise Health Boosters. Crafted for Perfection.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: FlaskConical, title: "Scientific Formula", desc: "A fusion of science and taste." },
              { icon: Activity,     title: "Less Sugar",         desc: "There is sweetness, but no guilt." },
              { icon: Zap,          title: "Instant Absorption", desc: "Rocket-like speed, instant action." },
              { icon: Tag,          title: "Pocket Friendly",    desc: "It even fits in your jeans pocket." },
              { icon: Citrus,       title: "Best Flavour",       desc: "Absolutely fresh, as if straight from the garden." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="zcard text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(255, 92, 0, 0.1)" }}>
                  <f.icon size={24} style={{ color: "var(--or)" }} />
                </div>
                <h3 className="font-black mb-2" style={{ color: "#FFFFFF", fontSize: "14px", letterSpacing: "-0.03em" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#F8F8F8", opacity: 0.8 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificate logos — infinite scroll marquee ── */}
      <section className="py-10 overflow-hidden" style={{ background: "#0C1E39", borderTop: "1.5px solid #0C1E39", borderBottom: "1.5px solid #0C1E39" }}>
        <p className="text-center mb-6" style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "#F8F8F8", opacity: 0.85, textTransform: "uppercase" }}>
          Certified & Compliant
        </p>
        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap" style={{ animationDuration: "9s" }}>
            {[...certEntries, ...certEntries, ...certEntries].map(({ key, label }, idx) =>
              s(settings, key) ? (
                <img key={idx} src={s(settings, key)} alt={label} className="h-14 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0" />
              ) : (
                <CertLogo key={idx} label={label} className="h-14 opacity-70 hover:opacity-100 transition-opacity" />
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Founder's Message ── */}
      {s(settings, "founder_message") && (
        <section className="py-24 px-6" style={{ background: "var(--dk)" }}>
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="overflow-hidden" style={{ borderRadius: "10px", border: "1.5px solid #0C1E39" }}>
                <div className="flex flex-col md:flex-row">

                  {/* Left: Photo panel */}
                  <div className="relative md:w-56 shrink-0 flex flex-col" style={{ background: "#0C1E39" }}>
                    {/* Orange left accent stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ background: "linear-gradient(180deg, var(--or) 0%, #FFB800 100%)" }} />
                    {/* Photo */}
                    <div className="flex-1 overflow-hidden" style={{ minHeight: 240 }}>
                      {s(settings, "founder_photo") ? (
                        <img
                          src={s(settings, "founder_photo")}
                          alt={s(settings, "founder_name")}
                          className="w-full h-full"
                          style={{ objectFit: "cover", objectPosition: "top center", minHeight: 240 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 240, fontSize: 64, fontWeight: 900, color: "var(--or)" }}>
                          {s(settings, "founder_name").charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Name plate */}
                    <div className="px-5 py-4" style={{ borderTop: "1px solid #0C1E39", background: "#0C1E39" }}>
                      <p className="font-black text-sm leading-tight" style={{ color: "#FFFFFF" }}>{s(settings, "founder_name")}</p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: "var(--or)" }}>{s(settings, "founder_title")}</p>
                    </div>
                  </div>

                  {/* Right: Quote panel */}
                  <div className="flex-1 flex flex-col justify-center px-8 py-10 relative" style={{ background: "#0C1E39" }}>
                    {/* Big decorative quote marks */}
                    <div className="absolute top-6 left-6 text-7xl font-black leading-none select-none" style={{ color: "var(--or)", opacity: 0.12 }}>"</div>
                    <div className="absolute bottom-4 right-8 text-7xl font-black leading-none select-none rotate-180" style={{ color: "var(--or)", opacity: 0.12 }}>"</div>

                    <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "16px" }}>Founder's Message</p>

                    <p className="text-lg leading-relaxed font-medium italic relative z-10" style={{ color: "#F8F8F8", opacity: 0.85 }}>
                      "{s(settings, "founder_message")}"
                    </p>

                    <div className="mt-8 pt-5 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: "1px solid #0C1E39" }}>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Customer Reviews ── */}
      <section className="py-24 px-6" style={{ background: "#0C1E39" }}>
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
            <p style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.2px", color: "var(--or)", textTransform: "uppercase", marginBottom: "12px" }}>Real People, Real Results</p>
            <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
              What Our Customers Say
            </h2>
            <p style={{ color: "#F8F8F8", opacity: 0.8 }}>Join thousands of happy customers across India</p>
          </motion.div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="zcard flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} style={{ fill: j < review.rating ? "var(--or)" : "#051124", color: j < review.rating ? "var(--or)" : "#051124" }} />
                      ))}
                    </div>
                    <Quote size={20} style={{ color: "rgba(255, 92, 0, 0.2)" }} />
                  </div>
                  {review.title && <p className="font-black" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>{review.title}</p>}
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#F8F8F8", opacity: 0.8 }}>"{review.body}"</p>
                  <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: "1px solid #051124" }}>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                        style={{ background: "rgba(255, 92, 0, 0.2)", color: "var(--or)" }}>
                        {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>{review.user?.name || "Customer"}</span>
                    </div>
                    {review.product?.name && (
                      <span className="text-xs truncate max-w-[120px]" style={{ color: "#F8F8F8", opacity: 0.85 }}>{review.product.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-12 py-16" style={{ color: "#FFFFFF" }}>
              <Star size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Customer reviews coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog Section ── */}
      <BlogSection />

      {/* ── CTA ── */}
      <section className="py-24 px-6" style={{ background: "var(--dk)" }}>
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="p-12 text-center"
            style={{ background: "#0C1E39", borderRadius: "10px", border: "1.5px solid #0C1E39" }}>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
              Join the <span style={{ color: "var(--or)" }}>Zupwell Gang</span>
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "#F8F8F8", opacity: 0.8 }}>
              Create a free account to access exclusive pricing, personalised recommendations, and your complete order history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-or"
                  style={{ padding: "14px 28px", fontSize: "13px" }}>
                  Sign In
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-out"
                  style={{ padding: "14px 28px", fontSize: "13px" }}>
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
