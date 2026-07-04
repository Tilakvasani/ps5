"use client";
import { useState } from "react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { Mail, Phone, Clock, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Message sent! We'll reply within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <section style={{ background: "var(--dk)", padding: "48px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(32px,6vw,56px)", fontWeight: 900, letterSpacing: "-2.5px", color: "var(--wh)", lineHeight: 1 }}>
            A QUESTION,<br /><span style={{ color: "var(--or)" }}>A CONCERN, ANYTHING.</span>
          </h1>
          <div style={{ fontSize: "13px", color: "#8F9CAE", marginTop: "10px", fontWeight: 600 }}>We’re a real team. We read every message and reply within 24 hours on business days.</div>
        </div>
      </section>

      <section style={{ padding: "40px 24px", background: "var(--dk)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input className="zinp" placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required />
              <input className="zinp" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
            </div>
            <select className="zinp" value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} required>
              <option value="">Select subject</option>
              <option>Order issue</option>
              <option>Product question</option>
              <option>Returns & refunds</option>
              <option>Partnership / B2B</option>
              <option>Other</option>
            </select>
            <textarea className="zinp" rows={6} placeholder="Tell us how we can help..." value={form.message} onChange={e => setForm({...form,message:e.target.value})} required style={{ resize: "none" }} />
            <button type="submit" className="zbtn-or" disabled={loading} style={{ padding: "14px", fontSize: "12px", borderRadius: "30px", justifyContent: "center", letterSpacing: "1px" }}>
              {loading ? "SENDING..." : <><Send size={14} /> SEND IT</>}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { Icon: Mail,    label: "EMAIL",    val: "hello@zupwell.com", color: "var(--or)" },
              { Icon: Phone,   label: "CALL US",  val: "+91 98765 43210",   color: "var(--wh)" },
              { Icon: Clock,   label: "HOURS",    val: "Mon–Fri · 9AM – 6PM IST", color: "var(--lm)" },
              { Icon: MapPin,  label: "LOCATION", val: "Ahmedabad, Gujarat, India", color: "var(--or)" },
            ].map(({ Icon, label, val, color }) => (
              <div key={label} className="zcard" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "7px", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={color === "var(--or)" ? "#FFF" : "var(--dk)"} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.8px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#8F9CAE", fontWeight: 600, marginTop: "2px" }}>{val}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              {["IG","TT","YT"].map(l => (
                <div key={l} style={{ width: "36px", height: "36px", borderRadius: "7px", background: "var(--dk-card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900, color: "var(--wh)", cursor: "pointer", border: "1.5px solid var(--bd-soft)" }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
