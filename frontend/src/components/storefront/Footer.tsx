import Link from "next/link";
import { Package, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#1C1C1E", borderTop: "1px solid rgba(240,242,245,0.1)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FF8A00, #1A4B9F)" }}>
                <Package size={18} className="text-white" />
              </div>
              <span className="text-xl font-display font-black" style={{ color: "#F0F2F5" }}>
                Zup<span style={{ color: "#FF8A00" }}>well</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(240,242,245,0.5)" }}>
              Premium B2B/B2C packaging materials supplier based in Ahmedabad, Gujarat. GST compliant.
            </p>
            <div className="text-xs space-y-1" style={{ color: "rgba(240,242,245,0.3)" }}>
              <p>GSTIN: 24XXXXXXXXXXXXX</p>
              <p>State Code: 24 (Gujarat)</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">Products</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(240,242,245,0.5)" }}>
              {["BOPP Tape", "Packaging Materials", "Industrial Supplies", "Bubble Wrap", "Stretch Film"].map(p => (
                <li key={p}>
                  <Link href="/products"
                    className="transition-colors hover:text-[#FF8A00]">{p}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(240,242,245,0.5)" }}>
              {[["About Us", "#"], ["Contact", "#"], ["Bulk Orders", "#"], ["Careers", "#"]].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-[#FF8A00]">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3 text-sm" style={{ color: "rgba(240,242,245,0.5)" }}>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8A00" }} />
                <span>A-102, Adarsh Lifestyle, New India Colony Road, Ahmedabad, Gujarat 382350</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" style={{ color: "#FF8A00" }} />
                <span>+91 9999999999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" style={{ color: "#FF8A00" }} />
                <span>info@zupwell.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar - silver strip */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(240,242,245,0.1)" }}
        >
          <p className="text-sm" style={{ color: "rgba(240,242,245,0.3)" }}>
            © {new Date().getFullYear()} Zupwell. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: "rgba(240,242,245,0.3)" }}>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}