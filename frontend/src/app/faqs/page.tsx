"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings } from "@/lib/useSettings";

const FAQS = [
  {
    category: "Product Related",
    emoji: "📦",
    questions: [
      {
        q: "Can these tablets be chewed directly?",
        a: "Absolutely not! These are effervescent tablets designed to dissolve in water. Drop one tablet into a 250ml glass of water, watch it fizz completely, and then enjoy a refreshing health drink. Chewing them directly is not recommended.",
      },
      {
        q: "How much sugar is in Zupwell supplements?",
        a: "Zero added sugar! We formulate our wellness tablets with premium, clean ingredients and use zero-calorie natural sweeteners. You get all the health benefits without the sugar crash.",
      },
      {
        q: "How many tablets can I consume in a day?",
        a: "Generally, 1 tablet per day is perfect for maintaining hydration and vitamin levels. If you are doing intense training, high endurance workouts, or have specific medical queries, consult your healthcare practitioner.",
      },
    ],
  },
  {
    category: "Safety & Quality",
    emoji: "🛡️",
    questions: [
      {
        q: "Are Zupwell products certified and safe?",
        a: "Yes, 100%. Our products are GMP, ISO, and FSSAI certified. They are manufactured under the highest clinical standards and undergo third-party laboratory tests for quality assurance.",
      },
      {
        q: "Will there be any side effects?",
        a: "Zupwell supplements are formulated with clinically tested, clean vitamins and minerals, meaning they are completely safe. However, if you are allergic to specific ingredients or have underlying conditions, please check the label and consult a doctor first.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    emoji: "🚚",
    questions: [
      {
        q: "When will my order be delivered?",
        a: "We ship orders within 24 hours of placement. Standard delivery takes 3 to 5 business days across India, with real-time tracking sent directly to your registered email and phone.",
      },
      {
        q: "What is your cancellation and return policy?",
        a: "You can cancel your order at any time before it is shipped. We also offer a hassle-free 7-day return window on unused, sealed items if you receive a damaged or incorrect package.",
      },
    ],
  },
  {
    category: "General Queries",
    emoji: "💡",
    questions: [
      {
        q: "Why should I choose Zupwell?",
        a: "Because we make modern wellness simple, clean, and delicious. No complex pills or boring routines — just drop, fizz, drink, and upgrade your hydration in seconds.",
      },
    ],
  },
];

const D: Record<string, string> = {
  faqs_hero_badge: "FAQs",
  faqs_hero_title: "Got Questions?",
  faqs_hero_subtext: "Everything you need to know about Zupwell and our products.",
  faqs_footer_title: "Still have a question?",
  faqs_footer_subtext: "Can't find what you're looking for? We're just a message away!",
};

const s = (settings: Record<string, string>, key: string) =>
  settings[key] || D[key] || "";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-[#E8E2D9] rounded-2xl overflow-hidden bg-white transition-all duration-200 ${open ? "border-[#48C062] shadow-sm" : "hover:border-[#48C062]/20"}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4.5 text-left">
        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${open ? "text-[#48C062]" : "text-[#002A30]"}`}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} className={open ? "text-[#48C062]" : "text-[#8C8276]"} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 text-xs font-semibold uppercase tracking-wider text-[#45353E] leading-relaxed border-t border-[#FCFAF6] pt-3.5">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    const onBust = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust")
        fetchSettings().then(setSettings).catch(() => {});
    };
    window.addEventListener("storage", onBust);
    return () => window.removeEventListener("storage", onBust);
  }, []);

  const whatsapp = settings.contact_whatsapp || "";

  // Parse FAQs list from settings
  let faqs = FAQS;
  if (settings.faqs_list_json) {
    try {
      const parsed = JSON.parse(settings.faqs_list_json);
      if (Array.isArray(parsed)) {
        faqs = parsed;
      }
    } catch (err) {
      console.error("Failed to parse FAQs JSON:", err);
    }
  }

  const categories = ["All", ...faqs.map((f: any) => f.category)];
  const filtered = activeCategory === "All" ? faqs : faqs.filter((f: any) => f.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#FCFAF6] overflow-x-hidden">
      <Navbar />

<<<<<<< HEAD
      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 px-6 bg-white border-b border-[#E8E2D9] overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#48C062]/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9]">
            Help Center
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-[#002A30] leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-xs font-bold text-[#8C8276] uppercase tracking-wider">
            Find answers to common questions about our products & shipping.
          </p>
=======
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 bg-white overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#48C062]/6 " />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#48C062] mb-4">
            {s(settings, "faqs_hero_badge")}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-[#002A30] mb-4 leading-tight">
            {s(settings, "faqs_hero_title").split(/(Questions\?)/i).map((part, i) => {
              if (part.toLowerCase() === "questions?") {
                return <span key={i} className="gradient-text">{part}</span>;
              }
              return part;
            })}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-[#45353E]">
            {s(settings, "faqs_hero_subtext")}
          </motion.p>
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
        </div>
      </section>

      {/* Category Tabs Selector */}
      <section className="py-6 px-6 bg-white border-b border-[#E8E2D9] sticky top-[68px] z-30 shadow-sm">
        <div className="mx-auto max-w-3xl flex items-center gap-2.5 flex-wrap justify-center">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[#48C062] text-white shadow-md shadow-[#48C062]/20"
                  : "bg-[#FCFAF6] text-[#45353E] border border-[#E8E2D9] hover:border-[#48C062] hover:text-[#48C062]"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Item Accordions */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl space-y-12">
          {filtered.map((section, i) => (
            <motion.div key={section.category}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl h-8 w-8 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center shadow-soft">{section.emoji}</span>
                <h2 className="font-display font-bold text-lg text-[#002A30] uppercase tracking-wider">{section.category}</h2>
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

      {/* Contact Widget */}
      <section className="py-16 px-6 bg-white border-t border-[#E8E2D9]">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="h-16 w-16 rounded-3xl bg-[#FCFAF6] border border-[#E8E2D9] flex items-center justify-center mx-auto mb-4 shadow-soft">
              <HelpCircle size={28} className="text-[#48C062]" />
            </div>
<<<<<<< HEAD
            <h2 className="font-display text-2xl font-black text-[#002A30] uppercase tracking-wide">
              Still have questions?
            </h2>
            <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mb-6">
              Can't find the answer you need? Get in touch with our wellness support team.
=======
            <h2 className="text-2xl font-black text-[#002A30] mb-2">
              {s(settings, "faqs_footer_title")}
            </h2>
            <p className="text-[#45353E] mb-6">
              {s(settings, "faqs_footer_subtext")}
>>>>>>> 3fafafe9dfa2fc6041d3fbf2f0f5c8dcafb59565
            </p>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2 px-8 py-3.5 mx-auto font-sans text-xs uppercase tracking-[0.12em] font-bold">
                  <MessageCircle size={16} /> WhatsApp Support
                </motion.button>
              </a>
            ) : (
              <a href="mailto:support@zupwell.com">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center gap-2 px-8 py-3.5 mx-auto font-sans text-xs uppercase tracking-[0.12em] font-bold">
                  <MessageCircle size={16} /> Support Mail
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
