"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Award, Star, ChevronRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const FEATURES = [
  { icon: Zap, title: "Science-Backed", desc: "All products formulated with clinically studied ingredients for maximum effectiveness and bioavailability." },
  { icon: Truck, title: "Fast Delivery", desc: "Same-day dispatch from Ahmedabad. Pan-India delivery with live tracking at every step." },
  { icon: Shield, title: "GST Compliant", desc: "Auto-generated GST tax invoices with proper HSN codes. Hassle-free ITC claims for businesses." },
  { icon: Award, title: "Bulk Orders", desc: "Special pricing for bulk orders. Dedicated account manager for high-volume B2C clients." },
];

const CATEGORIES = [
  { name: "Electrolytes", emoji: "⚡", slug: "electrolytes", desc: "Hydration & recovery drinks" },
  { name: "Protein", emoji: "💪", slug: "protein", desc: "Whey, plant & blends" },
  { name: "Vitamins", emoji: "🌿", slug: "vitamins", desc: "Daily essentials & multis" },
  { name: "Immunity", emoji: "🛡️", slug: "immunity", desc: "Zinc, Vitamin C & more" },
  { name: "Effervescent", emoji: "🫧", slug: "effervescent", desc: "Fizzy tablets & sachets" },
  { name: "Wellness", emoji: "🧘", slug: "wellness", desc: "Sleep, stress & gut health" },
];

const TESTIMONIALS = [
  { name: "Rajesh Patel", role: "Fitness Trainer, Surat", rating: 5, text: "Zupwell's electrolyte sachets are a game-changer for my clients. Consistent quality, great flavours, and the GST invoices are perfect for my business records." },
  { name: "Priya Shah", role: "Marathon Runner, Vadodara", rating: 5, text: "I've tried many brands but Zupwell's effervescent tablets are by far the best. Fast delivery and genuine products every single time." },
  { name: "Amit Desai", role: "Gym Owner, Ahmedabad", rating: 5, text: "Bulk orders handled professionally. My account manager is always available, and pricing is the best for health supplements in Gujarat." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#F4F6FA] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#F47C41]/8 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#F47C41]/6 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F47C41]/30 bg-[#F47C41]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F47C41] animate-pulse" />
              Ahmedabad's #1 Health Supplement Store
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-display font-black leading-[1.05] mb-6">
            <span className="text-[#111827]">Premium</span>{" "}
            <span className="gradient-text">Health</span>
            <br />
            <span className="text-[#111827]">Supplements</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mx-auto max-w-2xl text-lg text-[#6B7280] leading-relaxed mb-10">
            Science-backed electrolytes, vitamins, protein, and wellness products.
            GST compliant invoicing. Bulk discounts available.
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
            {[["200+", "Products"], ["50K+", "Happy Customers"], ["100%", "Authentic"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-black gradient-text">{val}</div>
                <div className="text-xs text-[#6B7280] mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">Shop by <span className="gradient-text">Category</span></h2>
            <p className="text-[#6B7280]">Everything you need for your health and wellness journey</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link href={`/products?category=${cat.slug}`}>
                  <motion.div whileHover={{ scale: 1.02, borderColor: "rgba(236,72,153,0.3)" }}
                    className="card cursor-pointer group transition-all duration-300 hover:bg-[#FFFFFF]">
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

      {/* ── Features ──────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-[#F47C41]/8 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">Why <span className="gradient-text">Zupwell?</span></h2>
            <p className="text-[#6B7280]">Trusted by 50,000+ customers across Gujarat and India</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-[#F47C41]/20 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F47C41]/20 to-[#FFD166]/20 flex items-center justify-center mb-4 group-hover:from-[#F47C41]/40 group-hover:to-[#FFD166]/40 transition-all">
                  <f.icon size={22} className="text-[#F47C41]" />
                </div>
                <h3 className="font-display font-bold text-[#111827] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">What Customers <span className="gradient-text">Say</span></h2>
            <p className="text-[#6B7280]">Real feedback from real people</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-[#374151] text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div>
                  <p className="font-display font-bold text-[#111827] text-sm">{t.name}</p>
                  <p className="text-xs text-[#6B7280]">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-3xl border border-[#F47C41]/20 bg-gradient-to-br from-[#F47C41]/10 to-[#FFD166]/5 p-12 text-center backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827] mb-4">
              Start Your <span className="gradient-text">Wellness Journey</span>
            </h2>
            <p className="text-[#6B7280] mb-8 max-w-lg mx-auto">
              Create a free account to access GST invoices, exclusive pricing, and your complete order history.
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
