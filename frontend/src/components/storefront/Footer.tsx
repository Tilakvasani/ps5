"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CertLogo } from "@/components/storefront/CertLogos";
import { API_URL } from "@/lib/api";

const InstagramIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>);
const FacebookIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
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
    { href: s.social_instagram, icon: <InstagramIcon />, label: "Instagram" },
    { href: s.social_facebook,  icon: <FacebookIcon />,  label: "Facebook" },
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
    color: "#F8F8F8",
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
            <p style={{ color: "#F8F8F8", opacity: 0.8, fontSize: "12px", lineHeight: 1.7, marginBottom: "14px" }}>
              Performance-Driven Nutrition — Science-backed, insanely delicious, and tailored for your 24/7 lifestyle.
            </p>
            <div style={{ fontSize: "10px", lineHeight: 1.8, color: "#6B7280", marginBottom: "14px" }}>
              {gstin  && <p>GSTIN: {gstin}</p>}
              {fssai  && <p>FSSAI: {fssai}</p>}
            </div>
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: "#0C1E39",
                      border: "1.5px solid #0C1E39",
                      color: "#F8F8F8",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--or)";
                      e.currentTarget.style.color = "var(--or)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#0C1E39";
                      e.currentTarget.style.color = "#F8F8F8";
                    }}
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
            <div style={{ fontSize: "11px", color: "#F8F8F8", opacity: 0.8, display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  className="flex items-center gap-2 font-bold transition-colors"
                  style={{ color: "var(--or)" }}
                >
                  <MessageCircle size={13} /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Certification Logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 pb-6" style={{ borderBottom: "1px solid #0C1E39", marginBottom: "20px" }}>
          {certEntries.map(({ key, label }) => {
            const val = s[key];
            const isIso = label.toUpperCase().includes("ISO");
            const isGst = label.toUpperCase().includes("GST");
            const isIec = label.toUpperCase().includes("IEC");
            const isMsme = label.toUpperCase().includes("MSME");
            const isTm = label.toUpperCase().includes("TM");

            if (val) {
              // ISO and MSME need a white circular background to look clean on dark footer
              if (isIso || isMsme) {
                return (
                  <div
                    key={key}
                    className="inline-flex items-center justify-center shrink-0 rounded-full"
                    style={{ background: "#FFFFFF", width: "40px", height: "40px", padding: "2px" }}
                  >
                    <img src={val} alt={label} className="w-full h-full object-contain rounded-full" />
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
                    <img src={val} alt={label} className={`w-full h-full object-contain rounded-full ${scaleClass}`} />
                  </div>
                );
              }
              return (
                <img key={key} src={val} alt={label} className="h-10 object-contain opacity-100 transition-opacity" />
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
          
          {/* RazorPay Payment Gateway Symbol */}
          <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Secured by</span>
            <div style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', height: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img src="/razorpay.png" alt="Razorpay" className="h-4 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
