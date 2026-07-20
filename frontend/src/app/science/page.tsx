"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CertLogo } from "@/components/storefront/CertLogos";
import { FlaskConical, Shield, Leaf, Droplets, Award, CheckCircle, Microscope, Package, Globe, Cylinder, Beaker, GlassWater, Waves, Sparkles, Activity, Zap, TestTube } from "lucide-react";
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
  science_cert_badge: "Quality & Safety",
  science_cert_title: "Certified & Verified",
  science_cert_subtext: "Every single product is manufactured in state-of-the-art facilities following international safety protocols.",
  science_cert1_title: "GMP & ISO Certified",
  science_cert1_desc: "Manufactured in WHO-GMP and ISO certified facilities. International standards of hygiene and quality — followed without compromise.",
  science_cert2_title: "FSSAI Approved",
  science_cert2_desc: "Every Zupwell product is manufactured and tested under the strict regulations of FSSAI — India's food safety authority.",
  science_cert3_title: "Lab Tested Batches",
  science_cert3_desc: "Each batch is microbiologically tested before being released into the market. 100% verified and safe.",
  science_clean_badge: "Clean Label",
  science_clean_title: "100% Transparent\nZero Compromise",
  science_clean_desc: "We believe you have the right to know exactly what goes into your body. That's why we have a clean-label promise.",
  science_clean1_label: "Moisture-Lock Packaging",
  science_clean1_sub: "Airtight seal guarantees freshness and prevents tablet degradation from humidity.",
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
    },
    {
      icon: TestTube,
      title: s(settings, "science_process2_title"),
      desc: s(settings, "science_process2_desc"),
    },
  ];

  const certs = [
    {
      icon: Award,
      title: s(settings, "science_cert1_title"),
      desc: s(settings, "science_cert1_desc"),
      color: "#FF5C00",
      bg: "#0C1E39",
    },
    {
      icon: Shield,
      title: s(settings, "science_cert2_title"),
      desc: s(settings, "science_cert2_desc"),
      color: "#FF5C00",
      bg: "#0C1E39",
    },
    {
      icon: Microscope,
      title: s(settings, "science_cert3_title"),
      desc: s(settings, "science_cert3_desc"),
      color: "#FF5C00",
      bg: "#0C1E39",
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
              background: "linear-gradient(135deg, #FF5C00, #FFB800)",
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
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--gy)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #051124 0%, #0C1E39 100%)" }}>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)}>
            <span
              className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6"
              style={{
                background: "#0C1E39",
                color: "var(--or)",
                border: "1px solid #0C1E39",
                fontSize: "14px",
              }}
            >
              <FlaskConical size={12} /> {s(settings, "science_hero_badge")}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="font-black text-3xl sm:text-5xl md:text-7xl leading-tight mb-6" style={{ color: "#FFFFFF" }}>
            {renderTitle(s(settings, "science_hero_title"))}
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#F8F8F8", opacity: 0.85 }}>
            {s(settings, "science_hero_subtext")}
          </motion.p>
        </div>
      </section>

      {/* ── LAB SHOWCASE GALLERY ── */}
      <section className="pt-12 pb-6 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            {...fadeUp(0.1)} 
            className="group relative rounded-3xl overflow-hidden aspect-[16/10] border-2 border-[#0C1E39]/10 hover:border-[#FF5C00] transition-all duration-300"
          >
            <Image 
              src="/assets/laboratory_work.png" 
              alt="Laboratory work featuring researchers" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051124] via-[#051124]/30 to-transparent flex flex-col justify-end p-6">
              <span 
                className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 text-white self-start"
                style={{ background: "#FF5C00" }}
              >
                R&D Facilities
              </span>
              <h3 className="text-xl font-black text-white leading-tight">Advanced Formulations Lab</h3>
            </div>
          </motion.div>

          <motion.div 
            {...fadeUp(0.2)} 
            className="group relative rounded-3xl overflow-hidden aspect-[16/10] border-2 border-[#0C1E39]/10 hover:border-[#FF5C00] transition-all duration-300"
          >
            <Image 
              src="/assets/scientists_collaborating.png" 
              alt="Scientists collaborating on new formulations" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051124] via-[#051124]/30 to-transparent flex flex-col justify-end p-6">
              <span 
                className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 text-white self-start"
                style={{ background: "#FF5C00" }}
              >
                Collaborative Innovation
              </span>
              <h3 className="text-xl font-black text-white leading-tight">Quality Assurance & Synergy</h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANUFACTURING EXCELLENCE ── */}
      <section className="pt-10 pb-20 px-6 mx-auto max-w-7xl">
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--or)" }}>
            {s(settings, "science_process_badge")}
          </p>
          <h2 className="font-black text-2xl sm:text-4xl md:text-5xl whitespace-pre-line leading-tight" style={{ color: "#0C1E39" }}>
            {s(settings, "science_process_title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {manufacturing.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="relative rounded-3xl p-8 overflow-hidden group"
              style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-black text-2xl mb-3" style={{ color: "#0C1E39" }}>{item.title?.replace(/^(0\d|\d)\s*/, "")}</h3>
              <p style={{ color: "#4A5568", opacity: 0.85 }} className="leading-relaxed">{item.desc}</p>
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
            <p className="text-white/80 mt-4 text-lg max-w-xl mx-auto">
              {s(settings, "science_cert_subtext")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certs.map((cert, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="rounded-3xl p-8 text-[#0C1E39]"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(12, 30, 57, 0.08)",
                  boxShadow: "0 10px 30px rgba(12, 30, 57, 0.04)",
                  backdropFilter: "blur(12px)",
                }}
                whileHover={{ borderColor: "var(--or)" }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="h-14 flex items-center mb-6 gap-3"
                >
                  {i === 0 && (
                    <>
                      <CertLogo label="GMP" className="h-10 object-contain text-[#0C1E39]" />
                      <CertLogo label="ISO" className="h-10 object-contain text-[#0C1E39]" />
                    </>
                  )}
                  {i === 1 && (
                    <CertLogo label="FSSAI" className="h-7 object-contain text-[#0C1E39]" />
                  )}
                  {i === 2 && (
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center bg-black/5 border border-[#0C1E39]/10"
                    >
                      <Microscope size={22} style={{ color: cert.color }} />
                    </div>
                  )}
                </div>
                <h3 className="font-black text-xl mb-3">{cert.title}</h3>
                <p className="text-[#4A5568] leading-relaxed text-sm">{cert.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLEAN LABEL ── */}
      <section className="pt-24 pb-12 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--or)" }}>
              {s(settings, "science_clean_badge")}
            </p>
            <h2 className="font-black text-2xl sm:text-4xl md:text-5xl mb-6 whitespace-pre-line leading-tight" style={{ color: "#0C1E39" }}>
              {s(settings, "science_clean_title")}
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "#4A5568", opacity: 0.85 }}>
              {s(settings, "science_clean_desc")}
            </p>
            <div className="space-y-4">
              {clean.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}
                >
                  <CheckCircle size={20} className="mt-0.5 shrink-0" style={{ color: "var(--or)" }} />
                  <div>
                    <p className="font-bold text-lg" style={{ color: "#0C1E39" }}>{item.label}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#4A5568", opacity: 0.75 }}>{item.sub}</p>
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
                background: "linear-gradient(135deg, #0C1E39 0%, #051124 100%)",
                border: "1.5px solid #0C1E39",
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255, 92, 0, 0.08) 0%, transparent 70%)",
                  transform: "translate(30%, -30%)",
                }}
              />
              <h3 className="font-black text-3xl mb-4 whitespace-pre-line leading-tight" style={{ color: "#FFFFFF" }}>
                {s(settings, "science_tube_title")}
              </h3>
              <p className="leading-relaxed mb-8" style={{ color: "#F8F8F8", opacity: 0.8 }}>
                {s(settings, "science_tube_desc")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {tubeFeatures.map(([a, b]) => (
                  <div key={a} className="rounded-2xl p-4" style={{ background: "#0C1E39", border: "1.5px solid rgba(255,255,255,0.05)" }}>
                    <p className="font-bold text-sm" style={{ color: "#FFFFFF" }}>{a}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#F8F8F8", opacity: 0.75 }}>{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="pt-10 pb-20 px-6 mx-auto max-w-7xl">
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
            style={{ background: "#0C1E39", color: "#FFFFFF", boxShadow: "0 4px 24px rgba(0,0,0,0.16)" }}
          >
            {s(settings, "science_cta_btn")}
          </motion.a>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
