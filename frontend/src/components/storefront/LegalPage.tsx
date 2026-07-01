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
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />

      {/* Hero */}
      <div className="bg-white pt-28 pb-12 px-6 border-b border-[#E8E2D9]">
        <div className="mx-auto max-w-3xl">
          {badge && (
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#EB9220] mb-3">
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1B3D] mb-3">{title}</h1>
          {subtitle && <p className="text-[#45353E] mb-2">{subtitle}</p>}
          {updated && <p className="text-xs text-[#8C8276]">Last updated: {updated}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="card">
              <h2 className="font-bold text-[#0B1B3D] mb-3 text-lg">{s.title}</h2>
              {Array.isArray(s.body) ? (
                <ul className="space-y-2">
                  {s.body.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#45353E] leading-relaxed text-sm">
                      <span className="text-[#EB9220] mt-0.5 shrink-0">→</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#45353E] leading-relaxed text-sm">{s.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
