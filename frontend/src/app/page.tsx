"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight, CheckCircle, Quote } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { publicApi } from "@/lib/api";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const FEATURE_ICONS = [Zap, Shield, Truck, Award];

const CATEGORIES = [
  { name: "Electrolytes", emoji: "⚡", slug: "electrolytes", desc: "Hydration & recovery drinks" },
  { name: "Protein",      emoji: "💪", slug: "protein",      desc: "Whey, plant & blends" },
  { name: "Vitamins",     emoji: "🌿", slug: "vitamins",     desc: "Daily essentials & multis" },
  { name: "Immunity",     emoji: "🛡️", slug: "immunity",     desc: "Zinc, Vitamin C & more" },
  { name: "Effervescent", emoji: "🫧", slug: "effervescent", desc: "Fizzy tablets & sachets" },
  { name: "Wellness",     emoji: "🧘", slug: "wellness",     desc: "Sleep, stress & gut health" },
];

// Default values — used until settings load or if setting is empty
const D = {
  hero_badge:       "Ahmedabad's #1 Health Supplement Store",
  hero_title:       "A True Companion to Your Health",
  hero_tagline:     "તમારા સ્વાસ્થ્ય સાથે ચાલો — ઝુપવેલ!",
  hero_subtext:     "Science-backed electrolytes, vitamins, protein, and wellness products. Quality is our mantra.",
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

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    publicApi.getSettings().then(setSettings).catch(() => {});
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

  const hasCerts = s(settings, "cert_fssai_logo") || s(settings, "cert_iso_logo") || s(settings, "cert_gmp_logo");

  return (
    <main className="relative min-h-screen bg-[#F4F6FA] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#F47C41]/8 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/10 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F47C41]/30 bg-[#F47C41]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F47C41] animate-pulse" />
              {s(settings, "hero_badge")}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-display font-black leading-[1.05] mb-4">
            <span className="gradient-text">{s(settings, "hero_title")}</span>
          </motion.h1>

          {s(settings, "hero_tagline") && (
            <motion.p {...fadeUp(0.15)} className="text-lg text-[#F47C41] font-semibold mb-4">
              {s(settings, "hero_tagline")}
            </motion.p>
          )}

          <motion.p {...fadeUp(0.2)} className="mx-auto max-w-2xl text-lg text-[#6B7280] leading-relaxed mb-10">
            {s(settings, "hero_subtext")}
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                Browse Products <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-outline flex items-center gap-2 px-8 py-4 text-base">
                Create Account <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp(0.4)} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-black gradient-text">{val}</div>
                <div className="text-xs text-[#6B7280] mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why is our product special ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">Why is our product <span className="gradient-text">special?</span></h2>
            <p className="text-[#6B7280]">Everything you need, nothing you don't</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#F47C41]/20 transition-all duration-300 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#F47C41]/10 flex items-center justify-center mb-4 group-hover:bg-[#F47C41]/20 transition-all">
                  <f.icon size={24} className="text-[#F47C41]" />
                </div>
                <h3 className="font-display font-bold text-[#111827] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificate logos ── */}
      {hasCerts && (
        <section className="py-12 px-6 bg-[#F4F6FA]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-6">Certified & Compliant</p>
            <div className="flex items-center justify-center gap-10 flex-wrap">
              {[
                { key: "cert_fssai_logo", label: "FSSAI" },
                { key: "cert_iso_logo",   label: "ISO" },
                { key: "cert_gmp_logo",   label: "GMP" },
              ].map(({ key, label }) =>
                s(settings, key) ? (
                  <img key={key} src={s(settings, key)} alt={label} className="h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <div key={key} className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] border border-[#D9DEE8] rounded-lg px-4 py-2">
                    <CheckCircle size={14} className="text-emerald-500" /> {label} Certified
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">Shop by <span className="gradient-text">Category</span></h2>
            <p className="text-[#6B7280]">Everything you need for your health and wellness journey</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link href={`/products?category=${cat.slug}`}>
                  <motion.div whileHover={{ scale: 1.02 }} className="card cursor-pointer group transition-all duration-300 hover:bg-[#FFFFFF]">
                    <div className="text-3xl mb-3">{cat.emoji}</div>
                    <h3 className="font-display font-bold text-[#111827] mb-1">{cat.name}</h3>
                    <p className="text-sm text-[#6B7280]">{cat.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-[#F47C41] text-xs font-semibold">
                      Shop now <ChevronRight size={12} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder's Message ── */}
      {s(settings, "founder_message") && (
        <section className="py-24 px-6 bg-white">
          <div className="mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="card flex flex-col md:flex-row gap-8 items-center">
              {/* Photo */}
              <div className="shrink-0">
                {s(settings, "founder_photo") ? (
                  <img src={s(settings, "founder_photo")} alt={s(settings, "founder_name")}
                    className="h-32 w-32 rounded-full object-cover border-4 border-[#F47C41]/20" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-[#F47C41]/10 flex items-center justify-center text-4xl font-display font-black text-[#F47C41]">
                    {s(settings, "founder_name").charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-3">Founder's Message</p>
                <p className="text-[#374151] leading-relaxed italic mb-4">"{s(settings, "founder_message")}"</p>
                <p className="font-display font-bold text-[#111827]">— {s(settings, "founder_name")}</p>
                <p className="text-sm text-[#6B7280]">{s(settings, "founder_title")}</p>
              </div>
            </motion.div>
          </div>
        </section>
      )}


      {/* ── Customer Reviews ── */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-3">Real People, Real Results</p>
              <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">
                What Our <span className="gradient-text">Customers Say</span>
              </h2>
              <p className="text-[#6B7280]">Join thousands of happy customers across India</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="card flex flex-col gap-4 hover:border-[#F47C41]/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-[#D9DEE8]"} />
                      ))}
                    </div>
                    <Quote size={20} className="text-[#F47C41]/20" />
                  </div>
                  {review.title && <p className="font-display font-bold text-[#111827]">{review.title}</p>}
                  <p className="text-sm text-[#374151] leading-relaxed flex-1">"{review.body}"</p>
                  <div className="flex items-center justify-between border-t border-[#D9DEE8] pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#F47C41]/10 flex items-center justify-center text-xs font-bold text-[#F47C41]">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-semibold text-[#111827]">{review.user?.name || "Customer"}</span>
                    </div>
                    {review.product?.name && (
                      <span className="text-xs text-[#9CA3AF] truncate max-w-[120px]">{review.product.name}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl border border-[#F47C41]/20 bg-gradient-to-br from-[#F47C41]/10 to-[#FFD166]/5 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827] mb-4">
              Start Your <span className="gradient-text">Wellness Journey</span>
            </h2>
            <p className="text-[#6B7280] mb-8 max-w-lg mx-auto">
              Create a free account to access exclusive pricing and your complete order history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary px-8 py-4">
                  Get Started Free
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-outline px-8 py-4">
                  View Products
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