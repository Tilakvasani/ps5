"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Star, ArrowRight, FlaskConical, Droplets, Zap, Sparkles, Target, HeartHandshake, Activity, Tag, Citrus, Shield, Leaf } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings, useSettings } from "@/lib/useSettings";
import Link from "next/link";
import { fadeUp } from "@/lib/utils";

const D: Record<string, string> = {
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


  // Parse dynamic JSON settings or fallback
  let whyItems = [
    { icon: FlaskConical, title: "Scientific Formula", desc: "A fusion of science and taste." },
    { icon: Activity,     title: "Less Sugar",         desc: "There is sweetness, but no guilt." },
    { icon: Zap,          title: "Instant Absorption", desc: "Rocket-like speed, instant action." },
    { icon: Tag,          title: "Pocket Friendly",    desc: "It even fits in your jeans pocket." },
    { icon: Citrus,       title: "Best Flavour",       desc: "Absolutely fresh, as if straight from the garden." },
  ];
  try {
    const parsed = JSON.parse(s(settings, "about_why_special_json"));
    if (Array.isArray(parsed) && parsed.length > 0) {
      whyItems = parsed.map((item: any, idx: number) => {
        const titleLower = item.title?.toLowerCase() || "";
        let Icon = FlaskConical;
        if (titleLower.includes("science") || titleLower.includes("scientific")) Icon = FlaskConical;
        else if (titleLower.includes("sugar")) Icon = Activity;
        else if (titleLower.includes("absorb") || titleLower.includes("instant")) Icon = Zap;
        else if (titleLower.includes("pocket") || titleLower.includes("price") || titleLower.includes("friendly")) Icon = Tag;
        else if (titleLower.includes("flavour") || titleLower.includes("taste")) Icon = Citrus;
        else {
          const defaults = [FlaskConical, Activity, Zap, Tag, Citrus];
          Icon = defaults[idx % defaults.length];
        }
        return { icon: Icon, title: item.title, desc: item.desc };
      });
    }
  } catch (e) {}

  let pillarItems = [
    { icon: Heart,        title: "Daily Wellness Support",  desc: "Helps support hydration, immunity, and overall well-being so you can perform at your best every day." },
    { icon: Zap,          title: "Fast Performance",       desc: "Quick-dissolving, fast-absorbing formula built for modern, active lifestyles." },
    { icon: FlaskConical, title: "Science-Backed Formula",  desc: "Powered by clinically researched ingredients for trusted daily nutrition." },
    { icon: Leaf,         title: "Clean & Pure",           desc: "No unnecessary fillers or artificial junk—only quality ingredients your body needs." },
  ];
  try {
    const parsed = JSON.parse(s(settings, "about_pillars_json"));
    if (Array.isArray(parsed) && parsed.length > 0) {
      pillarItems = parsed.map((item: any, idx: number) => {
        const titleLower = item.title?.toLowerCase() || "";
        let Icon = Heart;
        if (titleLower.includes("wellness") || titleLower.includes("daily")) Icon = Heart;
        else if (titleLower.includes("fast") || titleLower.includes("performance") || titleLower.includes("speed")) Icon = Zap;
        else if (titleLower.includes("science") || titleLower.includes("clinical")) Icon = FlaskConical;
        else if (titleLower.includes("clean") || titleLower.includes("pure") || titleLower.includes("nature")) Icon = Leaf;
        else {
          const defaults = [Heart, Zap, FlaskConical, Leaf];
          Icon = defaults[idx % defaults.length];
        }
        return { icon: Icon, title: item.title, desc: item.desc };
      });
    }
  } catch (e) {}

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--gy)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #051124 0%, #0C1E39 100%)" }}>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.span {...fadeUp(0)}
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--or)" }}>
            About Zupwell
          </motion.span>
          <motion.h1 {...fadeUp(0.1)}
            className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6"
            style={{ color: "#FFFFFF" }}>
            &quot;{s(settings, "about_punchline")}&quot;
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#F8F8F8", opacity: 0.85 }}>
            {s(settings, "about_description")}
          </motion.p>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="pt-20 pb-10 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <span className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: "var(--or)" }}>
              {s(settings, "about_story_badge") || "Our Story"}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight" style={{ color: "#0C1E39" }}>
              {s(settings, "about_story_title") ? (
                s(settings, "about_story_title").split(" ").map((w, idx) => (
                  idx === s(settings, "about_story_title").split(" ").length - 1 ? (
                    <span key={idx} className="gradient-text">{w} </span>
                  ) : (
                    w + " "
                  )
                ))
              ) : (
                <>Born to solve a <span className="gradient-text">real problem</span></>
              )}
            </h2>
            <p className="leading-relaxed text-lg" style={{ color: "#4A5568", opacity: 0.85 }}>
              {s(settings, "about_brand_story")}
            </p>
          </motion.div>
          {/* Visual block */}
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-4">
            {[
              { val: s(settings, "hero_stat1_value") || "200+", label: s(settings, "hero_stat1_label") || "Products" },
              { val: s(settings, "hero_stat2_value") || "50K+", label: s(settings, "hero_stat2_label") || "Customers" },
              { val: s(settings, "hero_stat3_value") || "100%", label: s(settings, "hero_stat3_label") || "Authentic" },
              { val: "5-7",  label: "Days Delivery" },
            ].map(({ val, label }) => (
              <div key={label} className="card text-center py-8" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
                <p className="text-3xl font-black gradient-text">{val}</p>
                <p className="text-sm mt-1" style={{ color: "#4A5568", opacity: 0.75 }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="pt-10 pb-10 px-6" style={{ background: "var(--gy)" }}>
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeUp(0)} className="card border-l-4 rounded-l-none" style={{ borderLeftColor: "var(--or)", background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,92,0,0.12)" }}>
              <Target size={20} style={{ color: "var(--or)" }} />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: "#0C1E39" }}>Our Mission</h3>
            <p className="leading-relaxed" style={{ color: "#4A5568", opacity: 0.8 }}>{s(settings, "about_mission")}</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="card border-l-4 rounded-l-none" style={{ borderLeftColor: "var(--or)", background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,92,0,0.12)" }}>
              <Eye size={20} style={{ color: "var(--or)" }} />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: "#0C1E39" }}>Our Vision</h3>
            <p className="leading-relaxed" style={{ color: "#4A5568", opacity: 0.8 }}>{s(settings, "about_vision")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Zupwell ── */}
      <section className="pt-10 pb-10 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>
              {s(settings, "about_why_title") ? (
                s(settings, "about_why_title").split(" ").map((w, idx) => (
                  idx === s(settings, "about_why_title").split(" ").length - 1 ? (
                    <span key={idx} style={{ color: "var(--or)" }}>{w} </span>
                  ) : (
                    w + " "
                  )
                ))
              ) : (
                <>Why Choose <span style={{ color: "var(--or)" }}>Zupwell?</span></>
              )}
            </h2>
            <p style={{ color: "#4A5568", opacity: 0.85 }}>{s(settings, "about_why_subtitle") || "Our Core Pillars and Commitments to You."}</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillarItems.map((pillar, i) => (
              <div key={i} className="card p-8 rounded-2xl flex flex-col justify-between" 
                style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                <div>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(255,92,0,0.12)" }}>
                    <pillar.icon size={22} style={{ color: "var(--or)" }} />
                  </div>
                  <h3 className="text-base font-black mb-3 leading-snug" style={{ color: "#0C1E39" }}>{pillar.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-[#4A5568]">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why is Our Product Special? ── */}
      <section className="pt-10 pb-10 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>
              Why is Our Product <span style={{ color: "var(--or)" }}>Special?</span>
            </h2>
            <p style={{ color: "#4A5568", opacity: 0.85 }}>Zero-Compromise Health Boosters. Crafted for Perfection.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {whyItems.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="zcard text-center"
                style={{ borderColor: "rgba(12, 30, 57, 0.08)", background: "#FFFFFF" }}>
                <div className="h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all"
                  style={{ background: "rgba(255, 92, 0, 0.1)" }}>
                  <f.icon size={24} style={{ color: "var(--or)" }} />
                </div>
                <h3 className="font-black mb-2" style={{ color: "#0C1E39", fontSize: "14px", letterSpacing: "-0.03em" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A5568", opacity: 0.8 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Future of Zupwell ── */}
      {s(settings, "about_future") && (
        <section className="pt-10 pb-20 px-6" style={{ background: "var(--gy)" }}>
          <div className="mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: "#0C1E39" }}>
                {s(settings, "about_future_title") ? (
                  s(settings, "about_future_title").split(" ").map((w, idx) => (
                    idx === s(settings, "about_future_title").split(" ").length - 1 ? (
                      <span key={idx} className="gradient-text">{w} </span>
                    ) : (
                      w + " "
                    )
                  ))
                ) : (
                  <>The Future of <span className="gradient-text">Zupwell</span></>
                )}
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.1)}
              className="card"
              style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#FFFFFF" }}>
              <p className="leading-relaxed text-lg mb-6" style={{ color: "#4A5568", opacity: 0.85 }}>
                {s(settings, "about_future")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {(() => {
                  let pipeline = [
                    "Daily multivitamins & immune boosters",
                    "Energy and focus formulations",
                    "Specialized recovery blends",
                  ];
                  try {
                    const parsed = JSON.parse(s(settings, "about_future_pipeline_json"));
                    if (Array.isArray(parsed) && parsed.length > 0) pipeline = parsed;
                  } catch (e) {}
                  return pipeline.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm" style={{ color: "#4A5568", opacity: 0.8 }}>
                      <span className="mt-0.5 shrink-0" style={{ color: "var(--or)" }}>→</span>
                      {item}
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(135deg, #0C1E39 0%, #051124 100%)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="text-2xl font-black mb-4" style={{ color: "#FFFFFF" }}>
              {s(settings, "about_cta_title") || "Ready to fuel your hustle?"}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center sm:items-stretch max-w-sm mx-auto sm:max-w-none">
              <Link href="/products" className="w-full sm:w-auto">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold"
                  style={{ borderRadius: "30px" }}>
                  Upgrade Now <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="zbtn-out w-full flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold"
                  style={{ borderRadius: "30px", border: "1.5px solid #FFFFFF", color: "#FFFFFF" }}>
                  Contact Us
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
