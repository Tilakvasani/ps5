"use client";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CertLogo } from "@/components/storefront/CertLogos";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

export default function CertificationsPage() {
  const { raw: settingsRaw } = useSettings();
  
  let certs = [];
  try {
    const parsed = JSON.parse(settingsRaw["certifications_list_json"] || "");
    if (Array.isArray(parsed) && parsed.length > 0) {
      certs = parsed;
    }
  } catch (e) {}

  if (certs.length === 0) {
    certs = [
      {
        label: "FSSAI",
        title: "Food Safety and Standards Authority of India",
        desc: "Licensed under FSSAI regulations. This ensures our manufacturing practices, ingredient safety, and packaging standards comply fully with national food safety guidelines.",
        fileUrl: "/fssai.png",
      },
      {
        label: "GMP",
        title: "Good Manufacturing Practices",
        desc: "WHO-GMP compliant manufacturing processes. This guarantees that all products are consistently produced and controlled according to international quality standards.",
        fileUrl: "/gmp.png",
      },
      {
        label: "ISO",
        title: "ISO 9001:2015 Certification",
        desc: "ISO 9001:2015 Certified facility. We adhere to rigorous quality management system (QMS) protocols, ensuring safety, reliability, and continuous improvement across all stages of production.",
        fileUrl: "/iso.png",
      },
      {
        label: "HACCP",
        title: "Hazard Analysis Critical Control Point",
        desc: "HACCP Certified system. A systematic preventive approach to food safety from biological, chemical, and physical hazards in production processes.",
        fileUrl: "/haccp.png",
      },
    ];
  }

  return (
    <main className="min-h-screen flex flex-col justify-between" style={{ background: "var(--gy)" }}>
      <div>
        <Navbar />

        <div className="pt-32 pb-20 px-6 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block zbadge zbadge-or mb-4" style={{ fontSize: "10px", letterSpacing: "1.2px" }}>
              🛡️ VERIFIED QUALITY
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight text-[#0C1E39]" style={{ letterSpacing: "-0.04em" }}>
              {settingsRaw["cert_page_title"] || "Our Certifications Reflecting Quality You Can Trust"}
            </h1>
            <p className="text-sm max-w-xl mx-auto leading-relaxed text-[#4A5568] font-semibold">
              {settingsRaw["cert_page_subtitle"] || "Backed by FSSAI & Government Certifications for Uncompromised Quality and Safety."}
            </p>
          </div>

          <div className="space-y-6">
            {certs.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="zcard flex flex-col md:flex-row items-start gap-6 p-8"
                style={{ boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}
              >
                <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-[#F8F8F8] border border-[#0C1E39]/10" style={{ minWidth: 80, height: 80 }}>
                  <CertLogo label={c.label} className="h-12 object-contain" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold mb-2 text-[#0C1E39] flex items-center gap-2">
                    {c.label} <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-500/10 text-[var(--or)]">CERTIFIED</span>
                  </h3>
                  <p className="font-semibold text-sm mb-2" style={{ color: "#4A5568" }}>{c.title}</p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>{c.desc}</p>
                  {c.fileUrl && (
                    <div className="pt-3 border-t border-dashed border-[#0C1E39]/10 flex items-center gap-3">
                      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--or)] hover:underline border border-[var(--or)]/30 px-3.5 py-1.5 rounded-xl transition-all"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,92,0,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        📄 View Official Document
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-3xl text-center border border-dashed border-[#FF5C00]/30" style={{ background: "rgba(255, 92, 0, 0.03)" }}>
            <h3 className="text-lg font-bold mb-2 text-[#0C1E39] flex items-center justify-center gap-2">
              <ShieldCheck size={20} className="text-[var(--or)]" /> Quality & Safety Commitment
            </h3>
            <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A5568" }}>
              Every single batch of Zupwell tablets undergoes strict internal laboratory testing and independent third-party microbiological validation before releasing to the market. We guarantee 100% authenticity and safety.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
