"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

const SETTING_GROUPS = [
  {
    label: "Store Information",
    keys: [
      { key: "site_name",       label: "Store Name",    type: "text" },
      { key: "site_email",      label: "Contact Email", type: "email" },
      { key: "site_phone",      label: "Contact Phone", type: "text" },
      { key: "site_address",    label: "Address",       type: "textarea" },
      { key: "site_gstin",      label: "GSTIN",         type: "text" },
      { key: "site_state_code", label: "State Code",    type: "text" },
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
      { key: "free_shipping_threshold", label: "Free Shipping Above (₹)", type: "number" },
      { key: "default_shipping_charge", label: "Default Shipping Charge (₹)", type: "number" },
      { key: "order_prefix", label: "Order Number Prefix", type: "text" },
    ],
  },
  {
    label: "Razorpay",
    keys: [
      { key: "razorpay_key_id", label: "Key ID", type: "text" },
      { key: "razorpay_key_secret", label: "Key Secret (write-only)", type: "password" },
    ],
  },
  {
    label: "Email (SMTP)",
    keys: [
      { key: "smtp_host", label: "SMTP Host", type: "text" },
      { key: "smtp_port", label: "SMTP Port", type: "text" },
      { key: "smtp_user", label: "SMTP User", type: "text" },
      { key: "smtp_pass", label: "SMTP Password", type: "password" },
      { key: "smtp_from", label: "From Email", type: "email" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast.success("Settings saved!");
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-[#F47C41] border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-display font-black text-[#111827] mb-6">Settings</h1>
      <form onSubmit={handleSave}>
        <div className="space-y-6 max-w-3xl">
          {SETTING_GROUPS.map(group => (
            <div key={group.label} className="card">
              <h2 className="font-display font-bold text-[#111827] mb-4 pb-3 border-b border-[#D9DEE8]">{group.label}</h2>
              <div className="space-y-3">
                {group.keys.map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="label-text">{label}</label>
                    {type === "textarea" ? (
                      <textarea value={settings[key] || ""} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="input-field resize-none text-sm" rows={2} />
                    ) : (
                      <input type={type} value={settings[key] || ""} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                        className="input-field text-sm" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : "Save All Settings"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
