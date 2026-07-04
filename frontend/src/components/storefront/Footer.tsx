"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Footer() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/settings`).then(r => r.json()).then(setS).catch(() => {});
  }, []);

  const name    = s.site_name    || "Zupwell";
  const email   = s.site_email   || "hello@zupwell.com";
  const phone   = s.site_phone   || "+91 98765 43210";
  const address = s.site_address || "Ahmedabad, Gujarat, India";
  const gstin   = s.site_gstin   || "";
  const fssai   = s.site_fssai   || "";
  const wa      = s.contact_whatsapp || "";

  const navLinks = [["HOME","/"],["SHOP","/products"],["SCIENCE","/science"],["ABOUT","/about"],["FAQS","/faqs"],["CONTACT","/contact"]];
  const legalLinks = [["PRIVACY POLICY","/privacy-policy"],["TERMS & CONDITIONS","/terms-of-service"],["REFUND POLICY","/refund-policy"],["SHIPPING POLICY","/shipping-policy"]];

  const lnkStyle = { fontSize: "11px", fontWeight: 700, color: "#8f9cae", letterSpacing: "0.3px", textDecoration: "none", display: "block", padding: "4px 0", transition: "color 0.12s" };

  return (
    <footer style={{ background: "var(--dk)", borderTop: "1.5px solid #1E2D4A", marginTop: "auto" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "32px", marginBottom: "32px" }}>

          {/* Brand */}
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-1.5px", color: "#FFF", marginBottom: "10px", display: "flex", alignItems: "center" }}>
              zupwell<span style={{ color: "var(--or)" }}>•</span>
            </div>
            <p style={{ fontSize: "12px", color: "#8F9CAE", lineHeight: 1.7, marginBottom: "12px", fontWeight: 500 }}>
              Honest nutrition for people who take their health seriously. Clean ingredients, transparent labels, real results.
            </p>
            {(gstin || fssai) && (
              <div style={{ fontSize: "10px", color: "#8f9cae", fontWeight: 700, lineHeight: 1.8, marginBottom: "14px" }}>
                {gstin && <div>GSTIN: {gstin}</div>}
                {fssai && <div>FSSAI: {fssai}</div>}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              {[["IG","https://instagram.com"],["TT","https://tiktok.com"],["YT","https://youtube.com"]].map(([l,h]) => (
                <a key={l} href={s[`social_${l.toLowerCase()}`] || h} target="_blank" rel="noopener noreferrer"
                  style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--dk-card)", border: "1px solid var(--bd-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900, color: "#8F9CAE", textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.5px", color: "#627D98", marginBottom: "14px" }}>QUICK LINKS</div>
            {navLinks.map(([l, h]) => (
              <Link key={l} href={h} style={lnkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--or)")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8f9cae")}>{l}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.5px", color: "#627D98", marginBottom: "14px" }}>LEGAL</div>
            {legalLinks.map(([l, h]) => (
              <Link key={l} href={h} style={lnkStyle}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--or)")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8f9cae")}>{l}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "1.5px", color: "#627D98", marginBottom: "14px" }}>CONTACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <MapPin size={13} color="var(--or)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: "11px", color: "#8F9CAE", fontWeight: 500 }}>{address}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Phone size={13} color="var(--or)" />
                <span style={{ fontSize: "11px", color: "#8F9CAE", fontWeight: 500 }}>{phone}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Mail size={13} color="var(--or)" />
                <span style={{ fontSize: "11px", color: "#8F9CAE", fontWeight: 500 }}>{email}</span>
              </div>
              {wa && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "11px", fontWeight: 700, color: "var(--or)", textDecoration: "none" }}>
                  <MessageCircle size={13} /> WHATSAPP US
                </a>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--bd-soft)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#627D98" }}>
            © {new Date().getFullYear()} {name.toUpperCase()}. ALL RIGHTS RESERVED.
          </div>
          <div style={{ fontSize: "10px", color: "#627D98", fontWeight: 600 }}>
            MADE IN INDIA · FOR PEOPLE WHO ACTUALLY TRY.
          </div>
        </div>
      </div>
    </footer>
  );
}
