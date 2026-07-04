"use client";
import { useState } from "react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  { q: "How do I use Zupwell tablets?", a: "Drop one tablet into a glass of 200–250ml of water, wait about 20 seconds for it to fully dissolve, and drink. That's it. No blender, no shaker, no measuring." },
  { q: "Can I take it every day?", a: "Yes, Zupwell is formulated for daily use. One tablet a day is the recommended starting point. If you're highly active or sweating heavily, you can take up to two tablets — one in the morning and one after your workout." },
  { q: "Does it actually taste good?", a: "We spent a long time on the flavour. It should taste like a refreshing fizzy drink — not a medicine, not a science experiment. Try it once and let us know." },
  { q: "Can I take it on an empty stomach?", a: "Yes. Since it's dissolved in water, it's easy on the stomach. That said, some people prefer taking supplements with a light meal — both work fine." },
  { q: "What exactly is inside a Zupwell tablet?", a: "Every tablet contains a blend of key electrolytes (Sodium, Potassium, Magnesium, Calcium, Chloride), vitamins, and natural flavour. No added sugar, no artificial colours, no hidden fillers. Full ingredient list is on the pack." },
  { q: "Is it safe for people with health conditions?", a: "Zupwell is a food supplement, not a medicine. If you have a diagnosed health condition or take prescription medications, we recommend checking with your doctor first — just to be sure it fits your specific situation." },
  { q: "Is it suitable for vegetarians?", a: "Yes, 100%. Zupwell tablets are fully vegetarian. No animal-derived ingredients anywhere in the formula." },
  { q: "Does it contain caffeine or stimulants?", a: "No. Zupwell contains zero caffeine, zero stimulants. The energy benefit comes from proper electrolyte balance and hydration — which is how your body is actually supposed to function." },
  { q: "How long will delivery take?", a: "Most orders are delivered within 3 to 5 business days across India. You'll get a tracking link as soon as your order is dispatched." },
  { q: "What's your return policy?", a: "If you receive a damaged or incorrect product, contact us within 48 hours and we'll fix it — replacement or full refund. For change-of-mind returns, unopened products can be returned within 7 days of delivery." },
  { q: "Do you offer bulk or wholesale pricing?", a: "We do. If you're buying for a gym, sports team, clinic, or retail outlet, reach out to us directly at support@zupwell.com and we'll work out the right arrangement." },
];

const CATS = ["ALL", "PRODUCT", "SHIPPING", "RETURNS"];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--dk)", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-2px", color: "var(--wh)", marginBottom: "6px" }}>
          GOT QUESTIONS?<br /><span style={{ color: "var(--or)" }}>WE GOT ANSWERS.</span>
        </h1>
        <div style={{ maxWidth: "380px", margin: "20px auto 0" }}>
          <input className="zinp" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: "var(--dk-card)", borderColor: "var(--bd-soft)", color: "var(--wh)" }} />
        </div>
      </section>

      <section style={{ padding: "40px 24px", background: "var(--dk)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {filtered.map((faq, i) => (
            <div key={i} className="zcard" style={{ marginBottom: "8px", cursor: "pointer", borderLeft: open === i ? "3px solid var(--or)" : "1.5px solid var(--bd-soft)" }}
              onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "-0.2px", lineHeight: 1.4, color: "var(--wh)" }}>{faq.q}</span>
                {open === i ? <ChevronUp size={16} color="var(--or)" style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color="var(--mu)" style={{ flexShrink: 0 }} />}
              </div>
              {open === i && (
                <div style={{ marginTop: "12px", fontSize: "13px", color: "#8F9CAE", lineHeight: 1.7, fontWeight: 500, borderTop: "1px solid var(--bd-soft)", paddingTop: "12px" }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#8F9CAE" }}>No results found for "{search}"</div>
          )}

          <div style={{ background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)", borderRadius: "10px", padding: "24px", textAlign: "center", marginTop: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--wh)", letterSpacing: "-0.5px", marginBottom: "6px" }}>DIDN&apos;T FIND YOUR ANSWER?</div>
            <div style={{ fontSize: "12px", color: "#8F9CAE", marginBottom: "14px" }}>We’re available Mon–Sat, 9AM–6PM IST. Real people, not bots.</div>
            <Link href="/contact" className="zbtn-or" style={{ padding: "11px 22px", fontSize: "11px", borderRadius: "30px" }}>GET IN TOUCH →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
