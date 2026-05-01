"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
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
    desc: "Paste image URLs for FSSAI, ISO, GMP logos shown on home page",
    keys: [
      { key: "cert_fssai_logo", label: "FSSAI Logo URL", type: "text" },
      { key: "cert_iso_logo",   label: "ISO Logo URL",   type: "text" },
      { key: "cert_gmp_logo",   label: "GMP Logo URL",   type: "text" },
    ],
  },
  {
    label: "Home Page — Founder's Message",
    desc: "Shown on home page and About Us page",
    keys: [
      { key: "founder_name",    label: "Founder Name",    type: "text" },
      { key: "founder_title",   label: "Founder Title (e.g. Founder & CEO)", type: "text" },
      { key: "founder_message", label: "Founder's Message", type: "textarea" },
      { key: "founder_photo",   label: "Founder Photo URL", type: "text" },
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
      invalidateSettingsCache(); // force all pages to reload fresh settings
      toast.success("Settings saved! Changes are now live on the website.");
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 border-[#F47C41] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-display font-black text-[#111827] mb-2">Settings</h1>
      <p className="text-[#6B7280] text-sm mb-6">All changes here reflect live on the website. No code changes needed.</p>
      <form onSubmit={handleSave}>
        <div className="space-y-6 max-w-3xl">
          {SETTING_GROUPS.map(group => (
            <div key={group.label} className="card">
              <div className="mb-4 pb-3 border-b border-[#D9DEE8]">
                <h2 className="font-display font-bold text-[#111827]">{group.label}</h2>
                {(group as any).desc && (
                  <p className="text-xs text-[#6B7280] mt-1">{(group as any).desc}</p>
                )}
              </div>
              <div className="space-y-3">
                {group.keys.map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="label-text">{label}</label>
                    {type === "textarea" ? (
                      <textarea
                        value={settings[key] || ""}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="input-field resize-none text-sm" rows={3}
                      />
                    ) : (
                      <input
                        type={type}
                        value={settings[key] || ""}
                        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="input-field text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : "Save All Settings"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}