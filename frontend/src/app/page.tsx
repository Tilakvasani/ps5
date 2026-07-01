"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight, CheckCircle, Quote, Droplets, Brain, Flame, Leaf } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
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

const WHY_CHOOSE = [
  { icon: Droplets, title: "Supports Hydration", desc: "Fast-dissolving effervescent formula speeds up water absorption at the cellular level." },
  { icon: Zap,      title: "Supports Stamina", desc: "Boosts physical endurance and helps you maintain peak energy throughout the day." },
  { icon: Flame,    title: "Helps Reduce Fatigue", desc: "Primed to quickly combat exhaustion, brain fog, and muscle tiredness." },
  { icon: Shield,   title: "Electrolyte Balance", desc: "Optimized blend of Sodium, Potassium, and Magnesium to restore vital minerals." },
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
    emoji: "⚡",
    tag: "Science",
    date: "",
    title: "Electrolytes vs Sports Drinks — What's the Difference?",
    body: "Sports drinks are loaded with sugar, artificial colours, and calories you don't need. Electrolyte supplements like Zupwell deliver the same hydration benefits — sodium, potassium, magnesium, vitamin C — with less sugar and zero compromise. The effervescent technology ensures faster absorption compared to gulping down a sugary drink. If you're working out, commuting in the heat, or simply staying productive all day, pure electrolytes beat sports drinks every single time.",
  },
  {
    emoji: "🏃",
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
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#EB9220] mb-3">Health Tips & Insights</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#001c54] mb-3">
            From Our <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-[#45353E]">Science-backed articles to fuel your health journey</p>
        </motion.div>

        {/* Cards — equal height, excerpt only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card flex flex-col hover:border-[#EB9220]/30 transition-all duration-300 cursor-pointer"
              onClick={() => setModal(i)}>
              <div className="text-4xl mb-4">{post.emoji}</div>
              <span className="text-xs font-semibold text-[#EB9220] uppercase tracking-widest">{post.tag}</span>
              <h3 className="font-bold text-[#001c54] mt-2 mb-3 leading-snug">{post.title}</h3>
              <p className="text-sm text-[#45353E] leading-relaxed line-clamp-3 flex-1">{post.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8E2D9]">
                <span className="text-xs text-[#8C8276]">{post.date}</span>
                <span className="text-xs text-[#EB9220] font-semibold flex items-center gap-1">
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
          style={{ background: "rgba(29,53,87,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-[#45353E] hover:bg-[#FCFAF6] transition-colors text-lg font-bold">
              ✕
            </button>
            <div className="text-4xl mb-3">{post.emoji}</div>
            <span className="text-xs font-semibold text-[#EB9220] uppercase tracking-widest">{post.tag}</span>
            <h3 className="text-xl font-black text-[#001c54] mt-2 mb-4 leading-snug">{post.title}</h3>
            <p className="text-sm text-[#45353E] leading-relaxed">{post.body}</p>
            <p className="text-xs text-[#8C8276] mt-6">{post.date}</p>
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
    // Load cache immediately after mount (client-only, avoids hydration mismatch)
    const cached = getSettingsCache();
    if (Object.keys(cached).length > 0) setSettings(cached);
    // Then fetch fresh in background
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
    <main className="relative min-h-screen bg-[#FCFAF6] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#EB9220]/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#001c54]/15 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div {...fadeUp(0.02)} className="inline-flex items-center gap-1.5 bg-[#EB9220] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              ⚡ ELECTROLYTE EFFERVESCENT TABLET
            </motion.div>
            
            <motion.h1 {...fadeUp(0.08)} className="text-5xl md:text-7xl lg:text-[76px] font-black leading-[0.98] tracking-tight mb-6 text-[#001c54] font-sans">
              Instant Hydration.<br />
              <span className="text-[#EB9220]">Unstoppable Stamina.</span>
            </motion.h1>
            
            <motion.p {...fadeUp(0.14)} className="text-[#45353E] text-base md:text-lg leading-relaxed mb-10 max-w-xl font-medium">
              Give your water an instant upgrade with Zupwell Orange Flavour effervescent tablets. Fast dissolving, refreshing taste, and clinically designed to beat fatigue.
            </motion.p>
            
            <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4 w-full justify-start">
              <Link href="/products/zupwell-electrolyte-effervescent-tablet-orange-flavour-15-tablets">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-base font-bold shadow-lg shadow-[#EB9220]/25">
                  Shop 15 Tablets Pack <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-outline flex items-center justify-center gap-2 px-8 py-4 text-base font-bold">
                  Explore Flavours
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.3)} className="mt-16 grid grid-cols-3 gap-8 w-full max-w-lg">
              {stats.map(([val, label]) => (
                <div key={label} className="text-left">
                  <div className="text-2xl font-black text-[#001c54]">{val}</div>
                  <div className="text-xs text-[#8C8276] font-bold uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-5 w-full flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-md aspect-[3/4] flex items-center justify-center rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-b from-[#0038a8] to-[#04122d] border border-[#E8E2D9]/10"
            >
              <img
                src="/products/zupwell-electrolyte-orange.jpg"
                alt="Zupwell Electrolyte Orange Mockup"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 select-none"
              />
              <div className="absolute bottom-6 right-6">
                <Link href="/products/zupwell-electrolyte-effervescent-tablet-orange-flavour-15-tablets">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block cursor-pointer bg-[#EB9220] text-white text-xs font-black tracking-widest px-8 py-3.5 rounded-full shadow-lg shadow-[#EB9220]/30 transition-all"
                  >
                    ₹299.00
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Zupwell ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[#001c54] mb-3">Why Choose <span className="gradient-text">Zupwell?</span></h2>
            <p className="text-[#45353E] font-semibold">Smart-Fuel for Modern Humans.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#EB9220]/20 transition-all duration-300 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#EB9220]/10 flex items-center justify-center mb-4 group-hover:bg-[#EB9220]/20 transition-all">
                  <item.icon size={24} className="text-[#EB9220]" />
                </div>
                <h3 className="font-bold text-[#001c54] mb-2">{item.title}</h3>
                <p className="text-sm text-[#45353E] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why is Our Product Special? ── */}
      <section className="py-20 px-6 bg-[#FCFAF6]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[#001c54] mb-3">Why is Our Product <span className="gradient-text">Special?</span></h2>
            <p className="text-[#45353E]">Zero-Compromise Health Boosters. Crafted for Perfection.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: Brain,    title: "Supports Nerve Function", desc: "Crucial for muscle contraction and healthy nervous system signaling." },
              { icon: Leaf,     title: "Clean Label",             desc: "Zero added sugar, no junk, and artificial-free ingredients." },
              { icon: Zap,      title: "Fast Dissolving",         desc: "Effervescent action ensures fast absorption and digestion." },
              { icon: Award,    title: "Refreshing Taste",        desc: "Zesty, delicious orange flavour that makes hydration a vibe." },
              { icon: CheckCircle, title: "15 Tablets Tube",      desc: "Convenient tube packaging that fits right in your pocket or bag." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#EB9220]/20 transition-all duration-300 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#EB9220]/10 flex items-center justify-center mb-4 group-hover:bg-[#EB9220]/20 transition-all">
                  <f.icon size={24} className="text-[#EB9220]" />
                </div>
                <h3 className="font-bold text-[#001c54] mb-2">{f.title}</h3>
                <p className="text-sm text-[#45353E] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificate logos — infinite scroll marquee ── */}
      <section className="py-10 bg-white overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#8C8276] mb-6">Certified & Compliant</p>
        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap" style={{ animationDuration: "18s" }}>
            {[...certEntries, ...certEntries, ...certEntries].map(({ key, label }, idx) =>
              s(settings, key) ? (
                <img key={idx} src={s(settings, key)} alt={label} className="h-14 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0" />
              ) : (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0 border border-[#E8E2D9] rounded-xl px-5 py-2.5">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="text-sm font-bold text-[#001c54]">{label}</span>
                  <span className="text-xs text-[#EB9220] font-semibold">Certified</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>



      {/* ── Founder's Message ── */}
      {s(settings, "founder_message") && (
        <section className="py-24 px-6 bg-white">
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="rounded-3xl overflow-hidden shadow-xl border border-[#F5EFE6]" style={{ background: "#fff" }}>
                <div className="flex flex-col md:flex-row">

                  {/* ── Left: Photo panel ── */}
                  <div className="relative md:w-56 shrink-0 flex flex-col" style={{ background: "#FCFAF6" }}>
                    {/* Green left accent stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ background: "linear-gradient(180deg, #EB9220 0%, #001c54 100%)" }} />
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
                        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 240, fontSize: 64, fontWeight: 900, color: "#001c54" }}>
                          {s(settings, "founder_name").charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Name plate */}
                    <div className="px-5 py-4 border-t border-[#E8E2D9]" style={{ background: "#fff" }}>
                      <p className="font-black text-sm text-[#001c54] leading-tight">{s(settings, "founder_name")}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "#EB9220" }}>{s(settings, "founder_title")}</p>
                    </div>
                  </div>

                  {/* ── Right: Quote panel ── */}
                  <div className="flex-1 flex flex-col justify-center px-8 py-10 relative">
                    {/* Big decorative quote marks */}
                    <div className="absolute top-6 left-6 text-7xl font-black leading-none select-none" style={{ color: "#EB9220", opacity: 0.12 }}>"</div>
                    <div className="absolute bottom-4 right-8 text-7xl font-black leading-none select-none rotate-180" style={{ color: "#EB9220", opacity: 0.12 }}>"</div>

                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#EB9220" }}>Founder's Message</p>

                    <p className="text-[#001c54] text-lg leading-relaxed font-medium italic relative z-10">
                      "{s(settings, "founder_message")}"
                    </p>

                    {/* Bottom rule + cert badge */}
                    <div className="mt-8 pt-5 border-t border-[#F5EFE6] flex items-center justify-between flex-wrap gap-3">
                      
                      {/* Green bottom accent line */}
                      
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Customer Reviews ── */}
      <section className="py-24 px-6 bg-[#FCFAF6]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#EB9220] mb-3">Real People, Real Results</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#001c54] mb-3">
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
            <p className="text-[#45353E]">Join thousands of happy customers across India</p>
          </motion.div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="card flex flex-col gap-4 hover:border-[#EB9220]/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-[#E8E2D9]"} />
                      ))}
                    </div>
                    <Quote size={20} className="text-[#EB9220]/20" />
                  </div>
                  {review.title && <p className="font-bold text-[#001c54]">{review.title}</p>}
                  <p className="text-sm text-[#45353E] leading-relaxed flex-1">"{review.body}"</p>
                  <div className="flex items-center justify-between border-t border-[#E8E2D9] pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#EB9220]/10 flex items-center justify-center text-xs font-bold text-[#EB9220]">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-semibold text-[#001c54]">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.product?.name && (
                      <span className="text-xs text-[#8C8276] truncate max-w-[120px]">{review.product.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-12 py-16 text-[#8C8276]">
              <Star size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Customer reviews coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog Section ── */}
      <BlogSection />

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#FCFAF6]">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl border border-[#EB9220]/20 bg-white p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-[#001c54] mb-4">
              Join the <span className="gradient-text">Zupwell Gang</span>
            </h2>
            <p className="text-[#45353E] mb-8 max-w-lg mx-auto">
              Create a free account to access exclusive pricing, personalised recommendations, and your complete order history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary px-8 py-4">
                  Try Zupwell
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-outline px-8 py-4">
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
