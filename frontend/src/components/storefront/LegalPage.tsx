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
    <main className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      {/* Hero */}
      <div className="bg-white pt-28 pb-12 px-6 border-b border-[#D9DEE8]">
        <div className="mx-auto max-w-3xl">
          {badge && (
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#F47C41] mb-3">
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-display font-black text-[#111827] mb-3">{title}</h1>
          {subtitle && <p className="text-[#6B7280] mb-2">{subtitle}</p>}
          {updated && <p className="text-xs text-[#9CA3AF]">Last updated: {updated}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="card">
              <h2 className="font-display font-bold text-[#111827] mb-3 text-lg">{s.title}</h2>
              {Array.isArray(s.body) ? (
                <ul className="space-y-2">
                  {s.body.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#374151] leading-relaxed text-sm">
                      <span className="text-[#F47C41] mt-0.5 shrink-0">→</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#374151] leading-relaxed text-sm">{s.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}