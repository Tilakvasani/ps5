"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { FlaskConical, Shield, Leaf, Droplets, Award, CheckCircle, Microscope, Package, Globe } from "lucide-react";
import { fetchSettings } from "@/lib/useSettings";
import { fadeUp } from "@/lib/utils";

const D: Record<string, string> = {
  science_hero_badge: "Science & Quality",
  science_hero_title: "The confluence of science and purity",
  science_hero_subtext: "Zupwell Quality Standards — where cutting-edge science meets uncompromising purity. Every tablet tells a story of precision.",
  science_process_badge: "Our Process",
  science_process_title: "Manufacturing\nExcellence",
  science_process1_title: "Premium Sourcing",
  science_process1_desc: "We source raw materials from the finest suppliers worldwide. Every ingredient is laboratory tested for purity and efficacy before it ever reaches you.",
  science_process2_title: "Effervescent Technology",
  science_process2_desc: "Our proprietary effervescent formula dissolves completely in water, unlocking fast nutrient absorption. Maximum bioavailability — every single time.",
  science_cert_badge: "Verified & Trusted",
  science_cert_title: "Safety & Certifications",
  science_cert_subtext: "Every product earns its place on your shelf through rigorous testing and official certification.",
  science_cert1_title: "GMP & ISO Certified",
  science_cert1_desc: "Manufactured in WHO-GMP and ISO certified facilities. International standards of hygiene and quality — followed without compromise.",
  science_cert2_title: "FSSAI Approved",
  science_cert2_desc: "Every Zupwell product is manufactured and tested under the strict regulations of FSSAI — India's food safety authority.",
  science_cert3_title: "Lab Tested Batches",
  science_cert3_desc: "Each batch undergoes microbiological testing before market release. 100% verified. 100% safe.",
  science_clean_badge: "No Shortcuts",
  science_clean_title: "Clean Label\nPromise",
  science_clean_desc: "What you see is what you get. No hidden fillers, no misleading labels, no compromises. Pure ingredients, honest transparency.",
  science_clean1_label: "Moisture-Lock Packaging",
  science_clean1_sub: "Precision-sealed tubes keep tablets fresh and potent for longer.",
  science_clean2_label: "Transparent Labelling",
  science_clean2_sub: "What's on the label is exactly what's inside — nothing hidden.",
  science_clean3_label: "No Artificial Colours",
  science_clean3_sub: "Our effervescent colour comes from nature, not a lab dye.",
  science_tube_title: "Moisture-Lock\nTube Design",
  science_tube_desc: "Our precision-engineered tubes create an airtight barrier against humidity. Your tablets stay fresh from the day they're packed to the day you pop them.",
  science_tube_f1_title: "Airtight Seal",
  science_tube_f1_desc: "Humidity proof",
  science_tube_f2_title: "UV Protection",
  science_tube_f2_desc: "Light resistant",
  science_tube_f3_title: "BPA-Free",
  science_tube_f3_desc: "Safe materials",
  science_tube_f4_title: "Long Shelf Life",
  science_tube_f4_desc: "Stays potent",
  science_cta_title: "Taste the Science Difference",
  science_cta_subtext: "Premium ingredients. Certified quality. Unbeatable absorption. Your wellness upgrade starts here.",
  science_cta_btn: "Shop Zupwell →",
};

const s = (settings: Record<string, string>, key: string) =>
  settings[key] || D[key] || "";

