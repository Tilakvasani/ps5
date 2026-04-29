"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>);
const FacebookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const YoutubeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>);

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

  return (
    <footer className="bg-[#F4F6FA] border-t border-[#D9DEE8]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-2xl font-display font-black gradient-text block mb-3">{name}™</span>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
              Premium health supplements — science-backed, delicious, and made for the modern lifestyle.
            </p>
            <div className="text-xs text-[#9CA3AF] space-y-1 mb-4">
              {gstin  && <p>GSTIN: {gstin}</p>}
              {fssai  && <p>FSSAI: {fssai}</p>}
              <p>State Code: {stateCode}</p>
            </div>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ href, icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-xl bg-white border border-[#D9DEE8] flex items-center justify-center text-[#6B7280] hover:text-[#F47C41] hover:border-[#F47C41]/30 transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-[#6B7280]">
              <li><Link href="/"         className="hover:text-[#F47C41] transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-[#F47C41] transition-colors">Shop / Products</Link></li>
              <li><Link href="/about"    className="hover:text-[#F47C41] transition-colors">About Us</Link></li>
              <li><Link href="/faqs"     className="hover:text-[#F47C41] transition-colors">FAQs</Link></li>
              <li><Link href="/contact"  className="hover:text-[#F47C41] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-[#6B7280]">
              <li><Link href="/privacy-policy"   className="hover:text-[#F47C41] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#F47C41] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy"    className="hover:text-[#F47C41] transition-colors">Refund & Cancellation</Link></li>
              <li><Link href="/shipping-policy"  className="hover:text-[#F47C41] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/legal-disclaimer" className="hover:text-[#F47C41] transition-colors">Legal Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3 text-sm text-[#6B7280]">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#F47C41]" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-[#F47C41]" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-[#F47C41]" />
                <span>{email}</span>
              </div>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-500 hover:text-green-600 font-semibold transition-colors">
                  <MessageCircle size={14} />
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#D9DEE8] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9CA3AF]">
            © {new Date().getFullYear()} {name}™. All rights reserved.
            {fssai && <span className="ml-2">· FSSAI: {fssai}</span>}
          </p>
          <p className="text-xs text-[#9CA3AF]">
            This product is a health supplement and not for medicinal use.
          </p>
        </div>
      </div>
    </footer>
  );
}