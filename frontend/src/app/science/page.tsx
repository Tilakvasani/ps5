"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { FlaskConical, Shield, Leaf, Droplets, Award, CheckCircle, Microscope, Package } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const CERTS = [
  {
    icon: Award,
    title: "GMP & ISO Certified",
    desc: "Manufactured in WHO-GMP and ISO certified facilities. International standards of hygiene and quality — followed without compromise.",
    color: "#0B2C6F",
    bg: "rgba(11,44,111,0.07)",
  },
  {
    icon: Shield,
    title: "FSSAI Approved",
    desc: "Every Zupwell product is manufactured and tested under the strict regulations of FSSAI — India's food safety authority.",
    color: "#F47C41",
    bg: "rgba(244,124,65,0.08)",
  },
  {
    icon: Microscope,
    title: "Lab Tested Batches",
    desc: "Each batch undergoes microbiological testing before market release. 100% verified. 100% safe.",
    color: "#2EC4B6",
    bg: "rgba(46,196,182,0.08)",
  },
];

const MANUFACTURING = [
  {
    icon: Leaf,
    title: "Premium Sourcing",
    desc: "We source raw materials from the finest suppliers worldwide. Every ingredient is laboratory tested for purity and efficacy before it ever reaches you.",
    num: "01",
  },
  {
    icon: Droplets,
    title: "Effervescent Technology",
    desc: "Our proprietary effervescent formula dissolves completely in water, unlocking fast nutrient absorption. Maximum bioavailability — every single time.",
    num: "02",
  },
];

const CLEAN = [
  { label: "No Harmful Chemicals", sub: "Free from contaminants, fillers, and synthetic binders." },
  { label: "Moisture-Lock Packaging", sub: "Precision-sealed tubes keep tablets fresh and potent for longer." },
  { label: "Transparent Labelling", sub: "What's on the label is exactly what's inside — nothing hidden." },
  { label: "No Artificial Colours", sub: "Our effervescent colour comes from nature, not a lab dye." },
];

export default function SciencePage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 20%, rgba(244,124,65,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 10% 80%, rgba(11,44,111,0.1) 0%, transparent 60%)",
          }}
        />
        {/* floating accent rings */}
        <div
          className="absolute top-24 right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ border: "2px solid #F47C41", transform: "rotate(20deg)" }}
        />
        <div
          className="absolute -bottom-10 -left-16 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ border: "3px solid #0B2C6F" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)}>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(244,124,65,0.1)",
                color: "#F47C41",
                border: "1px solid rgba(244,124,65,0.25)",
              }}
            >
              <FlaskConical size={12} /> Science & Quality
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="font-display font-black text-5xl md:text-7xl text-[#111827] leading-none mb-6">
            વિજ્ઞાન અને{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F47C41 0%, #0B2C6F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              શુદ્ધતા
            </span>
            નો સંગમ
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Zupwell Quality Standards — where cutting-edge science meets uncompromising purity. Every tablet tells a story of precision.
          </motion.p>
        </div>
      </section>

      {/* ── MANUFACTURING EXCELLENCE ── */}
      <section className="py-20 px-6 mx-auto max-w-7xl">
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F47C41] mb-3">Our Process</p>
          <h2 className="font-display font-black text-4xl md:text-5xl text-[#111827]">
            Manufacturing<br />Excellence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MANUFACTURING.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="relative rounded-3xl p-8 overflow-hidden group"
              style={{ background: "#FFFFFF", border: "1px solid #D9DEE8" }}
              whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(11,44,111,0.10)" }}
              transition={{ duration: 0.3 }}
            >
              {/* big number watermark */}
              <span
                className="absolute -top-4 -right-2 font-display font-black text-8xl pointer-events-none select-none"
                style={{ color: "rgba(11,44,111,0.04)", lineHeight: 1 }}
              >
                {item.num}
              </span>
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(244,124,65,0.10)" }}
              >
                <item.icon size={26} className="text-[#F47C41]" />
              </div>
              <h3 className="font-display font-black text-2xl text-[#111827] mb-3">{item.title}</h3>
              <p className="text-[#6B7280] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section
        className="py-24 px-6"
        style={{
          background: "linear-gradient(135deg, #0B2C6F 0%, #1E3A8A 50%, #0B2C6F 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F47C41] mb-3">Verified & Trusted</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white">
              Safety & Certifications
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto">
              Every product earns its place on your shelf through rigorous testing and official certification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CERTS.map((cert, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="rounded-3xl p-8 text-white"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{ background: "rgba(255,255,255,0.10)", borderColor: `${cert.color}60` }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: cert.bg, border: `1px solid ${cert.color}30` }}
                >
                  <cert.icon size={24} style={{ color: cert.color === "#0B2C6F" ? "#4CC9F0" : cert.color }} />
                </div>
                <h3 className="font-display font-black text-xl mb-3">{cert.title}</h3>
                <p className="text-white/65 leading-relaxed text-sm">{cert.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLEAN LABEL ── */}
      <section className="py-24 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F47C41] mb-3">No Shortcuts</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-[#111827] mb-6">
              Clean Label<br />Promise
            </h2>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
              What you see is what you get. No hidden fillers, no misleading labels, no compromises. Pure ingredients, honest transparency.
            </p>
            <div className="space-y-4">
              {CLEAN.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "#FFFFFF", border: "1px solid #D9DEE8" }}
                >
                  <CheckCircle size={20} className="text-[#2EC4B6] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#111827] font-display text-lg">{item.label}</p>
                    <p className="text-[#6B7280] text-sm mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual accent card */}
          <motion.div {...fadeUp(0.15)}>
            <div
              className="relative rounded-3xl p-10 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(244,124,65,0.06) 0%, rgba(11,44,111,0.06) 100%)",
                border: "1px solid #D9DEE8",
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(244,124,65,0.1) 0%, transparent 70%)" }} />
              <Package size={48} className="text-[#F47C41] mb-6" />
              <h3 className="font-display font-black text-3xl text-[#111827] mb-4">
                Moisture-Lock<br />Tube Design
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                Our precision-engineered tubes create an airtight barrier against humidity. Your tablets stay fresh from the day they're packed to the day you pop them.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[["Airtight Seal", "Humidity proof"], ["UV Protection", "Light resistant"], ["BPA-Free", "Safe materials"], ["Long Shelf Life", "Stays potent"]].map(([a, b]) => (
                  <div key={a} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #D9DEE8" }}>
                    <p className="font-bold text-[#111827] text-sm font-display">{a}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="py-20 px-6 mx-auto max-w-7xl">
        <motion.div
          {...fadeUp(0)}
          className="relative rounded-3xl p-12 text-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #F47C41 0%, #d9673a 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
          <h2 className="relative font-display font-black text-4xl text-white mb-4">
            Taste the Science Difference
          </h2>
          <p className="relative text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Premium ingredients. Certified quality. Unbeatable absorption. Your wellness upgrade starts here.
          </p>
          <motion.a
            href="/products"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white text-[#F47C41] font-bold px-8 py-4 rounded-2xl text-lg"
            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          >
            Shop Zupwell →
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}