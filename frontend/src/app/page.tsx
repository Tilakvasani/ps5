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
  { icon: Droplets, title: "Water Upgrade", desc: "Give your plain water a powerful, professional upgrade with every sip." },
  { icon: Zap,      title: "Performance Fuel", desc: "Fast-absorbing formula designed for your busy, non-stop lifestyle." },
  { icon: Brain,    title: "Science-Backed", desc: "Formulated with clinically studied ingredients for real results." },
  { icon: Leaf,     title: "Clean Ingredients", desc: "No junk, no fillers. Just what your body actually needs." },
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#45B08C] mb-3">Health Tips & Insights</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-3">
            From Our <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-[#4A6A82]">Science-backed articles to fuel your health journey</p>
        </motion.div>

        {/* Cards — equal height, excerpt only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="card flex flex-col hover:border-[#45B08C]/30 transition-all duration-300 cursor-pointer"
              onClick={() => setModal(i)}>
              <div className="text-4xl mb-4">{post.emoji}</div>
              <span className="text-xs font-semibold text-[#45B08C] uppercase tracking-widest">{post.tag}</span>
              <h3 className="font-bold text-[#1D3557] mt-2 mb-3 leading-snug">{post.title}</h3>
              <p className="text-sm text-[#4A6A82] leading-relaxed line-clamp-3 flex-1">{post.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#C8DCEA]">
                <span className="text-xs text-[#7A9BB5]">{post.date}</span>
                <span className="text-xs text-[#45B08C] font-semibold flex items-center gap-1">
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
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-[#4A6A82] hover:bg-[#F1FAFF] transition-colors text-lg font-bold">
              ✕
            </button>
            <div className="text-4xl mb-3">{post.emoji}</div>
            <span className="text-xs font-semibold text-[#45B08C] uppercase tracking-widest">{post.tag}</span>
            <h3 className="text-xl font-black text-[#1D3557] mt-2 mb-4 leading-snug">{post.title}</h3>
            <p className="text-sm text-[#4A6A82] leading-relaxed">{post.body}</p>
            <p className="text-xs text-[#7A9BB5] mt-6">{post.date}</p>
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
    <main className="relative min-h-screen bg-[#F1FAFF] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#45B08C]/10 " />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/10 " />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.h1 {...fadeUp(0.05)} className="text-5xl md:text-7xl font-black leading-[1.08] mb-4 whitespace-pre-line">
            <span className="gradient-text">{s(settings, "hero_title")}</span>
          </motion.h1>

          {s(settings, "hero_tagline") && (
            <motion.p {...fadeUp(0.12)} className="text-lg text-[#45B08C] font-semibold mb-4">
              {s(settings, "hero_tagline")}
            </motion.p>
          )}

          <motion.p {...fadeUp(0.18)} className="mx-auto max-w-2xl text-lg text-[#4A6A82] leading-relaxed mb-10">
            {s(settings, "hero_subtext")}
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                Choose Your Power <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-outline flex items-center gap-2 px-8 py-4 text-base">
                Start Your Hustle <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.4)} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black gradient-text">{val}</div>
                <div className="text-xs text-[#4A6A82] mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Zupwell ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-3">Why Choose <span className="gradient-text">Zupwell?</span></h2>
            <p className="text-[#4A6A82] font-semibold">Smart-Fuel for Modern Humans.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#45B08C]/20 transition-all duration-300 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#45B08C]/10 flex items-center justify-center mb-4 group-hover:bg-[#45B08C]/20 transition-all">
                  <item.icon size={24} className="text-[#45B08C]" />
                </div>
                <h3 className="font-bold text-[#1D3557] mb-2">{item.title}</h3>
                <p className="text-sm text-[#4A6A82] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why is Our Product Special? ── */}
      <section className="py-20 px-6 bg-[#F1FAFF]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-3">Why is Our Product <span className="gradient-text">Special?</span></h2>
            <p className="text-[#4A6A82]">Zero-Compromise Health Boosters. Crafted for Perfection.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: Brain,    title: "Scientific Formula", desc: "A fusion of science and taste." },
              { icon: Leaf,     title: "Less Sugar",         desc: "There is sweetness, but no guilt." },
              { icon: Zap,      title: "Instant Absorption", desc: "Rocket-like speed, instant action." },
              { icon: Shield,   title: "Pocket Friendly",    desc: "It even fits in your jeans pocket." },
              { icon: Award,    title: "Best Flavour",       desc: "Absolutely fresh, as if straight from the garden." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#45B08C]/20 transition-all duration-300 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#45B08C]/10 flex items-center justify-center mb-4 group-hover:bg-[#45B08C]/20 transition-all">
                  <f.icon size={24} className="text-[#45B08C]" />
                </div>
                <h3 className="font-bold text-[#1D3557] mb-2">{f.title}</h3>
                <p className="text-sm text-[#4A6A82] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificate logos — infinite scroll marquee ── */}
      <section className="py-10 bg-white overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#7A9BB5] mb-6">Certified & Compliant</p>
        <div className="relative">
          <div className="flex gap-12 animate-marquee whitespace-nowrap" style={{ animationDuration: "18s" }}>
            {[...certEntries, ...certEntries, ...certEntries].map(({ key, label }, idx) =>
              s(settings, key) ? (
                <img key={idx} src={s(settings, key)} alt={label} className="h-14 object-contain opacity-70 hover:opacity-100 transition-opacity inline-block shrink-0" />
              ) : (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0 border border-[#C8DCEA] rounded-xl px-5 py-2.5">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="text-sm font-bold text-[#1D3557]">{label}</span>
                  <span className="text-xs text-[#45B08C] font-semibold">Certified</span>
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
              <div className="rounded-3xl overflow-hidden shadow-xl border border-[#E8F4EF]" style={{ background: "#fff" }}>
                <div className="flex flex-col md:flex-row">

                  {/* ── Left: Photo panel ── */}
                  <div className="relative md:w-56 shrink-0 flex flex-col" style={{ background: "#F1FAFF" }}>
                    {/* Green left accent stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ background: "linear-gradient(180deg, #45B08C 0%, #1D3557 100%)" }} />
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
                        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 240, fontSize: 64, fontWeight: 900, color: "#1D3557" }}>
                          {s(settings, "founder_name").charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Name plate */}
                    <div className="px-5 py-4 border-t border-[#C8DCEA]" style={{ background: "#fff" }}>
                      <p className="font-black text-sm text-[#1D3557] leading-tight">{s(settings, "founder_name")}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "#45B08C" }}>{s(settings, "founder_title")}</p>
                    </div>
                  </div>

                  {/* ── Right: Quote panel ── */}
                  <div className="flex-1 flex flex-col justify-center px-8 py-10 relative">
                    {/* Big decorative quote marks */}
                    <div className="absolute top-6 left-6 text-7xl font-black leading-none select-none" style={{ color: "#45B08C", opacity: 0.12 }}>"</div>
                    <div className="absolute bottom-4 right-8 text-7xl font-black leading-none select-none rotate-180" style={{ color: "#45B08C", opacity: 0.12 }}>"</div>

                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#45B08C" }}>Founder's Message</p>

                    <p className="text-[#1D3557] text-lg leading-relaxed font-medium italic relative z-10">
                      "{s(settings, "founder_message")}"
                    </p>

                    {/* Bottom rule + cert badge */}
                    <div className="mt-8 pt-5 border-t border-[#E8F4EF] flex items-center justify-between flex-wrap gap-3">
                      
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
      <section className="py-24 px-6 bg-[#F1FAFF]">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#45B08C] mb-3">Real People, Real Results</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-3">
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
            <p className="text-[#4A6A82]">Join thousands of happy customers across India</p>
          </motion.div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="card flex flex-col gap-4 hover:border-[#45B08C]/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-[#C8DCEA]"} />
                      ))}
                    </div>
                    <Quote size={20} className="text-[#45B08C]/20" />
                  </div>
                  {review.title && <p className="font-bold text-[#1D3557]">{review.title}</p>}
                  <p className="text-sm text-[#4A6A82] leading-relaxed flex-1">"{review.body}"</p>
                  <div className="flex items-center justify-between border-t border-[#C8DCEA] pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#45B08C]/10 flex items-center justify-center text-xs font-bold text-[#45B08C]">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-semibold text-[#1D3557]">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.product?.name && (
                      <span className="text-xs text-[#7A9BB5] truncate max-w-[120px]">{review.product.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-12 py-16 text-[#7A9BB5]">
              <Star size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Customer reviews coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog Section ── */}
      <BlogSection />

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#F1FAFF]">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl border border-[#45B08C]/20 bg-white p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-[#1D3557] mb-4">
              Join the <span className="gradient-text">Zupwell Gang</span>
            </h2>
            <p className="text-[#4A6A82] mb-8 max-w-lg mx-auto">
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