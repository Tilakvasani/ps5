"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useEffect } from "react";
import { fetchSettings } from "@/lib/useSettings";

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
    emoji: "💡",
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
    <div className="zcard p-0 overflow-hidden" style={{ borderColor: open ? "var(--or)" : "#1E2D4A" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        style={{ background: "#0C1E3E" }}
      >
        <span className="font-semibold text-sm md:text-base transition-colors" style={{ color: open ? "var(--or)" : "#FFFFFF" }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={18} style={{ color: open ? "var(--or)" : "#8F9CAE" }} />
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
            <div className="px-5 pb-5 text-sm leading-relaxed pt-3" style={{ color: "#8F9CAE", borderTop: "1px solid #1E2D4A" }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQsPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchSettings()
      .then(s => setWhatsapp(s.contact_whatsapp || ""))
      .catch(() => {});
    const onBust = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust")
        fetchSettings().then(s => setWhatsapp(s.contact_whatsapp || "")).catch(() => {});
    };
    window.addEventListener("storage", onBust);
    return () => window.removeEventListener("storage", onBust);
  }, []);

  const categories = ["All", ...FAQS.map(f => f.category)];
  const filtered = activeCategory === "All" ? FAQS : FAQS.filter(f => f.category === activeCategory);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden" style={{ background: "#0C1E3E", borderBottom: "1.5px solid #1E2D4A" }}>
        <div className="pointer-events-none absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full" style={{ background: "rgba(255, 92, 0, 0.06)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block zbadge zbadge-or mb-4">
            FAQs
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>
            Got <span style={{ color: "var(--or)" }}>Questions?</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg" style={{ color: "#8F9CAE" }}>
            Everything you need to know about Zupwell and our products.
          </motion.p>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="py-8 px-6 border-b" style={{ background: "var(--dk)", borderColor: "#1E2D4A" }}>
        <div className="mx-auto max-w-3xl flex items-center gap-2 flex-wrap justify-center">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="zpill font-semibold transition-all"
              style={{
                background: activeCategory === cat ? "var(--or)" : "transparent",
                color: activeCategory === cat ? "#FFFFFF" : "#8F9CAE",
                borderColor: activeCategory === cat ? "var(--or)" : "#1E2D4A",
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
                <h2 className="text-xl font-black" style={{ color: "#627d98", letterSpacing: "-0.03em" }}>{section.category}</h2>
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
      <section className="py-16 px-6" style={{ background: "#0C1E3E", borderTop: "1.5px solid #1E2D4A" }}>
        <div className="mx-auto max-w-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255, 92, 0, 0.1)" }}>
              <MessageCircle size={28} style={{ color: "var(--or)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#627d98" }}>
              Still have a question?
            </h2>
            <p className="mb-6" style={{ color: "#8F9CAE" }}>
              Can't find what you're looking for? We're just a message away!
            </p>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="zbtn-or flex items-center gap-2 px-8 py-3 mx-auto">
                  <MessageCircle size={16} /> WhatsApp Us
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

