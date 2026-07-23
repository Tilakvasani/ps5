"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CertLogo } from "@/components/storefront/CertLogos";
import { API_URL } from "@/lib/api";
import { cldOptimize } from "@/lib/utils";

const InstagramIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-grad1" cx="30%" cy="107%" r="120%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="10%" stopColor="#fdf497"/>
        <stop offset="50%" stopColor="#fd5949"/>
        <stop offset="68%" stopColor="#d6249f"/>
        <stop offset="100%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#ig-grad1)"/>
    <circle cx="16" cy="16" r="5.5" stroke="white" strokeWidth="2.2" fill="none"/>
    <circle cx="22.5" cy="9.5" r="1.5" fill="white"/>
    <rect x="4" y="4" width="24" height="24" rx="7" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#1877F2"/>
    <path d="M20.5 10h-2.2c-.9 0-1.1.4-1.1 1.1V13H20.5l-.4 3H17.2v8H14v-8h-2v-3h2v-2.2C14 8.5 15.4 7 18.1 7c1.2 0 2.4.1 3.6.3L20.5 10z" fill="white"/>
  </svg>
);

const YoutubeIcon  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>);
const LinkedinIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);

export default function Footer() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => setS(data))
      .catch(() => {});
  }, []);

  const name      = s.site_name        || "Zupwell";
  const email     = s.site_email       || "support@zupwell.com";
  const phone     = s.site_phone       || "+91 6355466208";
  const address   = s.site_address     || "Ahmedabad, Gujarat";
  const gstin     = s.site_gstin       || "";
  const stateCode = s.site_state_code  || "24 (Gujarat)";
  const fssai     = s.site_fssai       || "";
  const whatsapp  = s.contact_whatsapp || "";

  const certEntries = [
    { key: "cert_fssai_logo", label: "FSSAI" },
    { key: "cert_iso_logo",   label: "ISO" },
    { key: "cert_gmp_logo",   label: "GMP" },
    { key: "cert_haccp_logo", label: "HACCP" },
    { key: "cert_gst_logo",   label: "GST" },
    { key: "cert_iec_logo",   label: "IEC" },
    { key: "cert_msme_logo",  label: "MSME" },
    { key: "cert_tm_logo",    label: "TM" },
  ];

  const socials = [
    { href: s.social_instagram || "https://www.instagram.com/zupwellnutrition?igsh=MWNvNGZ5ZnQwdmVpaA==", icon: <InstagramIcon />, label: "Instagram" },
    { href: s.social_facebook || "https://www.facebook.com/share/19Djdz9XGD/",  icon: <FacebookIcon />,  label: "Facebook" },
  ].filter(s => s.href);

  const colHeadStyle = {
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.2px",
    color: "#FFFFFF",
    textTransform: "uppercase" as const,
    marginBottom: "16px",
    display: "block",
  };

  const linkStyle: React.CSSProperties = {
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 700,
    transition: "color 0.15s",
    display: "block",
    marginBottom: "8px",
    textDecoration: "none",
  };

  return (
    <footer style={{ background: "var(--dk)", borderTop: "1.5px solid #0C1E39" }}>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                color: "#FFFFFF",
                marginBottom: "10px",
              }}
            >
              Zupwell<sup style={{ fontSize: "10px", fontWeight: 700, color: "#FF5C00", marginLeft: "2.5px", letterSpacing: "1px", verticalAlign: "super" }}>TM</sup>
            </div>
            <p style={{ color: "#FFFFFF", fontSize: "12px", lineHeight: 1.7, marginBottom: "14px" }}>
              Performance Driven Nutrition.<br />
              Science backed, insanely delicious, and tailored for your 24/7 lifestyle.
            </p>
            <div style={{ fontSize: "10px", lineHeight: 1.8, color: "#6B7280", marginBottom: "14px" }}>
              {gstin  && <p>GSTIN: {gstin}</p>}
              {fssai  && <p>FSSAI: {fssai}</p>}
            </div>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="transition-all hover:scale-110 hover:opacity-90"
                    style={{ display: "inline-flex" }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <span style={colHeadStyle}>Quick Links</span>
            {[["Home","/"],["Shop / Products","/products"],["Science / Quality","/science"],["Certifications","/certifications"],["Track Order","/track-order"],["About Us","/about"],["FAQs","/faqs"],["Contact Us","/contact"]].map(([l, h]) => (
              <Link
                key={l}
                href={h}
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--or)")}
                onMouseLeave={e => (e.currentTarget.style.color = "#F8F8F8")}
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <span style={colHeadStyle}>Legal</span>
            {[
              ["Privacy Policy","/privacy-policy"],
              ["Terms & Conditions","/terms-of-service"],
              ["Refund & Cancellation","/refund-policy"],
              ["Shipping Policy","/shipping-policy"],
              ["Legal Disclaimer","/legal-disclaimer"],
            ].map(([l, h]) => (
              <Link
                key={l}
                href={h}
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--or)")}
                onMouseLeave={e => (e.currentTarget.style.color = "#F8F8F8")}
              >
                {l}
              </Link>
            ))}

          </div>

          {/* Contact */}
          <div>
            <span style={colHeadStyle}>Contact Us</span>
            <div style={{ fontSize: "11px", color: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="flex items-start gap-2">
                <MapPin size={13} style={{ color: "var(--or)", marginTop: 2, flexShrink: 0 }} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} style={{ color: "var(--or)", flexShrink: 0 }} />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} style={{ color: "var(--or)", flexShrink: 0 }} />
                <span>{email}</span>
              </div>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-bold transition-colors hover:opacity-80"
                  style={{ color: "#FFFFFF" }}
                >
                  <MessageCircle size={13} style={{ color: "var(--or)" }} /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Certification Logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 pb-6" style={{ borderBottom: "1px solid #0C1E39", marginBottom: "20px" }}>
          {certEntries.map(({ key, label }) => {
            const val = s[key];
            const isFssai = label.toUpperCase().includes("FSSAI");
            const isIso = label.toUpperCase().includes("ISO");
            const isGst = label.toUpperCase().includes("GST");
            const isIec = label.toUpperCase().includes("IEC");
            const isMsme = label.toUpperCase().includes("MSME");
            const isTm = label.toUpperCase().includes("TM");

            if (val) {
              // FSSAI needs a white pill background to look clean on dark footer
              if (isFssai) {
                return (
                  <div
                    key={key}
                    className="inline-flex items-center justify-center shrink-0 rounded-lg px-2.5 py-1 h-9"
                    style={{ background: "#FFFFFF" }}
                  >
                    <img src={cldOptimize(val, 80)} alt={label} className="h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                );
              }
              // ISO and MSME need a white circular background to look clean on dark footer
              if (isIso || isMsme) {
                return (
                  <div
                    key={key}
                    className="inline-flex items-center justify-center shrink-0 rounded-full"
                    style={{ background: "#FFFFFF", width: "40px", height: "40px", padding: "2px" }}
                  >
                    <img src={cldOptimize(val, 80)} alt={label} width={80} height={80} className="w-full h-full object-contain rounded-full"  loading="lazy" decoding="async" />
                  </div>
                );
              }
              // GST, IEC and TM already have complete circular layouts, so render with CSS scale crop to remove outer margins/checkers
              if (isGst || isIec || isTm) {
                const scaleClass = isGst ? "scale-[1.12]" : "scale-[1.08]";
                return (
                  <div
                    key={key}
                    className="inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden relative"
                    style={{ background: "#FFFFFF", width: "40px", height: "40px" }}
                  >
                    <img src={cldOptimize(val, 80)} alt={label} width={80} height={80} className={`w-full h-full object-contain rounded-full ${scaleClass}`}  loading="lazy" decoding="async" />
                  </div>
                );
              }
              return (
                <img key={key} src={cldOptimize(val, 80)} alt={label} width={80} height={80} className="h-10 object-contain opacity-100 transition-opacity"  loading="lazy" decoding="async" />
              );
            }

            if (isFssai) {
              return (
                <div
                  key={key}
                  className="inline-flex items-center justify-center shrink-0 rounded-lg px-2.5 py-1 h-9"
                  style={{ background: "#FFFFFF" }}
                >
                  <CertLogo label={label} className="h-full opacity-100 transition-opacity" />
                </div>
              );
            }

            return (
              <CertLogo key={key} label={label} className="h-10 opacity-100 transition-opacity" />
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p style={{ fontSize: "11px", color: "#6B7280" }}>
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
            <p style={{ fontSize: "10px", color: "#6B7280" }}>
              This product is a health supplement and not for medicinal use.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Powered by GLOBENT Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Powered by</span>
              <div style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', height: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#0C1E39', letterSpacing: '1px', fontFamily: 'sans-serif' }}>GLOBENT</span>
              </div>
            </div>

            {/* RazorPay Payment Gateway Symbol */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Secured by</span>
              <div style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', height: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img src="/razorpay.png" alt="Razorpay" width={60} height={16} className="h-4 w-auto object-contain"  loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
