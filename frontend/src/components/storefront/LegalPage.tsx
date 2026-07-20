"use client";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

interface Section { title: string; body: string | string[]; }

export default function LegalPage({
  title, subtitle, updated, sections, badge,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  badge?: string;
  sections: Section[];
}) {
  return (
    <main className="min-h-screen" style={{ background: "var(--gy)" }}>
      <Navbar />

      {/* Hero */}
      <div
        className="pt-32 pb-12 px-6"
        style={{ background: "#0C1E39", borderBottom: "1.5px solid #051124" }}
      >
        <div className="mx-auto max-w-3xl">
          {badge && (
            <span
              className="inline-block text-xs font-black uppercase tracking-widest mb-3"
              style={{ color: "var(--or)", letterSpacing: "1.2px" }}
            >
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
            {title}
          </h1>
          {subtitle && <p className="mb-2 text-sm whitespace-pre-line" style={{ color: "#F8F8F8", opacity: 0.85 }}>{subtitle}</p>}
          {updated && <p className="text-xs" style={{ color: "#F8F8F8", opacity: 0.65 }}>{updated}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="zcard" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
              <h2 className="font-black mb-3 text-lg" style={{ color: "#0C1E39", letterSpacing: "-0.03em" }}>{s.title}</h2>
              {Array.isArray(s.body) ? (
                <ul className="space-y-2">
                  {s.body.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 leading-relaxed text-sm" style={{ color: "#4A5568" }}>
                      <span style={{ color: "var(--or)", marginTop: "2px", flexShrink: 0 }}>→</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="leading-relaxed text-sm whitespace-pre-line" style={{ color: "#4A5568" }}>{s.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
