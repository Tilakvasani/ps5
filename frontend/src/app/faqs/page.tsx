"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useEffect } from "react";
import { useSettings } from "@/lib/useSettings";

const FAQS = [
  {
    category: "Product Related",
    emoji: "📦",
    questions: [
      {
        q: "Can these tablets be chewed directly?",
        a: "Absolutely not! These are 'Effervescent' tablets. Put them in water, watch the magic (fizz) and then drink. Eating them directly is not a good idea!",
      },
      {
        q: "How much sugar is in this?",
        a: "Less! We believe in taste, not in loads of sugar. Staying fit has now become delicious.",
      },
      {
        q: "How many tablets can be taken in a day?",
        a: "Usually 1 tablet a day is enough. But if you are working out excessively, you can take it as per your doctor's advice.",
      },
    ],
  },
  {
    category: "Safety & Quality",
    emoji: "🛡️",
    questions: [
      {
        q: "Is this safe?",
        a: "100%! Our products are made from high-quality ingredients and comply with all regulations for nutraceuticals.",
      },
      {
        q: "Will there be any side effects from taking this?",
        a: "This is a health supplement, not a medicine. If you are allergic to anything specific, please check the ingredients list or ask your doctor.",
      },
    ],
  },
  {
    category: "Orders & Delivery",
    emoji: "🚚",
    questions: [
      {
        q: "When will my order arrive?",
        a: "We know you don't like to wait! Zupwell will be at your doorstep within 3 to 5 days of ordering.",
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, you can cancel until the product ships. Once it leaves, it will be here to boost your energy!",
      },
    ],
  },
  {
    category: "General",
    emoji: "💬",
    questions: [
      {
        q: "Why should I choose Zupwell?",
        a: "Because we make health stylish and delicious. Otherwise, try it once, you will understand for yourself!",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="zcard p-0 overflow-hidden" style={{ borderColor: open ? "var(--or)" : "rgba(12, 30, 57, 0.08)", background: "#FFFFFF", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        style={{ background: "#FFFFFF" }}
      >
        <span className="font-semibold text-sm md:text-base transition-colors" style={{ color: open ? "var(--or)" : "#0C1E39" }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={18} style={{ color: open ? "var(--or)" : "#0C1E39" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 text-sm leading-relaxed pt-3" style={{ color: "#4A5568", borderTop: "1px solid rgba(12, 30, 57, 0.08)" }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQsPage() {
  const { raw: settings, loading } = useSettings();
  const [faqsList, setFaqsList] = useState<any[]>(FAQS);
  const [whatsapp, setWhatsapp] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (loading) return;
    setWhatsapp(settings.contact_whatsapp || "");
    if (settings.faqs_list_json) {
      try {
        const list = JSON.parse(settings.faqs_list_json);
        if (Array.isArray(list) && list.length > 0) {
          setFaqsList(list);
        }
      } catch (e) {
        console.error("Failed to parse faqs_list_json:", e);
      }
    }
  }, [settings, loading]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)" }} />
      </div>
    </main>
  );

  const categories = ["All", ...faqsList.map(f => f.category)];
  const filtered = activeCategory === "All" ? faqsList : faqsList.filter(f => f.category === activeCategory);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--gy)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden" style={{ background: "#0C1E39", borderBottom: "1.5px solid #051124" }}>
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full" style={{ background: "rgba(255, 92, 0, 0.06)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block zbadge zbadge-or mb-4" style={{ fontSize: "12px" }}>
            {settings.faqs_hero_badge || "FAQs"}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
            {settings.faqs_hero_title ? (
              settings.faqs_hero_title.includes("Questions?") ? (
                <>Got <span style={{ color: "var(--or)" }}>Questions?</span></>
              ) : settings.faqs_hero_title
            ) : (
              <>Got <span style={{ color: "var(--or)" }}>Questions?</span></>
            )}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg" style={{ color: "#F8F8F8", opacity: 0.85 }}>
            {settings.faqs_hero_subtext || "Everything you need to know about Zupwell and our products."}
          </motion.p>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="py-8 px-6 border-b" style={{ background: "var(--gy)", borderColor: "rgba(12, 30, 57, 0.08)" }}>
        <div className="mx-auto max-w-3xl flex items-center gap-2 flex-wrap justify-center">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="zpill font-semibold transition-all"
              style={{
                background: activeCategory === cat ? "var(--or)" : "transparent",
                color: activeCategory === cat ? "#FFFFFF" : "#0C1E39",
                borderColor: activeCategory === cat ? "var(--or)" : "rgba(12, 30, 57, 0.08)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── FAQ Accordions ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl space-y-10">
          {filtered.map((section, i) => (
            <motion.div key={section.category}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{section.emoji}</span>
                <h2 className="text-xl font-black" style={{ color: "#0C1E39", letterSpacing: "-0.03em" }}>{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.questions.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Still have a question ── */}
      <section className="py-16 px-6" style={{ background: "#0C1E39", borderTop: "1.5px solid #051124" }}>
        <div className="mx-auto max-w-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255, 92, 0, 0.1)" }}>
              <MessageCircle size={28} style={{ color: "var(--or)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#FFFFFF" }}>
              {settings.faqs_footer_title || "Still have a question?"}
            </h2>
            <p className="mb-6" style={{ color: "#F8F8F8", opacity: 0.85 }}>
              {settings.faqs_footer_subtext || "Can't find what you're looking for? We're just a message away!"}
            </p>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-or flex items-center gap-2 px-8 py-3 mx-auto">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </motion.button>
              </a>
            ) : (
              <a href="mailto:support@zupwell.com">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-or flex items-center gap-2 px-8 py-3 mx-auto">
                  <MessageCircle size={16} /> Contact Us
                </motion.button>
              </a>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

