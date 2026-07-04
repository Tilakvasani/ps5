"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Droplets, Sun, Dumbbell, Truck, FlaskConical, Leaf, Recycle, Quote } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import { fetchSettings } from "@/lib/useSettings";

const GOALS = [
  { icon: Zap,       label: "ENERGY",      sub: "All-day fuel, zero crash",    color: "var(--or)" },
  { icon: Droplets,  label: "HYDRATION",   sub: "Replenish what you lose",     color: "var(--dk)" },
  { icon: Sun,       label: "RECOVERY",    sub: "Bounce back faster",          color: "#F59E0B" },
  { icon: Dumbbell,  label: "PERFORMANCE", sub: "Train harder, go longer",     color: "#7C3AED" },
];

const TRUST = [
  { icon: Leaf,        label: "CLEAN LABEL",     sub: "Zero fillers, zero shortcuts" },
  { icon: FlaskConical,label: "BATCH TESTED",    sub: "Lab verified every time" },
  { icon: Truck,       label: "PAN-INDIA SHIP",  sub: "Free above ₹499" },
  { icon: Recycle,     label: "FSSAI CERTIFIED", sub: "Regulated & compliant" },
];

const REVIEWS = [
  { name: "SNEHA K., PUNE",      text: "I've tried five different electrolyte brands. Zupwell is the only one that doesn't taste like a hospital." },
  { name: "MANAV R., DELHI",     text: "One tablet before my run, one after. My cramps are basically gone. No exaggeration." },
  { name: "AAYESHA T., SURAT",   text: "Takes literally 20 seconds to dissolve. I add it to my morning water and I'm sorted for the day." },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    productsApi.list().then(d => setProducts((d.products || d || []).slice(0, 6))).catch(() => {});
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  const heroTitle = settings.hero_title || "Nutrition\nThat Works\nAs Hard As\nYou Do.";
  const heroBadge = settings.hero_badge || "EFFERVESCENT HEALTH SUPPLEMENT";

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ background: "radial-gradient(circle at 80% 20%, #0c2046 0%, #051124 100%)", paddingBottom: "24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px 0", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "center" }}>
          <div>
            <div style={{ background: "#122448", color: "#FFB800", fontSize: "9px", fontWeight: 900, padding: "6px 14px", borderRadius: "30px", display: "inline-block", letterSpacing: "1.2px", marginBottom: "18px", boxShadow: "0 0 10px rgba(255, 184, 0, 0.2)", border: "1px solid rgba(255, 184, 0, 0.2)" }}>
              ⚡ {heroBadge}
            </div>
            <h1 style={{ fontSize: "clamp(44px,7vw,72px)", fontWeight: 900, letterSpacing: "-3px", color: "#FFF", lineHeight: 0.88, marginBottom: "10px", whiteSpace: "pre-line" }}>
              {heroTitle.split("\n").map((line, i) => (
                <span key={i} style={{ display: "block", color: (i === 2 || i === 3) ? "#FFB800" : "#FFF" }}>{line}</span>
              ))}
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9CAE", lineHeight: 1.8, maxWidth: "380px", marginBottom: "24px", fontWeight: 500 }}>
              {settings.hero_subtext || "Drop one tablet into water and get a full spectrum of electrolytes, vitamins, and minerals — in 20 seconds flat. No sugar. No mess. Just results."}
            </p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
              <Link href="/products" className="zbtn-or" style={{ padding: "13px 28px", fontSize: "12px", borderRadius: "30px" }}>
                Order Now — ₹149 Only →
              </Link>
              <Link href="/science" className="zbtn-out" style={{ padding: "12px 26px", fontSize: "12px", borderColor: "#FFB800", color: "#FFB800", borderRadius: "30px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 184, 0, 0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                See The Science
              </Link>
            </div>
            <div style={{ display: "flex", borderTop: "1px solid #1E2D4A" }}>
              {[
                { val: settings.hero_stat1_value || "15+",  lbl: "MICRONUTRIENTS" },
                { val: settings.hero_stat2_value || "4.7★",  lbl: "CUSTOMER RATING", color: "#FF5C00" },
                { val: "0g",                                 lbl: "ADDED SUGAR", color: "#FFB800" },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ padding: "18px 24px", borderRight: "1px solid #1E2D4A" }}>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: color || "#FFF", letterSpacing: "-1px" }}>{val}</div>
                  <div style={{ fontSize: "9px", fontWeight: 900, color: "#627D98", letterSpacing: "0.8px", marginTop: "2px" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Card Container (matching image glassmorphism card style) */}
          <div style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A", borderRadius: "24px", padding: "32px 24px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ background: "#051124", border: "1px solid #1E2D4A", borderRadius: "18px", padding: "28px 20px", textAlign: "center", width: "100%", maxWidth: "240px", boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)" }}>
              <div style={{ background: "#FF5C00", color: "#FFF", fontSize: "8px", fontWeight: 900, padding: "5px 12px", borderRadius: "30px", letterSpacing: "1.2px", display: "inline-block", marginBottom: "18px" }}>
                HEALTH SUPPLEMENT
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "36px", marginBottom: "14px" }}>
                <span>🍊</span>
                <span style={{ color: "#FF5C00", fontSize: "32px", fontWeight: "bold" }}>⚡</span>
              </div>
              <div style={{ color: "#FFF", fontSize: "18px", fontWeight: 900, marginBottom: "2px" }}>zupwell</div>
              <div style={{ color: "#FF5C00", fontSize: "9px", fontWeight: 800, letterSpacing: "1px", marginBottom: "4px" }}>ELECTROLYTE</div>
              <div style={{ color: "#627D98", fontSize: "8px", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "20px" }}>ORANGE FLAVOUR • 15 TABLETS</div>
              <Link href="/products" style={{ background: "#FFB800", color: "#051124", display: "inline-block", fontSize: "12px", fontWeight: 900, padding: "10px 24px", borderRadius: "30px", letterSpacing: "0.5px", textDecoration: "none", transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                ₹299.00
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOALS ── */}
      <section style={{ background: "var(--dk)", padding: "0 24px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ borderTop: "1px solid #1E2D4A", paddingTop: "24px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#627D98", letterSpacing: "2px" }}>BUILT FOR EVERY KIND OF GRIND</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
            {GOALS.map(({ icon: Icon, label, sub, color }) => (
              <Link key={label} href={`/products?goal=${label.toLowerCase()}`}
                style={{ border: `1.5px solid #1E2D4A`, borderRadius: "8px", padding: "16px", textAlign: "center", textDecoration: "none", cursor: "pointer", background: "var(--dk-card)", transition: "border-color 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--or)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E2D4A")}>
                <Icon size={22} color={color} />
                <div style={{ color: "#FFF", fontSize: "10px", fontWeight: 900, marginTop: "8px", letterSpacing: "0.5px" }}>{label}</div>
                <div style={{ color: "#444", fontSize: "9px", marginTop: "2px", fontWeight: 600 }}>{sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: "var(--or)", padding: "12px 0", overflow: "hidden" }}>
        <div className="zmarquee-track">
          {[...Array(8)].map((_, i) => (
            <span key={i} style={{ fontSize: "11px", fontWeight: 900, color: "#FFF", letterSpacing: "2px", whiteSpace: "nowrap", paddingRight: "40px" }}>
              ZERO SUGAR ★ FSSAI CERTIFIED ★ FAST DISSOLVING ★ 100% VEGETARIAN ★ MADE IN INDIA ★ NO ARTIFICIAL COLOURS ★
            </span>
          ))}
        </div>
      </div>

      {/* ── BEST SELLERS ── */}
      <section style={{ padding: "48px 24px", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, letterSpacing: "-1px", color: "#627D98" }}>BEST SELLERS</h2>
            <Link href="/products" style={{ fontSize: "11px", fontWeight: 800, color: "var(--or)", textDecoration: "none", letterSpacing: "0.5px" }}>VIEW ALL →</Link>
          </div>
          {products.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
              {[{ e: "🍊", n: "Orange Drop", b: "🔥 BEST SELLER", c: "#FFE8DF", p: "299" },
                { e: "🍋", n: "Lemon Mint",  b: "NEW DROP",      c: "#EDFADF", p: "299" },
                { e: "🍇", n: "Berry Blast", b: "BUNDLE DEAL",   c: "#F0E8FF", p: "279" }].map(({ e, n, b, c, p }) => (
                <div key={n} className="zpcard">
                  <div style={{ background: c, height: "120px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", borderBottom: "1.5px solid var(--dk)" }}>{e}</div>
                  <div style={{ padding: "14px" }}>
                    <span className="zbadge zbadge-or" style={{ marginBottom: "6px" }}>{b}</span>
                    <div style={{ fontSize: "13px", fontWeight: 800, marginTop: "4px", marginBottom: "8px" }}>{n}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "16px", fontWeight: 900 }}>₹{p}</span>
                      <Link href="/products" className="zbtn-or" style={{ fontSize: "10px", padding: "7px 12px" }}>ADD +</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section style={{ background: "var(--dk)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <Icon size={22} color="var(--or)" />
              <div style={{ color: "#FFF", fontSize: "10px", fontWeight: 900, letterSpacing: "0.5px", marginTop: "8px" }}>{label}</div>
              <div style={{ color: "#8F9CAE", fontSize: "9px", fontWeight: 600, marginTop: "3px" }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: "48px 24px", background: "#F8F8F8" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", letterSpacing: "2px", marginBottom: "8px" }}>STRAIGHT FROM OUR CUSTOMERS</div>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, letterSpacing: "-1.5px", color: "#627D98" }}>HONEST WORDS. REAL RESULTS.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
            {REVIEWS.map(({ name, text }) => (
              <div key={name} className="zcard">
                <Quote size={18} color="var(--or)" style={{ marginBottom: "10px" }} />
                <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.7, color: "#627D98", marginBottom: "12px" }}>"{text}"</p>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#8F9CAE", letterSpacing: "0.5px" }}>— {name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: "var(--dk)", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-2px", color: "#FFF", marginBottom: "12px", lineHeight: 1 }}>
            YOUR HEALTH GOALS<br /><span style={{ color: "var(--or)" }}>START HERE.</span>
          </h2>
          <p style={{ fontSize: "13px", color: "#8F9CAE", marginBottom: "24px", fontWeight: 500 }}>
            Premium nutrition. Simple format. Transparent ingredients. No games — just the good stuff your body actually needs.
          </p>
          <Link href="/products" className="zbtn-or" style={{ padding: "15px 32px", fontSize: "13px", borderRadius: "30px" }}>
            EXPLORE ALL PRODUCTS →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
