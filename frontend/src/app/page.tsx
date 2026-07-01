"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight, CheckCircle, Quote, Droplets, Brain, Flame, Leaf, Smile } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { publicApi } from "@/lib/api";
import { getSettingsCache, fetchSettings } from "@/lib/useSettings";
import { fadeUp } from "@/lib/utils";

const GOALS = [
  {
    name: "Energy & Focus",
    emoji: "⚡",
    slug: "energy",
    desc: "Boost daily productivity and focus",
    color: "#E8F5E9", // Green tint
    textColor: "#2E7D32",
    bottleColor: "from-[#48C062] to-[#1B5E20]"
  },
  {
    name: "Skin & Glow",
    emoji: "🌸",
    slug: "skin-health",
    desc: "Promote healthy, radiant skin from within",
    color: "#FCE4EC", // Rose tint
    textColor: "#C2185B",
    bottleColor: "from-[#F06292] to-[#880E4F]"
  },
  {
    name: "Immunity Support",
    emoji: "🛡️",
    slug: "immunity",
    desc: "Strengthen your body's natural defenses",
    color: "#E8EAF6", // Indigo/Blue tint
    textColor: "#1A237E",
    bottleColor: "from-[#5C6BC0] to-[#0D47A1]"
  },
  {
    name: "Stress & Mood",
    emoji: "🧘",
    slug: "wellness",
    desc: "Adapt to stress and balance your mood",
    color: "#FFF3E0", // Amber/Yellow tint
    textColor: "#E65100",
    bottleColor: "from-[#FFB74D] to-[#E65100]"
  }
];

const BLOG_POSTS = [
  {
    emoji: "💧",
    tag: "Hydration",
    date: "July 1, 2026",
    title: "Why Hydration is the #1 Performance Hack",
    body: "Most people underestimate the power of hydration. Even a 2% drop in body water can reduce your physical performance by up to 20% and cloud your mental focus. Plain water alone doesn't cut it — your body also needs electrolytes like sodium, potassium, and magnesium to actually absorb and use that water at the cellular level. That's exactly why Zupwell's effervescent formula is built around rapid hydration science — giving your cells what they need in seconds, not hours.",
  },
  {
    emoji: "⚡",
    tag: "Science",
    date: "June 25, 2026",
    title: "Electrolytes vs Sports Drinks — What's the Difference?",
    body: "Sports drinks are loaded with sugar, artificial colours, and calories you don't need. Electrolyte supplements like Zupwell deliver the same hydration benefits — sodium, potassium, magnesium, vitamin C — with less sugar and zero compromise. The effervescent technology ensures faster absorption compared to gulping down a sugary drink. If you're working out, commuting in the heat, or simply staying productive all day, pure electrolytes beat sports drinks every single time.",
  },
  {
    emoji: "🏃",
    tag: "Performance",
    date: "June 18, 2026",
    title: "Pre-Workout Nutrition: What Actually Works",
    body: "Forget complicated pre-workout stacks. The most effective pre-workout routine is surprisingly simple: hydration + fast energy. Start with an electrolyte tablet in water 20–30 minutes before training. This primes your muscles with the minerals they need for contraction and recovery. Add a light carb source if you're doing heavy lifting. Skip the mega-dose caffeine powders — they spike and crash. Zupwell's clean formula gives you steady energy without the jitters or the inevitable afternoon crash.",
  },
];

