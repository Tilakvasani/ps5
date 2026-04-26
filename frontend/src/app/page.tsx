"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package, Shield, Truck, FileText, Star, ChevronRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const FEATURES = [
  { icon: Package, title: "Premium Quality", desc: "ISI certified BOPP tapes and industrial-grade packaging materials for all your needs." },
  { icon: Truck, title: "Fast Delivery", desc: "Same-day dispatch from Ahmedabad. Pan-India delivery with live tracking." },
  { icon: Shield, title: "GST Compliant", desc: "Auto-generated GST tax invoices with proper HSN codes. Claim ITC hassle-free." },
  { icon: FileText, title: "Bulk Orders", desc: "Special pricing for bulk orders. Dedicated account manager for B2B clients." },
];

const CATEGORIES = [
  { name: "BOPP Tape", emoji: "📦", slug: "bopp-tape", desc: "Brown, transparent & printed" },
  { name: "Stretch Film", emoji: "🎁", slug: "stretch-film", desc: "Machine & hand rolls" },
  { name: "Bubble Wrap", emoji: "💨", slug: "bubble-wrap", desc: "Anti-static options available" },
  { name: "Courier Bags", emoji: "🛍️", slug: "courier-bags", desc: "Tamper-proof & POD bags" },
  { name: "Carton Box", emoji: "📫", slug: "carton-box", desc: "Single & double wall" },
  { name: "Foam Rolls", emoji: "🧴", slug: "foam-rolls", desc: "PE foam in all thicknesses" },
];

const TESTIMONIALS = [
  { name: "Rajesh Patel", role: "Warehouse Manager, Surat", rating: 5, text: "Zupwell's BOPP tapes are our go-to. Consistent quality, competitive price, and the GST invoices are perfect for our audit." },
  { name: "Priya Shah", role: "E-commerce Seller, Vadodara", rating: 5, text: "Fast delivery and genuine products. The online ordering system is smooth and the invoice PDF is exactly what we need." },
  { name: "Amit Desai", role: "Logistics Head, Ahmedabad", rating: 5, text: "Bulk orders are handled professionally. Our account manager is always available and pricing is the best in Gujarat." },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#050505] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-[80px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-pink-400 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
              Ahmedabad's #1 Packaging Supplier
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-display font-black leading-[1.05] mb-6">
            <span className="text-white">Premium</span>{" "}
            <span className="gradient-text">Packaging</span>
            <br />
            <span className="text-white">Materials</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mx-auto max-w-2xl text-lg text-white/50 leading-relaxed mb-10">
            B2B & B2C supplier of BOPP tape, stretch film, bubble wrap & industrial packaging.
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
            {[["500+", "Products"], ["10K+", "Orders/Month"], ["GST", "Compliant"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-black gradient-text">{val}</div>
                <div className="text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-3">Shop by <span className="gradient-text">Category</span></h2>
            <p className="text-white/40">Everything you need for modern packaging operations</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link href={`/products?category=${cat.slug}`}>
                  <motion.div whileHover={{ scale: 1.02, borderColor: "rgba(236,72,153,0.3)" }}
                    className="card cursor-pointer group transition-all duration-300 hover:bg-white/10">
                    <div className="text-3xl mb-3">{cat.emoji}</div>
                    <h3 className="font-display font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-sm text-white/40">{cat.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-pink-400 text-xs font-semibold">
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
          <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/8 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-3">Why <span className="gradient-text">Zupwell?</span></h2>
            <p className="text-white/40">Trusted by 1000+ businesses across Gujarat and India</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card group hover:border-pink-500/20 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-yellow-400/20 flex items-center justify-center mb-4 group-hover:from-pink-500/40 group-hover:to-yellow-400/40 transition-all">
                  <f.icon size={22} className="text-pink-400" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-3">What Clients <span className="gradient-text">Say</span></h2>
            <p className="text-white/40">Real feedback from real businesses</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div>
                  <p className="font-display font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
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
            className="rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-yellow-400/5 p-12 text-center backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
              Ready to Order in <span className="gradient-text">Bulk?</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-lg mx-auto">
              Create a free account to access GST invoices, bulk pricing, and your complete order history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary px-8 py-4">
                  Start Ordering Free
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-outline px-8 py-4">
                  View Catalogue
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
