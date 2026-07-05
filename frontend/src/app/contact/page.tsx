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

  const whatsappLink = s(settings, "contact_whatsapp")
    ? `https://wa.me/${s(settings, "contact_whatsapp")}`
    : null;

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--dk)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden" style={{ background: "#0C1E3E", borderBottom: "1.5px solid #1E2D4A" }}>
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full" style={{ background: "rgba(255,92,0,0.06)" }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span {...fadeUp(0)} className="inline-block zbadge zbadge-or mb-4">
            Contact Us
          </motion.span>
          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>
            Got Questions?<br />
            <span style={{ color: "var(--or)" }}>We've Got Answers!</span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg" style={{ color: "#8F9CAE" }}>
            Reach out to us anytime — we're always happy to help.
          </motion.p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* WhatsApp */}
          {whatsappLink && (
            <motion.a {...fadeUp(0)} href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="zcard flex flex-col items-center text-center gap-3 transition-all group cursor-pointer"
              style={{ borderColor: "#1E2D4A" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--or)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2D4A"; }}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all" style={{ background: "rgba(37,211,102,0.1)" }}>
                <MessageCircle size={22} style={{ color: "#25D366" }} />
              </div>
              <div>
                <p className="zlabel mb-1">WhatsApp</p>
                <p className="font-bold text-sm" style={{ color: "#FFFFFF" }}>+{s(settings, "contact_whatsapp")}</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: "var(--or)" }}>Chat now →</p>
              </div>
            </motion.a>
          )}

          {/* Support Email */}
          <motion.a {...fadeUp(0.05)} href={`mailto:${s(settings, "contact_support_email")}`}
            className="zcard flex flex-col items-center text-center gap-3 transition-all group cursor-pointer"
            style={{ borderColor: "#1E2D4A" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--or)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2D4A"; }}
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all" style={{ background: "rgba(255,92,0,0.1)" }}>
              <Mail size={22} style={{ color: "var(--or)" }} />
            </div>
            <div>
              <p className="zlabel mb-1">Support Email</p>
              <p className="font-bold text-sm break-all" style={{ color: "#FFFFFF" }}>{s(settings, "contact_support_email")}</p>
            </div>
          </motion.a>

          {/* Info Email */}
          <motion.a {...fadeUp(0.1)} href={`mailto:${s(settings, "contact_info_email")}`}
            className="zcard flex flex-col items-center text-center gap-3 transition-all group cursor-pointer"
            style={{ borderColor: "#1E2D4A" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--or)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2D4A"; }}
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all" style={{ background: "rgba(255,92,0,0.1)" }}>
              <Mail size={22} style={{ color: "var(--or)" }} />
            </div>
            <div>
              <p className="zlabel mb-1">Info Email</p>
              <p className="font-bold text-sm break-all" style={{ color: "#FFFFFF" }}>{s(settings, "contact_info_email")}</p>
            </div>
          </motion.a>

          {/* Social */}
          <motion.div {...fadeUp(0.15)} className="zcard flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
              <Instagram size={22} className="text-purple-500" />
            </div>
            <div>
              <p className="zlabel mb-2">Follow Us</p>
              <div className="flex items-center justify-center gap-3">
                {s(settings, "contact_instagram") && (
                  <a href={s(settings, "contact_instagram")} target="_blank" rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity" style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A" }}>
                    <Instagram size={14} className="text-white" />
                  </a>
                )}
                {s(settings, "contact_facebook") && (
                  <a href={s(settings, "contact_facebook")} target="_blank" rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity" style={{ background: "#0C1E3E", border: "1.5px solid #1E2D4A" }}>
                    <Facebook size={14} className="text-white" />
                  </a>
                )}
                {!s(settings, "contact_instagram") && !s(settings, "contact_facebook") && (
                  <p className="text-xs" style={{ color: "#8F9CAE" }}>Coming soon</p>
                )}
              </div>
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
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>
              Distributor <span style={{ color: "var(--or)" }}>Inquiry</span>
            </h2>
            <p style={{ color: "#8F9CAE" }}>
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
              {sending ? "Sending..." : whatsappLink ? "Send Inquiry via WhatsApp" : "Let's Do Business"}
            </motion.button>

            <p className="text-xs text-center" style={{ color: "#8F9CAE" }}>
              We typically respond within 24 hours on business days.
            </p>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  );
}