function BlogSection() {
  const [modal, setModal] = useState<number | null>(null);
  const post = modal !== null ? BLOG_POSTS[modal] : null;
  return (
    <section className="py-24 px-6 bg-white border-t border-[#E8E2D9]">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] mb-3">Health Tips & Insights</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#002A30] mb-3">
            Wellness <span className="text-[#48C062]">Guide</span>
          </h2>
          <p className="text-[#45353E] text-sm">Science-backed articles to fuel your health journey</p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card flex flex-col hover:border-[#48C062]/30 transition-all duration-300 cursor-pointer bg-white"
              onClick={() => setModal(i)}>
              <div className="text-4xl mb-4">{post.emoji}</div>
              <span className="font-sans text-[10px] font-bold text-[#48C062] uppercase tracking-[0.12em]">{post.tag}</span>
              <h3 className="font-display font-bold text-lg text-[#002A30] mt-2 mb-3 leading-snug">{post.title}</h3>
              <p className="text-sm text-[#45353E] leading-relaxed line-clamp-3 flex-1">{post.body}</p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8E2D9]">
                <span className="text-xs text-[#8C8276]">{post.date}</span>
                <span className="font-sans text-xs text-[#48C062] font-bold flex items-center gap-1">
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
          style={{ background: "rgba(0,42,48,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-[#45353E] hover:bg-[#FCFAF6] transition-colors text-sm font-bold">
              ✕
            </button>
            <div className="text-4xl mb-3">{post.emoji}</div>
            <span className="font-sans text-[10px] font-bold text-[#48C062] uppercase tracking-[0.12em]">{post.tag}</span>
            <h3 className="font-display text-xl font-bold text-[#002A30] mt-2 mb-4 leading-snug">{post.title}</h3>
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
    const cached = getSettingsCache();
    if (Object.keys(cached).length > 0) setSettings(cached);
    fetchSettings().then(setSettings).catch(() => {});
    publicApi.getReviews().then(setReviews).catch(() => {});
  }, []);

  const certEntries = [
    { key: "cert_fssai_logo", label: "FSSAI" },
    { key: "cert_iso_logo",   label: "ISO" },
    { key: "cert_gmp_logo",   label: "GMP" },
    { key: "cert_haccp_logo", label: "HACCP" },
  ];

  return (
    <main className="relative min-h-screen bg-[#FCFAF6] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 px-6 md:px-12 bg-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 h-[500px] w-[500px] rounded-full bg-[#48C062]/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-yellow-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-sans text-xs font-bold uppercase tracking-[0.12em]">
              <Smile size={14} /> Science-backed supplements
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-[#002A30] leading-[1.05] tracking-tight">
              Glow. Feel.<br />
              <span className="text-[#48C062]">Be you.</span>
            </h1>
            <p className="text-[#45353E] text-base md:text-lg max-w-lg leading-relaxed">
              Clean, science-backed vitamins and electrolytes formulated to fuel your daily hustle and elevate your body's potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full sm:w-auto px-8 py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold bg-[#48C062]">
                  Shop Now
                </motion.button>
              </Link>
              <Link href="/products?category=electrolytes">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn-outline w-full sm:w-auto px-8 py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold border-[#E8E2D9]">
                  Explore Bundles
                </motion.button>
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#E8E2D9]">
              {["Clean Ingredients", "Science Backed", "Vegan-Friendly"].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCFAF6] border border-[#E8E2D9] text-[#45353E] text-xs font-semibold">
                  <CheckCircle size={12} className="text-[#48C062]" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero dynamic graphics panel (represents supplements mockup) */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="absolute h-[380px] w-[380px] md:h-[480px] md:w-[480px] rounded-full bg-[#FCFAF6] border border-[#E8E2D9] -z-10" />
            
            {/* Visual Supplement Bottles Representations */}
            <div className="relative flex justify-center items-end h-[350px] w-[320px] md:h-[420px] md:w-[380px] gap-4">
              
              {/* Bottle 1: Daily Multi */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                whileHover={{ y: -8 }}
                className="w-1/2 aspect-[1/2] rounded-3xl bg-gradient-to-b from-[#E8F5E9] to-[#C8E6C9] border border-[#A5D6A7] shadow-xl p-4 flex flex-col justify-between items-center text-center cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#48C062]/20 flex items-center justify-center font-bold text-sm text-[#2E7D32]">01</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-[#48C062] to-[#1B5E20] shadow-md mb-2 flex items-center justify-center font-display font-black text-white text-xs tracking-wider">ZUP</div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#1B5E20]">Daily Multi</h4>
                  <p className="text-[9px] text-[#2E7D32]/80 mt-0.5">Energy Boost</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#2E7D32] text-white text-[9px] font-bold">VEGAN</div>
              </motion.div>

              {/* Bottle 2: Glow Skin */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ y: -8 }}
                className="w-1/2 aspect-[1/2] rounded-3xl bg-gradient-to-b from-[#FCE4EC] to-[#F8BBD0] border border-[#F48FB1] shadow-xl p-4 flex flex-col justify-between items-center text-center cursor-pointer select-none translate-y-[-20px]"
              >
                <div className="w-8 h-8 rounded-full bg-[#F06292]/20 flex items-center justify-center font-bold text-sm text-[#C2185B]">02</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-[#F06292] to-[#880E4F] shadow-md mb-2 flex items-center justify-center font-display font-black text-white text-xs tracking-wider">ZUP</div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#880E4F]">Glow Skin</h4>
                  <p className="text-[9px] text-[#C2185B]/80 mt-0.5">Hydration</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#C2185B] text-white text-[9px] font-bold">ORGANIC</div>
              </motion.div>
            </div>

            {/* Float element badge */}
            <div className="absolute top-10 left-10 p-3 bg-white rounded-2xl shadow-lg border border-[#E8E2D9] flex items-center gap-2 animate-bounce">
              <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-600">🌟</div>
              <div>
                <p className="text-[10px] font-bold text-[#002A30] uppercase tracking-wider">Top Rated</p>
                <p className="text-[9px] text-[#8C8276]">4.8/5.0 Stars</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-24 px-6 bg-[#FCFAF6] border-t border-[#E8E2D9]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#002A30] mb-3">Shop by your goal</h2>
            <p className="text-[#45353E] text-sm">Select a health priority to explore formulated wellness blends.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GOALS.map((goal) => (
              <Link href={`/products?category=${goal.slug}`} key={goal.name}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl p-6 flex flex-col justify-between items-start h-[260px] cursor-pointer shadow-sm transition-shadow hover:shadow-md border border-black/5"
                  style={{ backgroundColor: goal.color }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-3xl">{goal.emoji}</span>
                    <span className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <ArrowRight size={14} style={{ color: goal.textColor }} />
                    </span>
                  </div>
                  
                  {/* Decorative Bottle Representation in Card */}
                  <div className="w-10 h-14 rounded-lg bg-gradient-to-b opacity-25 mt-2 self-end" style={{ backgroundImage: `linear-gradient(to bottom, var(--tw-gradient-stops))` }} className={`self-end w-10 h-14 rounded-lg bg-gradient-to-b ${goal.bottleColor} opacity-20`} />

                  <div>
                    <h3 className="font-display font-bold text-xl mb-1" style={{ color: goal.textColor }}>
                      {goal.name}
                    </h3>
                    <p className="text-xs text-[#45353E] opacity-90 leading-snug">{goal.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Indicator Banner */}
      <section className="py-8 bg-[#48C062] text-white px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <p className="font-sans text-sm font-bold uppercase tracking-[0.08em]">
              Free shipping on all orders over ₹499!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Customer avatars pile */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 w-8 rounded-full border-2 border-[#48C062] bg-[#FCFAF6] flex items-center justify-center text-[10px] font-bold text-[#002A30]">
                  {["A", "P", "S", "M"][n - 1]}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] opacity-90">
              Loved by 18,000+ happy customers
            </p>
          </div>
        </div>
      </section>

      {/* Certificate logos - Infinite Marquee */}
      <section className="py-12 bg-white border-b border-[#E8E2D9] overflow-hidden">
        <p className="text-center font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#8C8276] mb-8">Certified & Compliant</p>
        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap" style={{ animationDuration: "20s" }}>
            {[...certEntries, ...certEntries, ...certEntries].map(({ key, label }, idx) =>
              settings[key] ? (
                <img key={idx} src={settings[key]} alt={label} className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0" />
              ) : (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0 border border-[#E8E2D9] bg-[#FCFAF6] rounded-2xl px-6 py-3 shadow-sm">
                  <CheckCircle size={14} className="text-[#48C062]" />
                  <span className="font-display text-sm font-black text-[#002A30] tracking-wider">{label}</span>
                  <span className="font-sans text-[10px] text-[#48C062] font-bold uppercase tracking-wider">Certified</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      {settings["founder_message"] && (
        <section className="py-24 px-6 bg-white">
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="rounded-3xl overflow-hidden shadow-premium border border-[#E8E2D9] bg-white">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Founder photo side */}
                  <div className="relative md:w-64 shrink-0 flex flex-col bg-[#FCFAF6] border-r border-[#E8E2D9]">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#48C062]" />
                    <div className="flex-1 overflow-hidden" style={{ minHeight: 260 }}>
                      {settings["founder_photo"] ? (
                        <img src={settings["founder_photo"]} alt={settings["founder_name"]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-black text-6xl text-[#002A30]">
                          {settings["founder_name"]?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-4 bg-white border-t border-[#E8E2D9]">
                      <p className="font-display font-bold text-base text-[#002A30] leading-tight">{settings["founder_name"]}</p>
                      <p className="font-sans text-xs font-bold text-[#48C062] uppercase tracking-wider mt-1">{settings["founder_title"]}</p>
                    </div>
                  </div>

                  {/* Founder Message side */}
                  <div className="flex-1 flex flex-col justify-center px-8 py-12 relative bg-white">
                    <div className="absolute top-6 left-6 text-8xl font-serif font-black leading-none select-none text-[#48C062]/10">“</div>
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] mb-4">Founder's Message</p>
                    <p className="text-[#002A30] text-lg leading-relaxed font-medium italic relative z-10">
                      "{settings["founder_message"]}"
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      <section className="py-24 px-6 bg-[#FCFAF6] border-t border-[#E8E2D9]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] mb-3">Real People, Real Results</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-[#002A30]">
              What Our <span className="text-[#48C062]">Community Says</span>
            </h2>
            <p className="text-[#45353E] text-sm mt-2">Join thousands of happy customers on their wellness journey</p>
          </motion.div>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="card flex flex-col gap-5 hover:border-[#48C062]/20 transition-all bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "fill-yellow-400 text-yellow-400 animate-pulse" : "text-[#E8E2D9]"} />
                      ))}
                    </div>
                    <Quote size={20} className="text-[#48C062]/10" />
                  </div>
                  {review.title && <p className="font-display font-bold text-sm text-[#002A30] uppercase tracking-wider">{review.title}</p>}
                  <p className="text-sm text-[#45353E] leading-relaxed flex-1 italic">"{review.body}"</p>
                  <div className="flex items-center justify-between border-t border-[#E8E2D9] pt-4 mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#48C062]/10 flex items-center justify-center text-xs font-bold text-[#48C062]">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#002A30]">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.product?.name && (
                      <span className="text-[10px] font-bold text-[#8C8276] truncate max-w-[120px]">{review.product.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#8C8276]">
              <Star size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-semibold">Community reviews coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />

      {/* Brand CTA */}
      <section className="py-24 px-6 bg-[#FCFAF6] border-t border-[#E8E2D9]">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl border border-[#48C062]/20 bg-white p-12 text-center shadow-sm">
            <h2 className="font-display text-3xl md:text-5xl font-black text-[#002A30] mb-4">
              Join the <span className="text-[#48C062]">ZUPWELL Club</span>
            </h2>
            <p className="text-[#45353E] mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              Create a free account to unlock exclusive perks, personalized supplement matchers, and special member pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full sm:w-auto px-8 py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                  Try Zupwell
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="btn-outline w-full sm:w-auto px-8 py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold border-[#E8E2D9]">
                  Upgrade Your Routine
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