export default function SciencePage() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    const onBust = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust")
        fetchSettings().then(setSettings).catch(() => {});
    };
    window.addEventListener("storage", onBust);
    return () => window.removeEventListener("storage", onBust);
  }, []);

  const manufacturing = [
    {
      icon: Globe,
      title: s(settings, "science_process1_title"),
      desc: s(settings, "science_process1_desc"),
      num: "01",
    },
    {
      icon: Droplets,
      title: s(settings, "science_process2_title"),
      desc: s(settings, "science_process2_desc"),
      num: "02",
    },
  ];

  const certs = [
    {
      icon: Award,
      title: s(settings, "science_cert1_title"),
      desc: s(settings, "science_cert1_desc"),
      color: "#FF5C00",
      bg: "#0C1E3E",
    },
    {
      icon: Shield,
      title: s(settings, "science_cert2_title"),
      desc: s(settings, "science_cert2_desc"),
      color: "#FF5C00",
      bg: "#0C1E3E",
    },
    {
      icon: Microscope,
      title: s(settings, "science_cert3_title"),
      desc: s(settings, "science_cert3_desc"),
      color: "#FF5C00",
      bg: "#0C1E3E",
    },
  ];

  const clean = [
    { label: s(settings, "science_clean1_label"), sub: s(settings, "science_clean1_sub") },
    { label: s(settings, "science_clean2_label"), sub: s(settings, "science_clean2_sub") },
    { label: s(settings, "science_clean3_label"), sub: s(settings, "science_clean3_sub") },
  ];

  const tubeFeatures = [
    [s(settings, "science_tube_f1_title"), s(settings, "science_tube_f1_desc")],
    [s(settings, "science_tube_f2_title"), s(settings, "science_tube_f2_desc")],
    [s(settings, "science_tube_f3_title"), s(settings, "science_tube_f3_desc")],
    [s(settings, "science_tube_f4_title"), s(settings, "science_tube_f4_desc")],
  ];

  const renderTitle = (titleText: string) => {
    const parts = titleText.split(/(science|purity)/i);
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (lower === "science" || lower === "purity") {
        return (
          <span
            key={i}
            style={{
              background: "linear-gradient(135deg, #FF5C00, #FF8C42)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 60% 0%, rgba(255,92,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(30,45,74,0.4) 0%, transparent 50%)",
          }}
        />
        {/* floating accent rings */}
        <div
          className="absolute top-24 right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ border: "2px solid var(--or)", transform: "rotate(20deg)" }}
        />
        <div
          className="absolute -bottom-10 -left-16 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ border: "3px solid #1E2D4A" }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)}>
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{
                background: "#0C1E3E",
                color: "var(--or)",
                border: "1px solid #1E2D4A",
              }}
            >
              <FlaskConical size={12} /> {s(settings, "science_hero_badge")}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="font-black text-3xl sm:text-5xl md:text-7xl leading-tight mb-6" style={{ color: "#627d98" }}>
            {renderTitle(s(settings, "science_hero_title"))}
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#8F9CAE" }}>
            {s(settings, "science_hero_subtext")}
          </motion.p>
        </div>
      </section>

      {/* ── MANUFACTURING EXCELLENCE ── */}
      <section className="py-20 px-6 mx-auto max-w-7xl">
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--or)" }}>
            {s(settings, "science_process_badge")}
          </p>
          <h2 className="font-black text-2xl sm:text-4xl md:text-5xl whitespace-pre-line leading-tight" style={{ color: "#627d98" }}>
            {s(settings, "science_process_title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {manufacturing.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="relative rounded-3xl p-8 overflow-hidden group"
              style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              {/* big number watermark */}
              <span
                className="absolute -top-4 -right-2 font-black text-8xl pointer-events-none select-none"
                style={{ color: "#1E2D4A", lineHeight: 1 }}
              >
                {item.num}
              </span>
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(255,92,0,0.12)" }}
              >
                <item.icon size={26} style={{ color: "var(--or)" }} />
              </div>
              <h3 className="font-black text-2xl mb-3" style={{ color: "#627d98" }}>{item.title}</h3>
              <p style={{ color: "#8F9CAE" }} className="leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section
        className="py-24 px-6"
        style={{
          background: "var(--or)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">
              {s(settings, "science_cert_badge")}
            </p>
            <h2 className="font-black text-4xl md:text-5xl text-white">
              {s(settings, "science_cert_title")}
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-xl mx-auto">
              {s(settings, "science_cert_subtext")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certs.map((cert, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="rounded-3xl p-8 text-white"
                style={{
                  background: "#0C1E3E",
                  border: "1.5px solid #1E2D4A",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{ borderColor: "#FF5C00" }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: cert.bg, border: "1.5px solid #1E2D4A" }}
                >
                  <cert.icon size={24} style={{ color: cert.color }} />
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--or)" }}>
              {s(settings, "science_clean_badge")}
            </p>
            <h2 className="font-black text-2xl sm:text-4xl md:text-5xl mb-6 whitespace-pre-line leading-tight" style={{ color: "#627d98" }}>
              {s(settings, "science_clean_title")}
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#8F9CAE" }}>
              {s(settings, "science_clean_desc")}
            </p>
            <div className="space-y-4">
              {clean.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A" }}
                >
                  <CheckCircle size={20} className="mt-0.5 shrink-0" style={{ color: "var(--or)" }} />
                  <div>
                    <p className="font-bold text-lg" style={{ color: "#627d98" }}>{item.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#8F9CAE" }}>{item.sub}</p>
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
                background: "#0C1E3E",
                border: "1.5px solid #1E2D4A",
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <Package size={48} className="mb-6" style={{ color: "var(--or)" }} />
              <h3 className="font-black text-3xl mb-4 whitespace-pre-line leading-tight" style={{ color: "#627d98" }}>
                {s(settings, "science_tube_title")}
              </h3>
              <p className="leading-relaxed mb-8" style={{ color: "#8F9CAE" }}>
                {s(settings, "science_tube_desc")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {tubeFeatures.map(([a, b]) => (
                  <div key={a} className="rounded-2xl p-4" style={{ background: "var(--dk)", border: "1.5px solid #1E2D4A" }}>
                    <p className="font-bold text-sm" style={{ color: "#627d98" }}>{a}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8F9CAE" }}>{b}</p>
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
          style={{ background: "var(--or)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)",
            }}
          />
          <h2 className="relative font-black text-4xl text-white mb-4">
            {s(settings, "science_cta_title")}
          </h2>
          <p className="relative text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {s(settings, "science_cta_subtext")}
          </p>
          <motion.a
            href="/products"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-lg"
            style={{ background: "#051124", color: "var(--or)", boxShadow: "0 4px 24px rgba(0,0,0,0.24)" }}
          >
            {s(settings, "science_cta_btn")}
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
