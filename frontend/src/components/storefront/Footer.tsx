"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>);
const FacebookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const YoutubeIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>);

export default function Footer() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => setS(data))
      .catch(() => {});
  }, []);

  const name      = s.site_name        || "Zupwell";
  const email     = s.site_email       || "info@zupwell.com";
  const phone     = s.site_phone       || "+91 6355466208";
  const address   = s.site_address     || "Ahmedabad, Gujarat";
  const gstin     = s.site_gstin       || "";
  const stateCode = s.site_state_code  || "24 (Gujarat)";
  const fssai     = s.site_fssai       || "";
  const whatsapp  = s.contact_whatsapp || "";

  const socials = [
    { href: s.social_instagram, icon: <InstagramIcon />, label: "Instagram" },
    { href: s.social_facebook,  icon: <FacebookIcon />,  label: "Facebook" },
    { href: s.social_youtube,   icon: <YoutubeIcon />,   label: "YouTube" },
  ].filter(s => s.href);

  const linkStyle = {
    color: "#45353E",
    fontSize: "14px",
    transition: "color 0.15s",
  };

  return (
    <footer style={{ background: "#FFFFFF", borderTop: "1.5px solid #E8E2D9" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-xl font-bold mb-3" style={{ color: "#002A30", letterSpacing: "-0.03em" }}>
              {name}<sup style={{ fontSize: "0.55em", fontWeight: 700, color: "#EB9220", marginLeft: "2px", verticalAlign: "super" }}>™</sup>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#45353E" }}>
              Performance-Driven Nutrition — Science-backed, insanely delicious, and tailored for your 24/7 lifestyle.
            </p>
            <div className="text-xs space-y-1 mb-5" style={{ color: "#8C8276" }}>
              {gstin  && <p>GSTIN: {gstin}</p>}
              {fssai  && <p>FSSAI: {fssai}</p>}
              <p>State Code: {stateCode}</p>
            </div>
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map(({ href, icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-150"
                    style={{ background: "#FCFAF6", border: "1.5px solid #E8E2D9", color: "#45353E" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#EB9220"; e.currentTarget.style.color = "#EB9220"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E2D9"; e.currentTarget.style.color = "#45353E"; }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#002A30", letterSpacing: "0.12em" }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[["Home","/"],["Shop / Products","/products"],["Science / Quality","/science"],["About Us","/about"],["FAQs","/faqs"],["Contact Us","/contact"]].map(([l,h]) => (
                <li key={l}>
                  <Link href={h} style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EB9220")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#45353E")}
                  >{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#002A30", letterSpacing: "0.12em" }}>Legal</h4>
            <ul className="space-y-2.5">
              {[["Privacy Policy","/privacy-policy"],["Terms & Conditions","/terms-of-service"],["Refund & Cancellation","/refund-policy"],["Shipping Policy","/shipping-policy"],["Legal Disclaimer","/legal-disclaimer"]].map(([l,h]) => (
                <li key={l}>
                  <Link href={h} style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EB9220")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#45353E")}
                  >{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#002A30", letterSpacing: "0.12em" }}>Contact Us</h4>
            <div className="space-y-3 text-sm" style={{ color: "#45353E" }}>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "#EB9220" }} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0" style={{ color: "#EB9220" }} />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0" style={{ color: "#EB9220" }} />
                <span>{email}</span>
              </div>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-semibold transition-colors duration-150"
                  style={{ color: "#EB9220" }}
                >
                  <MessageCircle size={14} /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1.5px solid #E8E2D9" }}>
          <p className="text-sm" style={{ color: "#8C8276" }}>
            © {new Date().getFullYear()} {name}™. All rights reserved.
            {fssai && <span className="ml-2">· FSSAI: {fssai}</span>}
          </p>
          <p className="text-xs" style={{ color: "#8C8276" }}>
            This product is a health supplement and not for medicinal use.
          </p>
        </div>
      </div>
    </footer>
  );
}
