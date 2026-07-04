"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import Link from "next/link";
import { FlaskConical, Shield, Leaf, Droplets, Award, CheckCircle, Microscope, Package } from "lucide-react";
import { fetchSettings } from "@/lib/useSettings";

const DEFAULTS: Record<string,string> = {
  science_hero_badge:    "Science & Quality",
  science_hero_title:    "Where Nutrition Meets Precision",
  science_hero_subtext:  "We don't guess. Every ingredient, every dose, every batch is grounded in research — so you get supplements that actually do what they say.",
  science_process1_title:"Ingredient Selection",
  science_process1_desc: "Not all raw materials are created equal. We partner with certified suppliers and reject anything that doesn't pass our purity benchmarks — before formulation even begins.",
  science_process2_title:"Effervescent Engineering",
  science_process2_desc: "Our effervescent delivery system isn\'t just a gimmick — it unlocks rapid nutrient dissolution, ensuring your body absorbs what it needs within minutes, not hours.",
  science_process3_title:"Multi-Stage Quality Check",
  science_process3_desc: "Every finished batch clears a series of physical, chemical, and microbiological tests. We only release what passes — no exceptions, no shortcuts.",
};

const CERTIFICATIONS = [
  { icon: Award,       label:"FSSAI Licensed",     sub:"Central food safety compliance" },
  { icon: Shield,      label:"GMP Facility",       sub:"Good Manufacturing Practice" },
  { icon: Microscope,  label:"3rd Party Tested",   sub:"Independent lab verification" },
  { icon: Package,     label:"Batch Traceable",    sub:"End-to-end transparency" },
];

const SCIENCE_FACTS = [
  { icon: Droplets,    title:"Rapid Absorption",   body:"Effervescent delivery dissolves completely in water, letting nutrients enter your bloodstream faster than capsules or powders." },
  { icon: FlaskConical,title:"Clinically Dosed",   body:"Each ingredient is measured to levels supported by published research. Not window dressing — functional amounts that actually move the needle." },
  { icon: Leaf,        title:"Nothing Unnecessary",body:"No artificial dyes, no added sugar, no binding agents you can\'t pronounce. The label is short because we keep it clean." },
  { icon: CheckCircle, title:"Bioavailable Forms",  body:"We choose the nutrient forms your body can actually use — not cheaper alternatives that pass straight through you." },
];

export default function SciencePage() {
  const [s, setS] = useState<Record<string,string>>(DEFAULTS);
  useEffect(() => { fetchSettings().then(d => setS({ ...DEFAULTS, ...d })).catch(() => {}); }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background:"var(--dk)", padding:"60px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:"640px", margin:"0 auto" }}>
          <div style={{ background:"var(--lm)", color:"var(--dk)", fontSize:"9px", fontWeight:900, padding:"5px 14px", borderRadius:"4px", letterSpacing:"1.5px", display:"inline-block", marginBottom:"16px" }}>
            {s.science_hero_badge.toUpperCase()}
          </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:900, letterSpacing:"-2px", color:"var(--wh)", lineHeight:1, marginBottom:"14px" }}>
            {s.science_hero_title.split("\n").map((l,i) => <span key={i} style={{ display:"block", color: i===1 ? "var(--or)" : "var(--wh)" }}>{l}</span>)}
          </h1>
          <p style={{ fontSize:"13px", color:"#8F9CAE", lineHeight:1.8, fontWeight:500 }}>{s.science_hero_subtext}</p>
        </div>
      </section>

      {/* Science facts */}
      <section style={{ padding:"48px 24px", background:"var(--dk)" }}>
        <div style={{ maxWidth:"1280px", margin:"0 auto" }}>
          <div style={{ fontSize:"10px", fontWeight:900, color:"var(--or)", letterSpacing:"2px", marginBottom:"8px" }}>THE SCIENCE</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"20px", color: "var(--wh)" }}>HOW WE BUILD SUPPLEMENTS DIFFERENTLY</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"14px" }}>
            {SCIENCE_FACTS.map(({ icon:Icon, title, body }) => (
              <div key={title} className="zcard">
                <Icon size={22} color="var(--or)" style={{ marginBottom:"10px" }} />
                <div style={{ fontSize:"12px", fontWeight:900, letterSpacing:"0.3px", marginBottom:"6px" }}>{title.toUpperCase()}</div>
                <div style={{ fontSize:"12px", color:"#8F9CAE", lineHeight:1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding:"48px 24px", background:"var(--dk)" }}>
        <div style={{ maxWidth:"1280px", margin:"0 auto" }}>
          <div style={{ fontSize:"10px", fontWeight:900, color:"var(--or)", letterSpacing:"2px", marginBottom:"8px" }}>OUR PROCESS</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"20px", color: "var(--wh)" }}>HOW WE MAKE IT</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px" }}>
            {[
              { n:"01", title:s.science_process1_title, desc:s.science_process1_desc },
              { n:"02", title:s.science_process2_title, desc:s.science_process2_desc },
              { n:"03", title:s.science_process3_title || "Quality Control", desc:s.science_process3_desc || "27 quality checkpoints per batch." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="zcard">
                <div style={{ fontSize:"28px", fontWeight:900, color:"var(--or)", letterSpacing:"-1px", marginBottom:"10px" }}>{n}</div>
                <div style={{ fontSize:"13px", fontWeight:900, letterSpacing:"-0.3px", marginBottom:"8px" }}>{title.toUpperCase()}</div>
                <div style={{ fontSize:"12px", color:"#8F9CAE", lineHeight:1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ padding:"48px 24px", background:"var(--dk)" }}>
        <div style={{ maxWidth:"1280px", margin:"0 auto" }}>
          <div style={{ fontSize:"10px", fontWeight:900, color:"var(--lm)", letterSpacing:"2px", textAlign:"center", marginBottom:"8px" }}>VERIFIED & TRUSTED</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, letterSpacing:"-1.5px", color:"var(--wh)", textAlign:"center", marginBottom:"20px" }}>OUR CERTIFICATIONS</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px" }}>
            {CERTIFICATIONS.map(({ icon:Icon, label, sub }) => (
              <div key={label} style={{ border:"1.5px solid var(--bd-soft)", borderRadius:"10px", padding:"20px", textAlign:"center", background: "var(--dk-card)" }}>
                <Icon size={24} color="var(--or)" style={{ margin:"0 auto 10px" }} />
                <div style={{ fontSize:"11px", fontWeight:900, color:"var(--wh)", letterSpacing:"0.3px", marginBottom:"4px" }}>{label.toUpperCase()}</div>
                <div style={{ fontSize:"10px", color:"#8F9CAE", fontWeight:600 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"var(--or)", padding:"40px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, letterSpacing:"-1.5px", color:"var(--wh)", marginBottom:"14px" }}>GOOD SCIENCE DESERVES YOUR TRUST.</h2>
        <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.8)", marginBottom:"20px", fontWeight:500 }}>Read the label. Check the research. Then decide for yourself.</p>
        <Link href="/products" className="zbtn-dk" style={{ padding:"14px 28px", fontSize:"12px", letterSpacing:"0.5px", borderRadius:"30px" }}>SHOP NOW →</Link>
      </section>

      <Footer />
    </>
  );
}
