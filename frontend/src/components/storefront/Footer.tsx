import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#F4F6FA", borderTop: "1px solid #D9DEE8" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-display font-black" style={{
                background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Zupwell
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
              Premium B2B/B2C packaging materials supplier based in Ahmedabad, Gujarat. GST compliant.
            </p>
            <div className="text-xs space-y-1" style={{ color: "#6B7280" }}>
              <p>GSTIN: 24XXXXXXXXXXXXX</p>
              <p>State Code: 24 (Gujarat)</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Products</h4>
            <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              {["BOPP Tape", "Packaging Materials", "Industrial Supplies", "Bubble Wrap", "Stretch Film"].map(p => (
                <li key={p}>
                  <Link href="/products"
                    className="transition-colors hover:text-[#F47C41]">{p}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
              {[["About Us", "#"], ["Contact", "#"], ["Bulk Orders", "#"], ["Careers", "#"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-[#F47C41]">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-[#111827] mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3 text-sm" style={{ color: "#6B7280" }}>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>A-102, Adarsh Lifestyle, New India Colony Road, Ahmedabad, Gujarat 382350</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>+91 9999999999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" style={{ color: "#F47C41" }} />
                <span>info@zupwell.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar - silver strip */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(11,44,111,0.06)" }}
        >
          <p className="text-sm" style={{ color: "#6B7280" }}>
            © {new Date().getFullYear()} Zupwell. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: "#6B7280" }}>
            <Link href="#" className="hover:text-[#0B2C6F] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#0B2C6F] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#0B2C6F] transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}