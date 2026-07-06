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
    <main className="min-h-screen" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* Hero */}
      <div
        className="pt-32 pb-12 px-6"
        style={{ background: "#0C1E3E", borderBottom: "1.5px solid #1E2D4A" }}
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
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>
            {title}
          </h1>
          {subtitle && <p className="mb-2" style={{ color: "#8F9CAE" }}>{subtitle}</p>}
          {updated && <p className="text-xs" style={{ color: "#627d98" }}>Last updated: {updated}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="zcard">
              <h2 className="font-black mb-3 text-lg" style={{ color: "#627d98", letterSpacing: "-0.03em" }}>{s.title}</h2>
              {Array.isArray(s.body) ? (
                <ul className="space-y-2">
                  {s.body.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 leading-relaxed text-sm" style={{ color: "#8F9CAE" }}>
                      <span style={{ color: "var(--or)", marginTop: "2px", flexShrink: 0 }}>→</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="leading-relaxed text-sm" style={{ color: "#8F9CAE" }}>{s.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
