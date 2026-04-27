"use client";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(r => r.json())
      .then(data => setS(data))
      .catch(() => {});
  }, []);

  const name      = s.site_name       || "Zupwell";
  const email     = s.site_email      || "info@zupwell.com";
  const phone     = s.site_phone      || "+91 6355466208";
  const address   = s.site_address    || "A-102, Adarsh Lifestyle, New India Colony, Ahmedabad, Gujarat 382350";
  const gstin     = s.site_gstin      || "24XXXXXXXXXXXXX";
  const stateCode = s.site_state_code || "24 (Gujarat)";

  const socials = [
    { href: s.social_instagram || "https://instagram.com", icon: <InstagramIcon />, label: "Instagram" },
    { href: s.social_facebook  || "https://facebook.com",  icon: <FacebookIcon />,  label: "Facebook" },
    { href: s.social_youtube   || "https://youtube.com",   icon: <YoutubeIcon />,   label: "YouTube" },
    { href: s.social_linkedin  || "https://linkedin.com",  icon: <LinkedInIcon />,  label: "LinkedIn" },
    { href: s.social_x         || "https://x.com",         icon: <XIcon />,         label: "X" },
  ];

  return (
    <footer style={{ background: "#F4F6FA", borderTop: "1px solid #D9DEE8" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-display font-black inline-flex items-start" style={{
                background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {name}
                <sup style={{ fontSize: "0.45em", fontWeight: 700, lineHeight: 1, marginTop: "2px", background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>™</sup>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
              Premium health supplements and wellness products. GST compliant. Based in Ahmedabad, Gujarat.
            </p>
            <div className="text-xs space-y-1 mb-5" style={{ color: "#6B7280" }}>
              <p>GSTIN: {gstin}</p>
              <p>State Code: {stateCode}</p>
            </div>

            {/* Social icons WITH names side by side */}
            <div className="flex flex-col gap-2">
              {socials.map(({ href, icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm transition-colors group w-fit"
                  style={{ color: "#6B7280" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#F47C41"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B7280"}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    style={{ background: "#E5E7EB" }}>
                    {icon}
                  </span>
                  <span className="font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Follow Us</h4>
            <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="transition-colors hover:text-[#F47C41]">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              <li><Link href="/about"         className="transition-colors hover:text-[#F47C41]">About Us</Link></li>
              <li><Link href="/contact"       className="transition-colors hover:text-[#F47C41]">Contact</Link></li>
              <li><Link href="/products"      className="transition-colors hover:text-[#F47C41]">All Products</Link></li>
              <li><Link href="/refund-policy" className="transition-colors hover:text-[#F47C41]">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3 text-sm" style={{ color: "#6B7280" }}>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(11,44,111,0.06)" }}>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            © {new Date().getFullYear()} {name}™. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: "#6B7280" }}>
            <Link href="/privacy-policy"   className="hover:text-[#0B2C6F] transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-[#0B2C6F] transition-colors">Terms of Service</Link>
            <Link href="/shipping-policy"  className="hover:text-[#0B2C6F] transition-colors">Shipping Policy</Link>
            <Link href="/refund-policy"    className="hover:text-[#0B2C6F] transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
