"use client";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

interface Section { title: string; body: string | string[]; }

export default function LegalPage({ title, subtitle, updated, sections, badge }: {
  title: string; subtitle?: string; updated?: string; badge?: string; sections: Section[];
}) {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div style={{ background:"var(--dk)", padding:"48px 24px" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto" }}>
          {badge && (
            <div style={{ background:"var(--lm)", color:"var(--dk)", fontSize:"9px", fontWeight:900, padding:"5px 12px", borderRadius:"4px", letterSpacing:"1.5px", display:"inline-block", marginBottom:"14px" }}>
              {badge.toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize:"clamp(26px,5vw,42px)", fontWeight:900, letterSpacing:"-1.5px", color:"var(--wh)", lineHeight:1, marginBottom:"10px" }}>{title.toUpperCase()}</h1>
          {subtitle && <p style={{ fontSize:"13px", color:"#8F9CAE", fontWeight:500 }}>{subtitle}</p>}
          {updated && <p style={{ fontSize:"10px", color:"#627D98", fontWeight:700, marginTop:"8px", letterSpacing:"0.5px" }}>LAST UPDATED: {updated}</p>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"40px 24px", background:"var(--dk)" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"12px" }}>
          {sections.map((s, i) => (
            <div key={i} className="zcard">
              <h2 style={{ fontSize:"14px", fontWeight:900, letterSpacing:"-0.3px", color:"var(--wh)", marginBottom:"10px" }}>{s.title}</h2>
              {Array.isArray(s.body) ? (
                <ul style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {s.body.map((item, j) => (
                    <li key={j} style={{ fontSize:"13px", color:"#8F9CAE", lineHeight:1.7, fontWeight:500, display:"flex", gap:"8px", alignItems:"flex-start" }}>
                      <span style={{ color:"var(--or)", fontWeight:900, flexShrink:0 }}>→</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize:"13px", color:"#8F9CAE", lineHeight:1.8, fontWeight:500 }}>{s.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
