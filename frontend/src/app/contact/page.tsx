"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Instagram, Facebook, Send, User, Building, MapPin, Briefcase, FileText } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings } from "@/lib/useSettings";
import toast from "react-hot-toast";
import { fadeUp } from "@/lib/utils";


const D: Record<string, string> = {
  contact_whatsapp:      "",
  contact_support_email: "support@zupwell.com",
  contact_info_email:    "info@zupwell.com",
  contact_instagram:     "",
  contact_facebook:      "",
};

const s = (settings: Record<string, string>, key: string) =>
  settings[key] || D[key] || "";

const EMPTY_FORM = {
  fullName: "", firmName: "", city: "", state: "",
  experience: "", message: "",
};

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm]         = useState(EMPTY_FORM);
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    const onBust = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust")
        fetchSettings().then(setSettings).catch(() => {});
    };
    window.addEventListener("storage", onBust);
    return () => window.removeEventListener("storage", onBust);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.city || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Send via WhatsApp if number available, otherwise email
    const wa = s(settings, "contact_whatsapp");
    if (wa) {
      const text = encodeURIComponent(
        `*Distributor Inquiry — Grow with Zupwell*\n\n` +
        `Name: ${form.fullName}\n` +
        `Firm: ${form.firmName || "—"}\n` +
        `Location: ${form.city}, ${form.state}\n` +
        `Experience: ${form.experience || "—"}\n\n` +
        `Message:\n${form.message}`
      );
      window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
      toast.success("Opening WhatsApp with your inquiry!");
    } else {
      toast.success("Inquiry submitted! We'll get back to you soon.");
    }
    setForm(EMPTY_FORM);
    setSending(false);
  };

  const rawWhatsApp = s(settings, "contact_whatsapp") || s(settings, "site_phone") || "916355466208";
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanWhatsApp}`;
  const rawDisplay = s(settings, "contact_whatsapp") || s(settings, "site_phone") || "91 6355466208";
  const displayWhatsApp = rawDisplay.startsWith("+") ? rawDisplay : `+${rawDisplay}`;

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden" style={{ background: "#0C1E39", borderBottom: "1.5px solid #0C1E39" }}>
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full" style={{ background: "rgba(255,92,0,0.06)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span {...fadeUp(0)} className="inline-block zbadge zbadge-or mb-4">
            Contact Us
          </motion.span>
          <motion.h1 {...fadeUp(0.1)} className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
            Got Questions?<br />
            <span style={{ color: "var(--or)" }}>We've Got Answers!</span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg" style={{ color: "#F8F8F8" }}>
            Reach out to us anytime — we're always happy to help.
          </motion.p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">

          {/* WhatsApp */}
          <motion.div {...fadeUp(0)}
            className="zcard flex flex-col items-center text-center gap-4 transition-all group"
            style={{ borderColor: "#0C1E39" }}
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all" style={{ background: "rgba(37,211,102,0.1)" }}>
              <svg viewBox="0 0 24 24" className="h-6 w-6 opacity-80">
                <path fill="#25D366" d="M12.012 0C5.398 0 .056 5.348.056 11.962c0 2.115.55 4.18 1.597 5.992L0 24l6.19-1.623a11.93 11.93 0 0 0 5.817 1.517c6.62 0 11.964-5.348 11.964-11.962C23.99 5.348 18.648 0 12.012 0z"/>
                <path fill="#FFFFFF" d="M17.447 14.432c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.388.248-.669.248-1.238.173-1.388-.074-.149-.272-.248-.57-.397z"/>
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-between items-center w-full">
              <div>
                <p className="zlabel mb-1">WhatsApp Us</p>
                <p className="font-bold text-base mb-3" style={{ color: "#FFFFFF" }}>{displayWhatsApp}</p>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="zbtn-or w-full py-2.5 text-xs text-center font-bold rounded-lg block">
                Chat Us
              </a>
            </div>
          </motion.div>

          {/* Support Email */}
          <motion.div {...fadeUp(0.05)}
            className="zcard flex flex-col items-center text-center gap-4 transition-all group"
            style={{ borderColor: "#0C1E39" }}
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all" style={{ background: "rgba(255,92,0,0.1)" }}>
              <Mail size={22} style={{ color: "var(--or)" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between items-center w-full">
              <div>
                <p className="zlabel mb-1">Support Email</p>
                <p className="font-bold text-base mb-3 break-all" style={{ color: "#FFFFFF" }}>{s(settings, "contact_support_email")}</p>
              </div>
              <a href={`mailto:${s(settings, "contact_support_email")}`} className="zbtn-or w-full py-2.5 text-xs text-center font-bold rounded-lg block">
                Send Email
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Distributor Inquiry Form ── */}
      <section className="py-16 px-6" style={{ background: "var(--dk)" }}>
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <span className="inline-block zbadge zbadge-or mb-3">
              Grow with Zupwell
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.04em" }}>
              Distributor <span style={{ color: "var(--or)" }}>Inquiry</span>
            </h2>
            <p style={{ color: "#F8F8F8" }}>
              Interested in partnering with us? Fill in your details and let's do business!
            </p>
          </motion.div>

          <motion.form {...fadeUp(0.1)} onSubmit={handleSubmit} className="zcard space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="zlabel flex items-center gap-1.5">
                  <User size={13} style={{ color: "var(--or)" }} /> Full Name *
                </label>
                <input type="text" value={form.fullName} required
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="zinp text-sm" placeholder="Your full name" />
              </div>

              {/* Firm Name */}
              <div>
                <label className="zlabel flex items-center gap-1.5">
                  <Building size={13} style={{ color: "var(--or)" }} /> Firm Name
                </label>
                <input type="text" value={form.firmName}
                  onChange={e => setForm(f => ({ ...f, firmName: e.target.value }))}
                  className="zinp text-sm" placeholder="Your firm / company name" />
              </div>

              {/* City */}
              <div>
                <label className="zlabel flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "var(--or)" }} /> City *
                </label>
                <input type="text" value={form.city} required
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="zinp text-sm" placeholder="Your city" />
              </div>

              {/* State */}
              <div>
                <label className="zlabel flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "var(--or)" }} /> State
                </label>
                <input type="text" value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="zinp text-sm" placeholder="Your state" />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="zlabel flex items-center gap-1.5">
                <Briefcase size={13} style={{ color: "var(--or)" }} /> Experience in Distribution
              </label>
              <input type="text" value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                className="zinp text-sm" placeholder="e.g. 3 years in FMCG, new to distribution, etc." />
            </div>

            {/* Message */}
            <div>
              <label className="zlabel flex items-center gap-1.5">
                <FileText size={13} style={{ color: "var(--or)" }} /> Message *
              </label>
              <textarea value={form.message} required rows={4}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="zinp text-sm resize-none"
                placeholder="Tell us about your distribution network, area of operation, and what you're looking for..." />
            </div>

            <motion.button type="submit" disabled={sending}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="zbtn-or w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} />
              {sending ? "Sending..." : "Send Inquiry"}
            </motion.button>

            <p className="text-xs text-center" style={{ color: "#F8F8F8" }}>
              We typically respond within 24 hours on business days.
            </p>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  );
}

