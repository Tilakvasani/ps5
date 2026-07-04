"use client";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import Link from "next/link";
import { FlaskConical, Zap, Ban, Leaf } from "lucide-react";

const SCIENCE = [
  { icon: Zap,          title: "BIOAVAILABLE FORMULA",    body: "Effervescent delivery means nutrients dissolve fully in water and absorb faster than capsules or pills — your body gets more from every single dose." },
  { icon: FlaskConical, title: "RESEARCH-DRIVEN DOSES",   body: "Every ingredient is included at clinically meaningful levels. No micro-doses, no label decoration — just doses that actually make a difference." },
  { icon: Ban,          title: "NOTHING HIDDEN.",         body: "Zero added sugar, zero artificial colouring, zero preservatives you can\'t pronounce. The ingredient list is short because we keep it honest." },
  { icon: Leaf,         title: "FSSAI REGULATED",         body: "We operate under India\'s central food safety authority guidelines and undergo third-party lab testing for every production batch." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "var(--dk)", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ background: "var(--lm)", color: "var(--dk)", fontSize: "9px", fontWeight: 900, padding: "5px 14px", borderRadius: "4px", letterSpacing: "1.5px", display: "inline-block", marginBottom: "16px" }}>
            OUR STORY
          </div>
          <h1 style={{ fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, letterSpacing: "-2.5px", color: "var(--wh)", lineHeight: 0.9, marginBottom: "16px" }}>
            WE DON&apos;T JUST SELL SUPPLEMENTS.<br /><span style={{ color: "var(--or)" }}>WE FUEL YOUR HUSTLE.</span>
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9CAE", lineHeight: 1.8, fontWeight: 500 }}>
            Most supplement brands overcomplicate things — hard-to-swallow capsules, powders that clump, fancy claims with weak doses. Zupwell does the opposite. Simple format, honest ingredients, results you can feel.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background: "var(--or)", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {[["15+","ACTIVE NUTRIENTS"],["100%","CLEAN LABEL"],["0g","ADDED SUGAR"],["3-5","DAYS DELIVERY"]].map(([val,lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#FFF", letterSpacing: "-1px" }}>{val}</div>
              <div style={{ fontSize: "9px", fontWeight: 900, color: "var(--dk)", letterSpacing: "1px", marginTop: "2px" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Science */}
      <section style={{ padding: "48px 24px", background: "var(--dk)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "20px", color: "var(--wh)" }}>WHAT MAKES US DIFFERENT</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "14px" }}>
            {SCIENCE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="zcard">
                <Icon size={22} color="var(--or)" style={{ marginBottom: "10px" }} />
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.5px", marginBottom: "6px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "#8F9CAE", lineHeight: 1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section style={{ background: "var(--dk)", padding: "48px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="zcard">
            <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", letterSpacing: "1.5px", marginBottom: "12px" }}>FOUNDER&apos;S NOTE</div>
            <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#8F9CAE", fontWeight: 500, fontStyle: "italic", marginBottom: "14px" }}>
              &ldquo;I built Zupwell because I was tired of supplements that felt like homework. Big tubs, confusing scoops, flavours that tasted like chalk. I wanted something that fit into real life — a tablet you drop in water on the way out the door. That's it. Effective, convenient, and actually enjoyable to take.&rdquo;
            </p>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "var(--wh)", letterSpacing: "0.5px" }}>PARAG HIRPARA — FOUNDER &amp; CEO, ZUPWELL</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--dk)", padding: "40px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-1.5px", color: "var(--wh)", marginBottom: "14px" }}>
            SUPPLEMENTS THAT WORK<br /><span style={{ color: "var(--or)" }}>FOR YOUR LIFE.</span>
          </h2>
          <p style={{ fontSize: "13px", color: "#8F9CAE", marginBottom: "20px", fontWeight: 500 }}>
            No complicated routines. No giant tubs. Just what your body needs, when it needs it.
          </p>
          <Link href="/products" className="zbtn-or" style={{ padding: "14px 28px", fontSize: "12px", borderRadius: "30px" }}>SHOP NOW →</Link>
      </section>

      <Footer />
    </>
  );
}
