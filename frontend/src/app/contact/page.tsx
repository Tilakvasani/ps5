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
    <main className="min-h-screen bg-[#FCFAF6] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 bg-white overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#EB9220]/6 " />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span {...fadeUp(0)} className="inline-block text-xs font-semibold uppercase tracking-widest text-[#EB9220] mb-4">
            Contact Us
          </motion.span>
          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl font-black text-[#0B1B3D] mb-4 leading-tight">
            Got Questions?<br />
            <span className="gradient-text">We've Got Answers!</span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-lg text-[#45353E]">
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
              className="card flex flex-col items-center text-center gap-3 hover:border-green-400/40 hover:bg-[#F0EFEA]/50 transition-all group cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-[#F0EFEA] flex items-center justify-center group-hover:bg-green-100 transition-all">
                <MessageCircle size={22} className="text-[#EB9220]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#45353E] mb-1">WhatsApp</p>
                <p className="font-bold text-[#0B1B3D] text-sm">+{s(settings, "contact_whatsapp")}</p>
                <p className="text-xs text-[#EB9220] mt-1 font-semibold">Chat now →</p>
              </div>
            </motion.a>
          )}

          {/* Support Email */}
          <motion.a {...fadeUp(0.05)} href={`mailto:${s(settings, "contact_support_email")}`}
            className="card flex flex-col items-center text-center gap-3 hover:border-[#EB9220]/30 transition-all group cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-[#EB9220]/10 flex items-center justify-center group-hover:bg-[#EB9220]/20 transition-all">
              <Mail size={22} className="text-[#EB9220]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#45353E] mb-1">Support Email</p>
              <p className="font-bold text-[#0B1B3D] text-sm break-all">{s(settings, "contact_support_email")}</p>
            </div>
          </motion.a>

          {/* Info Email */}
          <motion.a {...fadeUp(0.1)} href={`mailto:${s(settings, "contact_info_email")}`}
            className="card flex flex-col items-center text-center gap-3 hover:border-[#EB9220]/30 transition-all group cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-[#EB9220]/10 flex items-center justify-center group-hover:bg-[#EB9220]/20 transition-all">
              <Mail size={22} className="text-[#EB9220]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#45353E] mb-1">Info Email</p>
              <p className="font-bold text-[#0B1B3D] text-sm break-all">{s(settings, "contact_info_email")}</p>
            </div>
          </motion.a>

          {/* Social */}
          <motion.div {...fadeUp(0.15)} className="card flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Instagram size={22} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#45353E] mb-2">Follow Us</p>
              <div className="flex items-center justify-center gap-3">
                {s(settings, "contact_instagram") && (
                  <a href={s(settings, "contact_instagram")} target="_blank" rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg bg-[#FCFAF6] flex items-center justify-center hover:opacity-80 transition-opacity">
                    <Instagram size={14} className="text-white" />
                  </a>
                )}
                {s(settings, "contact_facebook") && (
                  <a href={s(settings, "contact_facebook")} target="_blank" rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <Facebook size={14} className="text-white" />
                  </a>
                )}
                {!s(settings, "contact_instagram") && !s(settings, "contact_facebook") && (
                  <p className="text-xs text-[#8C8276]">Coming soon</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Distributor Inquiry Form ── */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#EB9220] mb-3">
              Grow with Zupwell
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0B1B3D] mb-3">
              Distributor <span className="gradient-text">Inquiry</span>
            </h2>
            <p className="text-[#45353E]">
              Interested in partnering with us? Fill in your details and let's do business!
            </p>
          </motion.div>

          <motion.form {...fadeUp(0.1)} onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <User size={13} className="text-[#EB9220]" /> Full Name *
                </label>
                <input type="text" value={form.fullName} required
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="input-field text-sm" placeholder="Your full name" />
              </div>

              {/* Firm Name */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Building size={13} className="text-[#EB9220]" /> Firm Name
                </label>
                <input type="text" value={form.firmName}
                  onChange={e => setForm(f => ({ ...f, firmName: e.target.value }))}
                  className="input-field text-sm" placeholder="Your firm / company name" />
              </div>

              {/* City */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#EB9220]" /> City *
                </label>
                <input type="text" value={form.city} required
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="input-field text-sm" placeholder="Your city" />
              </div>

              {/* State */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#EB9220]" /> State
                </label>
                <input type="text" value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="input-field text-sm" placeholder="Your state" />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="label-text flex items-center gap-1.5">
                <Briefcase size={13} className="text-[#EB9220]" /> Experience in Distribution
              </label>
              <input type="text" value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                className="input-field text-sm" placeholder="e.g. 3 years in FMCG, new to distribution, etc." />
            </div>

            {/* Message */}
            <div>
              <label className="label-text flex items-center gap-1.5">
                <FileText size={13} className="text-[#EB9220]" /> Message *
              </label>
              <textarea value={form.message} required rows={4}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="input-field text-sm resize-none"
                placeholder="Tell us about your distribution network, area of operation, and what you're looking for..." />
            </div>

            <motion.button type="submit" disabled={sending}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} />
              {sending ? "Sending..." : whatsappLink ? "Send Inquiry via WhatsApp" : "Let's Do Business"}
            </motion.button>

            <p className="text-xs text-center text-[#8C8276]">
              We typically respond within 24 hours on business days.
            </p>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
