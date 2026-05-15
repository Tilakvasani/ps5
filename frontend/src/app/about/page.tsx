"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Heart, Eye, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings } from "@/lib/useSettings";
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

  const why = [1, 2, 3].map(n => ({
    title: s(settings, `about_why${n}_title`),
    desc:  s(settings, `about_why${n}_desc`),
    icon:  [Zap, Heart, Star][n - 1],
  }));

  return (
    <main className="min-h-screen bg-[#F1FAFF] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 bg-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#45B08C]/6 " />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.span {...fadeUp(0)}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#45B08C] mb-4">
            About Zupwell
          </motion.span>
          <motion.h1 {...fadeUp(0.1)}
            className="text-5xl md:text-6xl font-black text-[#1D3557] leading-tight mb-6">
            "{s(settings, "about_punchline")}"
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg text-[#4A6A82] max-w-2xl mx-auto leading-relaxed">
            {s(settings, "about_description")}
          </motion.p>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#45B08C] mb-3 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1D3557] mb-6 leading-tight">
              Born to solve a <span className="gradient-text">real problem</span>
            </h2>
            <p className="text-[#4A6A82] leading-relaxed text-lg">
              {s(settings, "about_brand_story")}
            </p>
          </motion.div>
          {/* Visual block */}
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-4">
            {[
              { val: "200+", label: "Products" },
              { val: "50K+", label: "Customers" },
              { val: "100%", label: "Authentic" },
              { val: "3-5",  label: "Days Delivery" },
            ].map(({ val, label }) => (
              <div key={label} className="card text-center py-8">
                <p className="text-3xl font-black gradient-text">{val}</p>
                <p className="text-sm text-[#4A6A82] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeUp(0)} className="card border-l-4 border-l-[#45B08C] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#45B08C]/10 flex items-center justify-center mb-4">
              <Heart size={20} className="text-[#45B08C]" />
            </div>
            <h3 className="text-xl font-black text-[#1D3557] mb-3">Our Mission</h3>
            <p className="text-[#4A6A82] leading-relaxed">{s(settings, "about_mission")}</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="card border-l-4 border-l-[#45B08C] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#45B08C]/10 flex items-center justify-center mb-4">
              <Eye size={20} className="text-[#45B08C]" />
            </div>
            <h3 className="text-xl font-black text-[#1D3557] mb-3">Our Vision</h3>
            <p className="text-[#4A6A82] leading-relaxed">{s(settings, "about_vision")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Why Zupwell ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1D3557] mb-3">
              Why <span className="gradient-text">Zupwell?</span>
            </h2>
            <p className="text-[#4A6A82]">Three reasons our customers never look back</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {why.map((w, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="card text-center group hover:border-[#45B08C]/30 transition-all">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#45B08C]/10 flex items-center justify-center mb-4 group-hover:bg-[#45B08C]/20 transition-all">
                  <w.icon size={24} className="text-[#45B08C]" />
                </div>
                <h3 className="font-bold text-[#1D3557] mb-2 text-lg">{w.title}</h3>
                <p className="text-sm text-[#4A6A82] leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ── Future of Zupwell ── */}
      {s(settings, "about_future") && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-[#1D3557]">
                The Future of <span className="gradient-text">Zupwell</span>
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.1)}
              className="card border border-[#45B08C]/20 bg-[#F1FAFF]">
              <p className="text-[#4A6A82] leading-relaxed text-lg mb-6">
                {s(settings, "about_future")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  "Daily multivitamins & immune boosters",
                  "Energy and focus formulations",
                  "Specialized recovery blends",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#4A6A82]">
                    <span className="text-[#45B08C] mt-0.5 shrink-0">→</span>
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
            <h2 className="text-2xl font-black text-[#1D3557] mb-4">
              Ready to fuel your hustle?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2 px-8 py-3">
                  Shop Now <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-outline px-8 py-3">
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