"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { FlaskConical, Shield, Leaf, Droplets, Award, CheckCircle, Microscope, Package } from "lucide-react";
import { fadeUp } from "@/lib/utils";


const CERTS = [
  {
    icon: Award,
    title: "GMP & ISO Certified",
    desc: "Manufactured in WHO-GMP and ISO certified facilities. International standards of hygiene and quality — followed without compromise.",
    color: "#1D3557",
    bg: "#EAF0F7",
  },
  {
    icon: Shield,
    title: "FSSAI Approved",
    desc: "Every Zupwell product is manufactured and tested under the strict regulations of FSSAI — India's food safety authority.",
    color: "#45B08C",
    bg: "#EBF7F3",
  },
  {
    icon: Microscope,
    title: "Lab Tested Batches",
    desc: "Each batch undergoes microbiological testing before market release. 100% verified. 100% safe.",
    color: "#45B08C",
    bg: "#EBF7F3",
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
    <main className="min-h-screen bg-[#F1FAFF] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 60% 0%, #C3E5D9 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, #EAF0F7 0%, transparent 50%)",
          }}
        />
        {/* floating accent rings */}
        <div
          className="absolute top-24 right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ border: "2px solid #45B08C", transform: "rotate(20deg)" }}
        />
        <div
          className="absolute -bottom-10 -left-16 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ border: "3px solid #1D3557" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)}>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{
                background: "#EBF7F3",
                color: "#45B08C",
                border: "1px solid #C3E5D9",
              }}
            >
              <FlaskConical size={12} /> Science & Quality
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="font-black text-5xl md:text-7xl text-[#1D3557] leading-none mb-6">
            વિજ્ઞાન અને{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #45B08C, #2D9B78)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              શુદ્ધતા
            </span>
            નો સંગમ
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-lg md:text-xl text-[#4A6A82] max-w-2xl mx-auto leading-relaxed">
            Zupwell Quality Standards — where cutting-edge science meets uncompromising purity. Every tablet tells a story of precision.
          </motion.p>
        </div>
      </section>

      {/* ── MANUFACTURING EXCELLENCE ── */}
      <section className="py-20 px-6 mx-auto max-w-7xl">
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#45B08C] mb-3">Our Process</p>
          <h2 className="font-black text-4xl md:text-5xl text-[#1D3557]">
            Manufacturing<br />Excellence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MANUFACTURING.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="relative rounded-3xl p-8 overflow-hidden group"
              style={{ background: "#FFFFFF", border: "1px solid #C8DCEA" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              {/* big number watermark */}
              <span
                className="absolute -top-4 -right-2 font-black text-8xl pointer-events-none select-none"
                style={{ color: "#EAF0F7", lineHeight: 1 }}
              >
                {item.num}
              </span>
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "#EBF7F3" }}
              >
                <item.icon size={26} className="text-[#45B08C]" />
              </div>
              <h3 className="font-black text-2xl text-[#1D3557] mb-3">{item.title}</h3>
              <p className="text-[#4A6A82] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section
        className="py-24 px-6"
        style={{
          background: "#45B08C",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">Verified & Trusted</p>
            <h2 className="font-black text-4xl md:text-5xl text-white">
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
                  background: "#2B4875",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{ borderColor: "#45B08C" }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: cert.bg, border: "1px solid #C8DCEA" }}
                >
                  <cert.icon size={24} style={{ color: cert.color === "#1D3557" ? "#45B08C" : cert.color }} />
                </div>
                <h3 className="font-black text-xl mb-3">{cert.title}</h3>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#45B08C] mb-3">No Shortcuts</p>
            <h2 className="font-black text-4xl md:text-5xl text-[#1D3557] mb-6">
              Clean Label<br />Promise
            </h2>
            <p className="text-[#4A6A82] text-lg leading-relaxed mb-8">
              What you see is what you get. No hidden fillers, no misleading labels, no compromises. Pure ingredients, honest transparency.
            </p>
            <div className="space-y-4">
              {CLEAN.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "#FFFFFF", border: "1px solid #C8DCEA" }}
                >
                  <CheckCircle size={20} className="text-[#45B08C] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[#1D3557] text-lg">{item.label}</p>
                    <p className="text-[#4A6A82] text-sm mt-0.5">{item.sub}</p>
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
                background: "#FFFFFF",
                border: "1px solid #C8DCEA",
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, #EBF7F3 0%, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <Package size={48} className="text-[#45B08C] mb-6" />
              <h3 className="font-black text-3xl text-[#1D3557] mb-4">
                Moisture-Lock<br />Tube Design
              </h3>
              <p className="text-[#4A6A82] leading-relaxed mb-8">
                Our precision-engineered tubes create an airtight barrier against humidity. Your tablets stay fresh from the day they're packed to the day you pop them.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[["Airtight Seal", "Humidity proof"], ["UV Protection", "Light resistant"], ["BPA-Free", "Safe materials"], ["Long Shelf Life", "Stays potent"]].map(([a, b]) => (
                  <div key={a} className="rounded-2xl p-4" style={{ background: "#F1FAFF", border: "1px solid #C8DCEA" }}>
                    <p className="font-bold text-[#1D3557] text-sm">{a}</p>
                    <p className="text-[#4A6A82] text-xs mt-0.5">{b}</p>
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
          style={{ background: "#45B08C" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)",
            }}
          />
          <h2 className="relative font-black text-4xl text-white mb-4">
            Taste the Science Difference
          </h2>
          <p className="relative text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Premium ingredients. Certified quality. Unbeatable absorption. Your wellness upgrade starts here.
          </p>
          <motion.a
            href="/products"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white text-[#45B08C] font-bold px-8 py-4 rounded-2xl text-lg"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          >
            Shop Zupwell →
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}