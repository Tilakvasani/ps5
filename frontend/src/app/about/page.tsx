"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Heart, Eye, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { publicApi } from "@/lib/api";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

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
    publicApi.getSettings().then(setSettings).catch(() => {});
  }, []);

  const why = [1, 2, 3].map(n => ({
    title: s(settings, `about_why${n}_title`),
    desc:  s(settings, `about_why${n}_desc`),
    icon:  [Zap, Heart, Star][n - 1],
  }));

  return (
    <main className="min-h-screen bg-[#F4F6FA] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 bg-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#F47C41]/6 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.span {...fadeUp(0)}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-4">
            About Zupwell
          </motion.span>
          <motion.h1 {...fadeUp(0.1)}
            className="text-5xl md:text-6xl font-display font-black text-[#111827] leading-tight mb-6">
            "{s(settings, "about_punchline")}"
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            {s(settings, "about_description")}
          </motion.p>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-3 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827] mb-6 leading-tight">
              Born to solve a <span className="gradient-text">real problem</span>
            </h2>
            <p className="text-[#374151] leading-relaxed text-lg">
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
                <p className="text-3xl font-display font-black gradient-text">{val}</p>
                <p className="text-sm text-[#6B7280] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeUp(0)} className="card border-l-4 border-l-[#F47C41] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#F47C41]/10 flex items-center justify-center mb-4">
              <Heart size={20} className="text-[#F47C41]" />
            </div>
            <h3 className="text-xl font-display font-black text-[#111827] mb-3">Our Mission</h3>
            <p className="text-[#374151] leading-relaxed">{s(settings, "about_mission")}</p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="card border-l-4 border-l-[#2EC4B6] rounded-l-none">
            <div className="h-10 w-10 rounded-xl bg-[#2EC4B6]/10 flex items-center justify-center mb-4">
              <Eye size={20} className="text-[#2EC4B6]" />
            </div>
            <h3 className="text-xl font-display font-black text-[#111827] mb-3">Our Vision</h3>
            <p className="text-[#374151] leading-relaxed">{s(settings, "about_vision")}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Why Zupwell ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827] mb-3">
              Why <span className="gradient-text">Zupwell?</span>
            </h2>
            <p className="text-[#6B7280]">Three reasons our customers never look back</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {why.map((w, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="card text-center group hover:border-[#F47C41]/30 transition-all">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-[#F47C41]/10 flex items-center justify-center mb-4 group-hover:bg-[#F47C41]/20 transition-all">
                  <w.icon size={24} className="text-[#F47C41]" />
                </div>
                <h3 className="font-display font-bold text-[#111827] mb-2 text-lg">{w.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder's Message ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827]">
              Founder's <span className="gradient-text">Message</span>
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="card flex flex-col md:flex-row gap-8 items-center">
            {/* Photo */}
            <div className="shrink-0 text-center">
              {s(settings, "founder_photo") ? (
                <img src={s(settings, "founder_photo")} alt={s(settings, "founder_name")}
                  className="h-36 w-36 rounded-full object-cover border-4 border-[#F47C41]/20 mx-auto" />
              ) : (
                <div className="h-36 w-36 rounded-full bg-[#F47C41]/10 flex items-center justify-center text-5xl font-display font-black text-[#F47C41] mx-auto">
                  {s(settings, "founder_name").charAt(0)}
                </div>
              )}
              <p className="font-display font-bold text-[#111827] mt-3">{s(settings, "founder_name")}</p>
              <p className="text-xs text-[#6B7280]">{s(settings, "founder_title")}</p>
            </div>
            {/* Quote */}
            <div className="flex-1">
              <div className="text-5xl text-[#F47C41]/20 font-display font-black leading-none mb-2">"</div>
              <p className="text-[#374151] leading-relaxed text-lg italic">
                {s(settings, "founder_message")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Future of Zupwell ── */}
      {s(settings, "about_future") && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div {...fadeUp(0)} className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-black text-[#111827]">
                The Future of <span className="gradient-text">Zupwell</span>
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.1)}
              className="card border border-[#F47C41]/20 bg-gradient-to-br from-[#F47C41]/5 to-[#FFD166]/5">
              <p className="text-[#374151] leading-relaxed text-lg mb-6">
                {s(settings, "about_future")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  "Daily multivitamins & immune boosters",
                  "Energy and focus formulations",
                  "Specialized recovery blends",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="text-[#F47C41] mt-0.5 shrink-0">→</span>
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
            <h2 className="text-2xl font-display font-black text-[#111827] mb-4">
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