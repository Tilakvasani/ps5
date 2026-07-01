"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Instagram, Facebook, Send, User, Building, MapPin, Briefcase, FileText, Clock, Phone } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { fetchSettings } from "@/lib/useSettings";
import toast from "react-hot-toast";
import { fadeUp } from "@/lib/utils";

const D: Record<string, string> = {
  contact_whatsapp:      "916355466208",
  contact_support_email: "support@zupwell.com",
  contact_info_email:    "info@zupwell.com",
  contact_instagram:     "https://instagram.com/zupwell",
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
    const wa = s(settings, "contact_whatsapp");
    if (wa) {
      const text = encodeURIComponent(
        `*Distributor Inquiry — Grow with ZUPWELL*\n\n` +
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 bg-white border-b border-[#E8E2D9] overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#48C062]/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#48C062] px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9]">
            Contact Us
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-[#002A30] leading-tight">
            We'd love to <span className="text-[#48C062]">hear from you</span>
          </h1>
          <p className="font-sans text-xs font-bold text-[#8C8276] uppercase tracking-wider">
            Have a question, feedback, or want to partner? Get in touch today.
          </p>
        </div>
      </section>

      {/* Contact Cards & Form split layout */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-display font-bold text-xl text-[#002A30] uppercase tracking-wider border-b border-[#E8E2D9]/40 pb-3">Get in Touch</h2>
            <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider leading-relaxed">
              For general queries, order status help, or customer care, choose a channel below. We aim to reply to all queries within 24 hours.
            </p>

            <div className="space-y-4">
              {/* WhatsApp card */}
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="card flex items-center gap-4 bg-white border border-[#E8E2D9] p-5 shadow-soft hover:border-[#48C062]/20 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#48C062] shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#002A30]">WhatsApp Chat</h3>
                    <p className="text-xs text-[#8C8276] font-semibold tracking-wider mt-0.5">+{s(settings, "contact_whatsapp")}</p>
                  </div>
                </a>
              )}

              {/* Support Email */}
              <a href={`mailto:${s(settings, "contact_support_email")}`}
                className="card flex items-center gap-4 bg-white border border-[#E8E2D9] p-5 shadow-soft hover:border-[#48C062]/20 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#E8EAF6] flex items-center justify-center text-[#1A237E] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#002A30]">Customer Support</h3>
                  <p className="text-xs text-[#8C8276] font-semibold tracking-wider mt-0.5">{s(settings, "contact_support_email")}</p>
                </div>
              </a>

              {/* Location */}
              <div className="card flex items-center gap-4 bg-white border border-[#E8E2D9] p-5 shadow-soft">
                <div className="h-10 w-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center text-[#E65100] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#002A30]">Headquarters</h3>
                  <p className="text-xs text-[#8C8276] font-semibold tracking-wider mt-0.5">Ahmedabad, Gujarat, India</p>
                </div>
              </div>

              {/* Hours */}
              <div className="card flex items-center gap-4 bg-white border border-[#E8E2D9] p-5 shadow-soft">
                <div className="h-10 w-10 rounded-xl bg-[#F3E5F5] flex items-center justify-center text-[#8E24AA] shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-[#002A30]">Working Hours</h3>
                  <p className="text-xs text-[#8C8276] font-semibold tracking-wider mt-0.5">Mon - Sat: 10:00 AM - 07:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="card bg-white border border-[#E8E2D9] p-8 shadow-soft space-y-6">
              <div>
                <span className="font-sans text-[10px] font-bold text-[#48C062] uppercase tracking-[0.12em] block mb-1">Partner with us</span>
                <h2 className="font-display font-bold text-xl text-[#002A30] uppercase tracking-wider">Distributor Inquiry Form</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Full Name *</label>
                    <input type="text" value={form.fullName} required
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className="input-field text-xs font-semibold rounded-xl" placeholder="Alex Mercer" />
                  </div>

                  {/* Firm Name */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Firm Name</label>
                    <input type="text" value={form.firmName}
                      onChange={e => setForm(f => ({ ...f, firmName: e.target.value }))}
                      className="input-field text-xs font-semibold rounded-xl" placeholder="Company Name Ltd." />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">City *</label>
                    <input type="text" value={form.city} required
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="input-field text-xs font-semibold rounded-xl" placeholder="Ahmedabad" />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">State</label>
                    <input type="text" value={form.state}
                      onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                      className="input-field text-xs font-semibold rounded-xl" placeholder="Gujarat" />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Inquiry Topic / Distribution Network</label>
                  <input type="text" value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    className="input-field text-xs font-semibold rounded-xl" placeholder="e.g. 5 Years in pharmacy distributions" />
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Your Message *</label>
                  <textarea value={form.message} required rows={4}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="input-field text-xs font-semibold rounded-xl resize-none"
                    placeholder="Tell us about your distribution areas or feedback..." />
                </div>

                <motion.button type="submit" disabled={sending}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                  <Send size={14} />
                  {sending ? "Sending..." : whatsappLink ? "Send Inquiry via WhatsApp" : "Submit Message"}
                </motion.button>

                <p className="text-[9px] font-bold text-center text-[#8C8276] uppercase tracking-wider">
                  By submitting this form, you agree to allow ZUPWELL to contact you regarding business inquiries.
                </p>
              </form>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
