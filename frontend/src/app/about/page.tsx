"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Heart, Eye, Star, ArrowRight, Shield, Award, Sparkles, Users } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings } from "@/lib/useSettings";
import Link from "next/link";
import { fadeUp } from "@/lib/utils";

const D: Record<string, string> = {
<<<<<<< HEAD
  about_punchline:   "We don't just sell supplements; we fuel your daily hustle.",
  about_description: "Zupwell was born on a mission to make clean, effective, science-backed wellness accessible for every Gen Z & Millennial. We merge clinical research with incredible flavors so maintaining your health feels like a vibe, not a chore.",
  about_brand_story: "In today's fast-paced world, we demand a lot from our bodies but rarely give them what they need. Fatigue, brain fog, and poor hydration hold us back. That's exactly why Zupwell was founded: to bridge the gap between premium clinical standards and daily lifestyle convenience. No fillers, no complex routines. Just smart fuel for modern humans.",
  about_mission:     "Health that is never boring! We believe that taking wellness supplements shouldn't feel like swallowing a bitter pill. That's why we've engineered sugar-free, fast-absorbing products that are both clinically potent and delicious.",
  about_vision:      "To be India's leading brand in Modern Wellness, recognized globally for clean ingredients, scientific integrity, and an unwavering commitment to customer vitality.",
  about_future:      "Our hydration electrolytes are just the beginning. Zupwell is constantly innovating. We are currently in research and development for an extensive pipeline of wellness solutions, including daily multivitamins, skin glow boosters, natural sleep aids, and specialized recovery blends.",
=======
  about_punchline:   "We don't just sell supplements; we fuel your hustle.",
  about_description: "Zupwell was born with the aim of maintaining health and strength in the modern lifestyle. We create health supplements that are easy to take and effective through the fusion of science and taste. Quality is our mantra.",
  about_brand_story: "In today's fast-paced life, we want to achieve a lot, but often our bodies don't cooperate. Fatigue, dehydration, and lack of energy hold us back. That's exactly what Zupwell was started to solve. Our goal is simple: to keep you healthy, hydrated, and active.",
  about_mission:     "Health, which is not boring! We believe that taking health supplements should not be like taking a painkiller or a bitter medicine. That's why we have brought you products that are both effective and delicious!",
  about_vision:      "To be India's leading name in Health Supplements, recognized for quality, scientific integrity and commitment to patient and athlete well-being.",
  about_future:      "Our electrolyte formula is just the beginning. At Zupwell, we are committed to becoming a leader in health supplements. We are currently in the research and development phase for a diverse pipeline of wellness solutions, including daily multivitamins and immune boosters, energy and focus formulations, and specialized recovery blends. Innovation is in our DNA. We are constantly looking for new ways to make high-quality nutrition more effective and easier to consume.",
  about_why1_title:  "Science-Backed",
  about_why1_desc:   "Formulas that actually work — grounded in clinical research, not marketing hype.",
  about_why2_title:  "Quality First",
  about_why2_desc:   "High quality ingredients and best manufacturing standards. No compromises.",
  about_why3_title:  "Consumer Centric",
  about_why3_desc:   "Customer convenience and choice are our top priorities. Always.",
  founder_name:      "Parag Hirpara",
  founder_title:     "Founder & CEO, Zupwell",
  founder_message:   "At Zupwell, I started with a simple observation: traditional supplements often feel like a chore — hard to swallow, slow to absorb, and difficult to integrate into a busy life. I founded Zupwell to bridge the gap between clinical effectiveness and modern convenience. Through Zupwell, my endeavor is to ensure that everyone can fulfil their dreams without compromising their health.",
  founder_photo:     "",
  about_story_badge:  "Our Story",
  about_story_title:  "Born to solve a real problem",
  about_why_title:    "Why Zupwell?",
  about_why_subtitle: "Three reasons our customers never look back",
  about_future_title: "The Future of Zupwell",
  about_cta_title:    "Ready to fuel your hustle?",
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
};

