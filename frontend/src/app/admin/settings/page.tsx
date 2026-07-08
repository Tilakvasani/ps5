"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { invalidateSettingsCache } from "@/lib/useSettings";
import toast from "react-hot-toast";

const SETTING_GROUPS = [
  {
    label: "Store Information",
    keys: [
      { key: "site_name",       label: "Store Name",    type: "text" },
      { key: "site_email",      label: "Contact Email", type: "email" },
      { key: "site_phone",      label: "Contact Phone / WhatsApp No.", type: "text" },
      { key: "site_address",    label: "Address",       type: "textarea" },
      { key: "site_gstin",      label: "GSTIN",         type: "text" },
      { key: "site_state_code", label: "State Code",    type: "text" },
      { key: "site_fssai",      label: "FSSAI License Number", type: "text" },
    ],
  },
  {
    label: "Home Page — Hero Section",
    desc: "Controls the big headline and tagline on the home page",
    keys: [
      { key: "hero_title",        label: "Hero Title (English)", type: "text" },
      { key: "hero_tagline",      label: "Hero Tagline (Gujarati/Hindi)", type: "text" },
      { key: "hero_badge",        label: "Top Badge Text (e.g. Ahmedabad's #1 Health Supplement Store)", type: "text" },
      { key: "hero_subtext",      label: "Hero Subtext (below headline)", type: "textarea" },
      { key: "hero_stat1_value",  label: "Stat 1 Value (e.g. 200+)", type: "text" },
      { key: "hero_stat1_label",  label: "Stat 1 Label (e.g. Products)", type: "text" },
      { key: "hero_stat2_value",  label: "Stat 2 Value (e.g. 50K+)", type: "text" },
      { key: "hero_stat2_label",  label: "Stat 2 Label (e.g. Happy Customers)", type: "text" },
      { key: "hero_stat3_value",  label: "Stat 3 Value (e.g. 100%)", type: "text" },
      { key: "hero_stat3_label",  label: "Stat 3 Label (e.g. Authentic)", type: "text" },
      { key: "home_blog_title",   label: "Blog Section Title", type: "text" },
      { key: "home_blog_subtext", label: "Blog Section Subtext", type: "textarea" },
      { key: "home_cta_title",    label: "Bottom CTA Section Title", type: "text" },
      { key: "home_cta_subtext",  label: "Bottom CTA Section Subtext", type: "textarea" },
    ],
  },
  {
    label: "Home Page — Why Zupwell Features",
    desc: "The 4 feature cards (icon, title, description). Icons are fixed — only text changes.",
    keys: [
      { key: "feature1_title", label: "Feature 1 Title", type: "text" },
      { key: "feature1_desc",  label: "Feature 1 Description", type: "textarea" },
      { key: "feature2_title", label: "Feature 2 Title", type: "text" },
      { key: "feature2_desc",  label: "Feature 2 Description", type: "textarea" },
      { key: "feature3_title", label: "Feature 3 Title", type: "text" },
      { key: "feature3_desc",  label: "Feature 3 Description", type: "textarea" },
      { key: "feature4_title", label: "Feature 4 Title", type: "text" },
      { key: "feature4_desc",  label: "Feature 4 Description", type: "textarea" },
    ],
  },
  {
    label: "Home Page — Certificate Logos",
    desc: "Upload or paste image URLs for FSSAI, ISO, GMP, HACCP logos",
    keys: [
      { key: "cert_fssai_logo", label: "FSSAI Logo",  type: "image" },
      { key: "cert_iso_logo",   label: "ISO Logo",    type: "image" },
      { key: "cert_gmp_logo",   label: "GMP Logo",    type: "image" },
      { key: "cert_haccp_logo", label: "HACCP Logo",  type: "image" },
    ],
  },
  {
    label: "Home Page — Founder's Message",
    desc: "Shown on home page and About Us page",
    keys: [
      { key: "founder_name",    label: "Founder Name",    type: "text" },
      { key: "founder_title",   label: "Founder Title (e.g. Founder & CEO)", type: "text" },
      { key: "founder_message", label: "Founder's Message", type: "textarea" },
      { key: "founder_photo",   label: "Founder Photo", type: "image" },
    ],
  },
  {
    label: "About Us Page",
    desc: "Content for the About Us page sections",
    keys: [
      { key: "about_punchline",    label: "Punchline", type: "text" },
      { key: "about_description",  label: "About Zupwell (short paragraph)", type: "textarea" },
      { key: "about_brand_story",  label: "Brand Story", type: "textarea" },
      { key: "about_mission",      label: "Our Mission", type: "textarea" },
      { key: "about_vision",       label: "Our Vision", type: "textarea" },
      { key: "about_future",       label: "Future of Zupwell", type: "textarea" },
      { key: "about_why1_title",   label: "Why Zupwell — Point 1 Title", type: "text" },
      { key: "about_why1_desc",    label: "Why Zupwell — Point 1 Description", type: "textarea" },
      { key: "about_why2_title",   label: "Why Zupwell — Point 2 Title", type: "text" },
      { key: "about_why2_desc",    label: "Why Zupwell — Point 2 Description", type: "textarea" },
      { key: "about_why3_title",   label: "Why Zupwell — Point 3 Title", type: "text" },
      { key: "about_why3_desc",    label: "Why Zupwell — Point 3 Description", type: "textarea" },
      { key: "about_story_badge",  label: "Story Section Badge", type: "text" },
      { key: "about_story_title",  label: "Story Section Title", type: "text" },
      { key: "about_why_title",    label: "Why Section Title", type: "text" },
      { key: "about_why_subtitle", label: "Why Section Subtitle", type: "text" },
      { key: "about_future_title", label: "Future Section Title", type: "text" },
      { key: "about_cta_title",    label: "CTA Section Title", type: "text" },
      { key: "about_why_special_json", label: "Product Special Features (JSON list of {title, desc})", type: "json" },
      { key: "about_pillars_json", label: "Core Pillars List (JSON list of {title, desc})", type: "json" },
      { key: "about_future_pipeline_json", label: "Future Pipeline Products (JSON list of strings)", type: "json" },
    ],
  },
  {
    label: "Science Page",
    desc: "Content for the Science & Quality page sections",
    keys: [
      { key: "science_hero_badge", label: "Hero Badge", type: "text" },
      { key: "science_hero_title", label: "Hero Title", type: "text" },
      { key: "science_hero_subtext", label: "Hero Subtext", type: "textarea" },
      { key: "science_process_badge", label: "Process Section Badge", type: "text" },
      { key: "science_process_title", label: "Process Section Title", type: "textarea" },
      { key: "science_process1_title", label: "Process Point 1 Title", type: "text" },
      { key: "science_process1_desc", label: "Process Point 1 Description", type: "textarea" },
      { key: "science_process2_title", label: "Process Point 2 Title", type: "text" },
      { key: "science_process2_desc", label: "Process Point 2 Description", type: "textarea" },
      { key: "science_cert_badge", label: "Certifications Section Badge", type: "text" },
      { key: "science_cert_title", label: "Certifications Section Title", type: "text" },
      { key: "science_cert_subtext", label: "Certifications Section Subtext", type: "textarea" },
      { key: "science_cert1_title", label: "Certification 1 Title", type: "text" },
      { key: "science_cert1_desc", label: "Certification 1 Description", type: "textarea" },
      { key: "science_cert2_title", label: "Certification 2 Title", type: "text" },
      { key: "science_cert2_desc", label: "Certification 2 Description", type: "textarea" },
      { key: "science_cert3_title", label: "Certification 3 Title", type: "text" },
      { key: "science_cert3_desc", label: "Certification 3 Description", type: "textarea" },
      { key: "science_clean_badge", label: "Clean Label Badge", type: "text" },
      { key: "science_clean_title", label: "Clean Label Title", type: "textarea" },
      { key: "science_clean_desc", label: "Clean Label Description", type: "textarea" },
      { key: "science_clean1_label", label: "Clean Label Point 1 Label", type: "text" },
      { key: "science_clean1_sub", label: "Clean Label Point 1 Subtext", type: "textarea" },
      { key: "science_clean2_label", label: "Clean Label Point 2 Label", type: "text" },
      { key: "science_clean2_sub", label: "Clean Label Point 2 Subtext", type: "textarea" },
      { key: "science_clean3_label", label: "Clean Label Point 3 Label", type: "text" },
      { key: "science_clean3_sub", label: "Clean Label Point 3 Subtext", type: "textarea" },
      { key: "science_tube_title", label: "Tube Design Section Title", type: "textarea" },
      { key: "science_tube_desc", label: "Tube Design Section Description", type: "textarea" },
      { key: "science_tube_f1_title", label: "Tube Design Feature 1 Title", type: "text" },
      { key: "science_tube_f1_desc", label: "Tube Design Feature 1 Desc", type: "text" },
      { key: "science_tube_f2_title", label: "Tube Design Feature 2 Title", type: "text" },
      { key: "science_tube_f2_desc", label: "Tube Design Feature 2 Desc", type: "text" },
      { key: "science_tube_f3_title", label: "Tube Design Feature 3 Title", type: "text" },
      { key: "science_tube_f3_desc", label: "Tube Design Feature 3 Desc", type: "text" },
      { key: "science_tube_f4_title", label: "Tube Design Feature 4 Title", type: "text" },
      { key: "science_tube_f4_desc", label: "Tube Design Feature 4 Desc", type: "text" },
      { key: "science_cta_title", label: "CTA Section Title", type: "text" },
      { key: "science_cta_subtext", label: "CTA Section Subtext", type: "textarea" },
      { key: "science_cta_btn", label: "CTA Section Button Text", type: "text" },
    ],
  },
  {
    label: "Contact Us Page",
    desc: "Content for Contact Us and Distributor Inquiry section",
    keys: [
      { key: "contact_whatsapp",      label: "WhatsApp Number (with country code, e.g. 919876543210)", type: "text" },
      { key: "contact_support_email", label: "Support Email", type: "email" },
      { key: "contact_info_email",    label: "Info Email", type: "email" },
      { key: "contact_instagram",     label: "Instagram URL", type: "text" },
      { key: "contact_facebook",      label: "Facebook URL", type: "text" },
      { key: "contact_hero_badge",    label: "Hero Badge", type: "text" },
      { key: "contact_hero_title",    label: "Hero Title", type: "text" },
      { key: "contact_hero_subtext",  label: "Hero Subtext", type: "textarea" },
      { key: "contact_form_badge",    label: "Distributor Form Badge", type: "text" },
      { key: "contact_form_title",    label: "Distributor Form Title", type: "text" },
      { key: "contact_form_subtext",  label: "Distributor Form Subtext", type: "textarea" },
      { key: "contact_form_footer",   label: "Distributor Form Footnote", type: "text" },
    ],
  },
  {
    label: "FAQs Page",
    desc: "Frequently Asked Questions configuration",
    keys: [
      { key: "faqs_hero_badge", label: "Hero Badge", type: "text" },
      { key: "faqs_hero_title", label: "Hero Title", type: "text" },
      { key: "faqs_hero_subtext", label: "Hero Subtext", type: "textarea" },
      { key: "faqs_footer_title", label: "Footer Title (still have questions?)", type: "text" },
      { key: "faqs_footer_subtext", label: "Footer Subtext", type: "textarea" },
      { key: "faqs_list_json", label: "FAQs List (JSON Format)", type: "json" },
    ],
  },
  {
    label: "Legal Policy Pages",
    desc: "Content and sections for all 5 legal policies (Privacy, Terms, Refund, Shipping, Disclaimer)",
    keys: [
      // Privacy Policy
      { key: "policy_privacy_badge", label: "Privacy Policy — Badge", type: "text" },
      { key: "policy_privacy_title", label: "Privacy Policy — Title", type: "text" },
      { key: "policy_privacy_subtitle", label: "Privacy Policy — Subtitle", type: "textarea" },
      { key: "policy_privacy_updated", label: "Privacy Policy — Last Updated", type: "text" },
      { key: "policy_privacy_sections_json", label: "Privacy Policy — Sections (JSON List of {title, body})", type: "json" },

      // Terms of Service
      { key: "policy_terms_badge", label: "Terms of Service — Badge", type: "text" },
      { key: "policy_terms_title", label: "Terms of Service — Title", type: "text" },
      { key: "policy_terms_subtitle", label: "Terms of Service — Subtitle", type: "textarea" },
      { key: "policy_terms_updated", label: "Terms of Service — Last Updated", type: "text" },
      { key: "policy_terms_sections_json", label: "Terms of Service — Sections (JSON List of {title, body})", type: "json" },

      // Refund Policy
      { key: "policy_refund_badge", label: "Refund Policy — Badge", type: "text" },
      { key: "policy_refund_title", label: "Refund Policy — Title", type: "text" },
      { key: "policy_refund_subtitle", label: "Refund Policy — Subtitle", type: "textarea" },
      { key: "policy_refund_updated", label: "Refund Policy — Last Updated", type: "text" },
      { key: "policy_refund_sections_json", label: "Refund Policy — Sections (JSON List of {title, body})", type: "json" },

      // Shipping Policy
      { key: "policy_shipping_badge", label: "Shipping Policy — Badge", type: "text" },
      { key: "policy_shipping_title", label: "Shipping Policy — Title", type: "text" },
      { key: "policy_shipping_subtitle", label: "Shipping Policy — Subtitle", type: "textarea" },
      { key: "policy_shipping_updated", label: "Shipping Policy — Last Updated", type: "text" },
      { key: "policy_shipping_sections_json", label: "Shipping Policy — Sections (JSON List of {title, body})", type: "json" },

      // Legal Disclaimer
      { key: "policy_disclaimer_badge", label: "Legal Disclaimer — Badge", type: "text" },
      { key: "policy_disclaimer_title", label: "Legal Disclaimer — Title", type: "text" },
      { key: "policy_disclaimer_subtitle", label: "Legal Disclaimer — Subtitle", type: "textarea" },
      { key: "policy_disclaimer_updated", label: "Legal Disclaimer — Last Updated", type: "text" },
      { key: "policy_disclaimer_sections_json", label: "Legal Disclaimer — Sections (JSON List of {title, body})", type: "json" },
    ],
  },
  {
    label: "Social Media",
    keys: [
      { key: "social_instagram", label: "Instagram URL", type: "text" },
      { key: "social_facebook",  label: "Facebook URL",  type: "text" },
      { key: "social_youtube",   label: "YouTube URL",   type: "text" },
      { key: "social_linkedin",  label: "LinkedIn URL",  type: "text" },
    ],
  },
  {
    label: "Order Settings",
    keys: [
      { key: "gst_rate",                label: "GST Rate % (e.g. 5 for 5%, split equally as CGST+SGST)", type: "number" },
      { key: "free_shipping_threshold", label: "Free Shipping Above (₹)", type: "number" },
      { key: "default_shipping_charge", label: "Default Shipping Charge (₹)", type: "number" },
      { key: "order_prefix",           label: "Order Number Prefix", type: "text" },
    ],
  },
  {
    label: "Razorpay",
    keys: [
      { key: "razorpay_key_id",     label: "Key ID",                     type: "text" },
      { key: "razorpay_key_secret", label: "Key Secret (write-only)",    type: "password" },
    ],
  },
  {
    label: "Email (SMTP)",
    keys: [
      { key: "smtp_host", label: "SMTP Host",     type: "text" },
      { key: "smtp_port", label: "SMTP Port",     type: "text" },
      { key: "smtp_user", label: "SMTP User",     type: "text" },
      { key: "smtp_pass", label: "SMTP Password", type: "password" },
      { key: "smtp_from", label: "From Email",    type: "email" },
    ],
  },
  {
    label: "Shop Page Settings",
    desc: "Controls the badge, title, and subtext shown on the Shop page",
    keys: [
      { key: "shop_badge",   label: "Shop Badge Text", type: "text" },
      { key: "shop_title",   label: "Shop Title Text", type: "text" },
      { key: "shop_subtext", label: "Shop Subtext / Tagline", type: "textarea" },
    ],
  },
  {
    label: "Certifications Settings",
    desc: "Update official certificate details and document upload paths shown on the Certifications page",
    keys: [
      { key: "cert_page_title",    label: "Certifications Page Title", type: "text" },
      { key: "cert_page_subtitle", label: "Certifications Page Subtitle", type: "textarea" },
      { key: "certifications_list_json", label: "Manage Certificates List", type: "certifications_list" },
    ],
  },
  {
    label: "Science & Quality Page Settings",
    desc: "Content and titles for the Science & Quality page",
    keys: [
      { key: "science_hero_badge", label: "Hero Badge", type: "text" },
      { key: "science_hero_title", label: "Hero Title", type: "text" },
      { key: "science_hero_subtext", label: "Hero Subtext", type: "textarea" },
      { key: "science_process_badge", label: "Process Badge", type: "text" },
      { key: "science_process_title", label: "Process Title", type: "textarea" },
      { key: "science_process1_title", label: "Process 1 — Sourcing Title", type: "text" },
      { key: "science_process1_desc", label: "Process 1 — Sourcing Description", type: "textarea" },
      { key: "science_process2_title", label: "Process 2 — Technology Title", type: "text" },
      { key: "science_process2_desc", label: "Process 2 — Technology Description", type: "textarea" },
      { key: "science_cert_badge", label: "Quality/Safety Badge", type: "text" },
      { key: "science_cert_title", label: "Quality/Safety Title", type: "text" },
      { key: "science_cert_desc", label: "Quality/Safety Description", type: "textarea" },
      { key: "science_cert1_title", label: "Certificate 1 — GMP/ISO Title", type: "text" },
      { key: "science_cert1_desc", label: "Certificate 1 — GMP/ISO Description", type: "textarea" },
      { key: "science_cert2_title", label: "Certificate 2 — FSSAI Title", type: "text" },
      { key: "science_cert2_desc", label: "Certificate 2 — FSSAI Description", type: "textarea" },
      { key: "science_cert3_title", label: "Certificate 3 — Lab Tested Title", type: "text" },
      { key: "science_cert3_desc", label: "Certificate 3 — Lab Tested Description", type: "textarea" },
      { key: "science_clean_badge", label: "Clean Label Badge", type: "text" },
      { key: "science_clean_title", label: "Clean Label Title", type: "text" },
      { key: "science_clean_desc", label: "Clean Label Description", type: "textarea" },
      { key: "science_clean1_label", label: "Clean Feature 1 — Title", type: "text" },
      { key: "science_clean1_sub", label: "Clean Feature 1 — Description", type: "textarea" },
      { key: "science_clean2_label", label: "Clean Feature 2 — Title", type: "text" },
      { key: "science_clean2_sub", label: "Clean Feature 2 — Description", type: "textarea" },
      { key: "science_clean3_label", label: "Clean Feature 3 — Title", type: "text" },
      { key: "science_clean3_sub", label: "Clean Feature 3 — Description", type: "textarea" },
      { key: "science_tube_title", label: "Tube Mockup Card Title", type: "textarea" },
      { key: "science_tube_desc", label: "Tube Mockup Card Description", type: "textarea" },
      { key: "science_tube_f1_title", label: "Tube Feature 1 — Title", type: "text" },
      { key: "science_tube_f1_desc", label: "Tube Feature 1 — Description", type: "text" },
      { key: "science_tube_f2_title", label: "Tube Feature 2 — Title", type: "text" },
      { key: "science_tube_f2_desc", label: "Tube Feature 2 — Description", type: "text" },
      { key: "science_tube_f3_title", label: "Tube Feature 3 — Title", type: "text" },
      { key: "science_tube_f3_desc", label: "Tube Feature 3 — Description", type: "text" },
      { key: "science_tube_f4_title", label: "Tube Feature 4 — Title", type: "text" },
      { key: "science_tube_f4_desc", label: "Tube Feature 4 — Description", type: "text" },
      { key: "science_cta_title", label: "CTA strip Title", type: "text" },
      { key: "science_cta_subtext", label: "CTA strip Subtext", type: "textarea" },
      { key: "science_cta_btn", label: "CTA Button Text", type: "text" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((data: any[]) => {
      const obj: Record<string, string> = {};
      data.forEach(s => { obj[s.key] = s.value; });
      setSettings(obj);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      invalidateSettingsCache();
      try { window.localStorage.setItem("zupwell-settings-bust", Date.now().toString()); } catch {}
      toast.success("Settings saved! Changes are now live on the website.");
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-black mb-2" style={{ color: "#0C1E39", letterSpacing: "-0.04em" }}>Settings</h1>
      <p className="text-sm mb-6" style={{ color: "#4A5568" }}>All changes here reflect live on the website. No code changes needed.</p>
      <form onSubmit={handleSave}>
        <div className="space-y-6 max-w-3xl">
          {SETTING_GROUPS.map(group => (
            <div key={group.label} className="zcard" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
              <div className="mb-4 pb-3 border-b" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                <h2 className="font-bold text-lg" style={{ color: "#0C1E39" }}>{group.label}</h2>
                {(group as any).desc && (
                  <p className="text-xs mt-1" style={{ color: "#4A5568" }}>{(group as any).desc}</p>
                )}
              </div>
              <div className="space-y-3">
                {group.keys.map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="zlabel flex mb-1" style={{ color: "#0C1E39" }}>{label}</label>
                    {type === "certifications_list" ? (
                      <div className="space-y-4 p-4 rounded-xl border bg-gray-50/50" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                        {(() => {
                          let list: any[] = [];
                          try {
                            list = JSON.parse(settings[key] || "[]");
                          } catch (e) {}
                          
                          const updateList = (newList: any[]) => {
                            setSettings(s => ({ ...s, [key]: JSON.stringify(newList, null, 2) }));
                          };

                          return (
                            <div className="space-y-4">
                              {list.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl border relative space-y-3 bg-[#F8F8F8]" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = list.filter((_, i) => i !== idx);
                                      updateList(filtered);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-bold mb-1 block">Badge/Label</label>
                                      <input
                                        type="text"
                                        value={item.label || ""}
                                        onChange={e => {
                                          const copy = [...list];
                                          copy[idx] = { ...copy[idx], label: e.target.value };
                                          updateList(copy);
                                        }}
                                        className="zinp text-xs py-1.5 px-3"
                                        style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                                        placeholder="e.g. FSSAI"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold mb-1 block">Official Title</label>
                                      <input
                                        type="text"
                                        value={item.title || ""}
                                        onChange={e => {
                                          const copy = [...list];
                                          copy[idx] = { ...copy[idx], title: e.target.value };
                                          updateList(copy);
                                        }}
                                        className="zinp text-xs py-1.5 px-3"
                                        style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                                        placeholder="e.g. Food Safety License"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold mb-1 block">Description</label>
                                    <textarea
                                      value={item.desc || ""}
                                      onChange={e => {
                                        const copy = [...list];
                                        copy[idx] = { ...copy[idx], desc: e.target.value };
                                        updateList(copy);
                                      }}
                                      className="zinp text-xs py-1.5 px-3 h-14 resize-none"
                                      style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                                      placeholder="e.g. Licensed under FSSAI regulations..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold mb-1 block">Certificate Document / Image File</label>
                                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                      {item.fileUrl ? (
                                        <div className="relative h-14 w-24 shrink-0 rounded-lg overflow-hidden border bg-white" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                                          <img src={item.fileUrl} alt="" className="w-full h-full object-contain" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const copy = [...list];
                                              copy[idx] = { ...copy[idx], fileUrl: "" };
                                              updateList(copy);
                                            }}
                                            className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full flex items-center justify-center bg-[#0C1E39] text-white hover:bg-rose-500 transition-colors"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="h-14 w-24 shrink-0 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors border border-dashed border-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10">
                                          <Upload size={14} className="mb-0.5" style={{ color: '#FF5C00' }} />
                                          <span className="text-[9px]" style={{ color: '#0C1E39', fontWeight: 600 }}>Upload File</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                const fd = new FormData();
                                                fd.append("file", e.target.files[0]);
                                                const toastId = toast.loading("Uploading certificate...");
                                                try {
                                                  const res = await adminApi.uploadSettingImage(fd);
                                                  const copy = [...list];
                                                  copy[idx] = { ...copy[idx], fileUrl: res.url };
                                                  updateList(copy);
                                                  toast.success("Uploaded successfully!", { id: toastId });
                                                } catch (err: any) {
                                                  toast.error(err.message || "Upload failed", { id: toastId });
                                                }
                                              }
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      )}
                                      <input
                                        type="text"
                                        value={item.fileUrl || ""}
                                        onChange={e => {
                                          const copy = [...list];
                                          copy[idx] = { ...copy[idx], fileUrl: e.target.value };
                                          updateList(copy);
                                        }}
                                        className="zinp text-xs py-1.5 px-3 flex-1"
                                        style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                                        placeholder="Or paste certificate document path/URL here"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  updateList([...list, { label: "", title: "", desc: "", fileUrl: "" }]);
                                }}
                                className="w-full border border-dashed py-2.5 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                              >
                                + Add Certificate Card
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    ) : type === "textarea" || type === "json" ? (
                      <textarea
                        value={settings[key] || ""}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className={`zinp text-sm ${type === "json" ? "font-mono h-40 resize-y" : "resize-none h-20"}`}
                        style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                        rows={type === "json" ? 8 : 3}
                        placeholder={type === "json" ? '[{"title": "...", "body": "..."}]' : ""}
                      />
                    ) : type === "image" ? (
                      <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
                        {settings[key] ? (
                          <div className="relative h-20 w-36 shrink-0 rounded-xl overflow-hidden border bg-white/5" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                            <img src={settings[key]} alt="" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setSettings(s => ({ ...s, [key]: "" }))}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                              style={{ background: "#0C1E39", color: "#FFFFFF" }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="h-20 w-36 shrink-0 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors border-2 border-dashed border-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10">
                            <Upload size={18} className="mb-1" style={{ color: '#FF5C00' }} />
                            <span className="text-[10px]" style={{ color: '#0C1E39', fontWeight: 600 }}>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const fd = new FormData();
                                  fd.append("file", file);
                                  const toastId = toast.loading("Uploading image...");
                                  try {
                                    const res = await adminApi.uploadSettingImage(fd);
                                    setSettings(s => ({ ...s, [key]: res.url }));
                                    toast.success("Uploaded successfully!", { id: toastId });
                                  } catch (err: any) {
                                    toast.error(err.message || "Upload failed", { id: toastId });
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                        <input
                          type="text"
                          value={settings[key] || ""}
                          onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                          className="zinp text-sm flex-1"
                          style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                          placeholder="Or paste direct image URL here"
                        />
                      </div>
                    ) : (
                      <input
                        type={type === "number" ? "number" : type === "password" ? "password" : type === "email" ? "email" : "text"}
                        value={settings[key] || ""}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="zinp text-sm"
                        style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="zbtn-or flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : "Save All Settings"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