const s = (settings: Record<string, string>, key: string) =>
  settings[key] || D[key] || "";

export default function AboutPage() {
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

  return (
    <main className="min-h-screen bg-[#FCFAF6] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-white border-b border-[#E8E2D9]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-[#48C062]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9]">
            About Zupwell
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#002A30] leading-[1.1] tracking-tight">
            Wellness is personal.<br />
            <span className="text-[#48C062]">We make it simple.</span>
          </h1>
          <p className="font-sans text-sm md:text-base text-[#45353E] max-w-2xl mx-auto leading-relaxed font-semibold">
            {s(settings, "about_description")}
          </p>
        </div>
      </section>

<<<<<<< HEAD
      {/* Brand Story & Stats */}
      <section className="py-24 px-6 border-b border-[#E8E2D9]/40">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div {...fadeUp(0)} className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#8C8276] block">Our Story</span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-[#002A30] leading-snug">
              Born to solve a <span className="text-[#48C062]">real daily problem</span>
=======
      {/* ── Brand Story ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#48C062] mb-3 block">
              {s(settings, "about_story_badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#002A30] mb-6 leading-tight">
              {s(settings, "about_story_title").split(/(real problem)/i).map((part, i) => {
                if (part.toLowerCase() === "real problem") {
                  return <span key={i} className="gradient-text">{part}</span>;
                }
                return part;
              })}
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
            </h2>
            <p className="text-sm text-[#45353E] leading-relaxed">
              {s(settings, "about_brand_story")}
            </p>
          </motion.div>
          
          {/* Stats grid matching mockup */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[
<<<<<<< HEAD
              { val: "10K+", label: "Happy Customers", icon: Users },
              { val: "50+",  label: "Premium Products", icon: Sparkles },
              { val: "100%", label: "Satisfaction Guaranteed", icon: Shield },
              { val: "3-5",  label: "Days Fast Delivery", icon: Zap },
            ].map((stat, idx) => (
              <div key={idx} className="card bg-white border border-[#E8E2D9] p-6 text-center flex flex-col justify-between items-center shadow-soft hover:border-[#48C062]/20">
                <stat.icon size={18} className="text-[#48C062] mb-3" />
                <div>
                  <p className="font-display text-2xl font-black text-[#002A30] tracking-tight">{stat.val}</p>
                  <p className="text-[10px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mt-1">{stat.label}</p>
=======
              { val: "200+", label: "Products" },
              { val: "50K+", label: "Customers" },
              { val: "100%", label: "Authentic" },
              { val: "3-5",  label: "Days Delivery" },
            ].map(({ val, label }) => (
              <div key={label} className="card text-center py-8">
                <p className="text-3xl font-black gradient-text">{val}</p>
                <p className="text-sm text-[#45353E] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeUp(0)} className="card border-l-4 border-l-[#48C062] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#48C062]/10 flex items-center justify-center mb-4">
              <Heart size={20} className="text-[#48C062]" />
            </div>
            <h3 className="text-xl font-black text-[#002A30] mb-3">Our Mission</h3>
            <p className="text-[#45353E] leading-relaxed">{s(settings, "about_mission")}</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="card border-l-4 border-l-[#48C062] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#48C062]/10 flex items-center justify-center mb-4">
              <Eye size={20} className="text-[#48C062]" />
            </div>
            <h3 className="text-xl font-black text-[#002A30] mb-3">Our Vision</h3>
            <p className="text-[#45353E] leading-relaxed">{s(settings, "about_vision")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Why Zupwell ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#002A30] mb-3">
              {s(settings, "about_why_title").split(/(Zupwell\?)/i).map((part, i) => {
                if (part.toLowerCase() === "zupwell?") {
                  return <span key={i} className="gradient-text">{part}</span>;
                }
                return part;
              })}
            </h2>
            <p className="text-[#45353E]">{s(settings, "about_why_subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {why.map((w, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="card text-center group hover:border-[#48C062]/30 transition-all">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#48C062]/10 flex items-center justify-center mb-4 group-hover:bg-[#48C062]/20 transition-all">
                  <w.icon size={24} className="text-[#48C062]" />
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-24 px-6 bg-white border-b border-[#E8E2D9]">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeUp(0)} className="card bg-[#FCFAF6] border border-[#E8E2D9] p-8 space-y-4 hover:border-[#48C062]/20">
            <div className="h-12 w-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center border border-[#C8E6C9]">
              <Heart size={20} className="text-[#2E7D32]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#002A30] uppercase tracking-wide">Our Mission</h3>
            <p className="text-xs text-[#45353E] leading-relaxed font-semibold">{s(settings, "about_mission")}</p>
          </motion.div>

<<<<<<< HEAD
          <motion.div {...fadeUp(0.1)} className="card bg-[#FCFAF6] border border-[#E8E2D9] p-8 space-y-4 hover:border-[#48C062]/20">
            <div className="h-12 w-12 rounded-2xl bg-[#E8EAF6] flex items-center justify-center border border-[#C5CAE9]">
              <Eye size={20} className="text-[#1A237E]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#002A30] uppercase tracking-wide">Our Vision</h3>
            <p className="text-xs text-[#45353E] leading-relaxed font-semibold">{s(settings, "about_vision")}</p>
          </motion.div>
        </div>
      </section>

      {/* Pipeline Innovations */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <motion.div {...fadeUp(0)} className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-black text-[#002A30]">
              The Future of <span className="text-[#48C062]">Zupwell</span>
=======
      {/* ── Future of Zupwell ── */}
      {s(settings, "about_future") && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-[#002A30]">
                {s(settings, "about_future_title").split(/(Zupwell)/i).map((part, i) => {
                  if (part.toLowerCase() === "zupwell") {
                    return <span key={i} className="gradient-text">{part}</span>;
                  }
                  return part;
                })}
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.1)}
              className="card border border-[#48C062]/20 bg-[#FCFAF6]">
              <p className="text-[#45353E] leading-relaxed text-lg mb-6">
                {s(settings, "about_future")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  "Daily multivitamins & immune boosters",
                  "Energy and focus formulations",
                  "Specialized recovery blends",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#45353E]">
                    <span className="text-[#48C062] mt-0.5 shrink-0">→</span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-2xl font-black text-[#002A30] mb-4">
              {s(settings, "about_cta_title")}
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8C8276] mt-2">Always innovating for your routine</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="card bg-white border border-[#E8E2D9] p-8 shadow-soft space-y-6">
            <p className="text-sm text-[#45353E] leading-relaxed text-center max-w-2xl mx-auto">
              {s(settings, "about_future")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E8E2D9]/40">
              {[
                "Daily multivitamins & immune boosters",
                "Energy & focus formulas",
                "Specialized skin & recovery blends",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#45353E]">
                  <span className="h-2 w-2 rounded-full bg-[#48C062]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Badges matching mockup */}
      <section className="py-12 bg-white border-t border-[#E8E2D9] px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {["Clean Ingredients", "Science Backed", "Sustainable Pack", "Community Driven"].map((badge, idx) => (
            <div key={idx} className="p-4 border border-[#E8E2D9] bg-[#FCFAF6] rounded-2xl">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#002A30]">{badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 bg-[#FCFAF6]">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <h2 className="font-display text-2xl md:text-3xl font-black text-[#002A30] leading-tight">
            Ready to upgrade your routine?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                Upgrade Now <ArrowRight size={14} />
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="btn-outline w-full sm:w-auto px-8 py-3.5 font-sans text-xs uppercase tracking-[0.15em] font-bold border-[#E8E2D9]">
                Contact Us
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
