"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

const SECTIONS = [
  { label:"STORE INFO", fields:[
    { key:"site_name",    label:"Store Name",     type:"text" },
    { key:"site_email",   label:"Support Email",  type:"email" },
    { key:"site_phone",   label:"Phone",          type:"text" },
    { key:"site_address", label:"Address",        type:"text" },
    { key:"site_gstin",   label:"GSTIN",          type:"text" },
    { key:"site_fssai",   label:"FSSAI Number",   type:"text" },
  ]},
  { label:"HERO SECTION", fields:[
    { key:"hero_title",        label:"Hero Title",       type:"text" },
    { key:"hero_subtext",      label:"Hero Subtext",     type:"textarea" },
    { key:"hero_badge",        label:"Badge Text",       type:"text" },
    { key:"hero_stat1_value",  label:"Stat 1 Value",     type:"text" },
    { key:"hero_stat2_value",  label:"Stat 2 Value",     type:"text" },
  ]},
  { label:"SOCIAL LINKS", fields:[
    { key:"contact_whatsapp",  label:"WhatsApp Number",  type:"text" },
    { key:"social_ig",         label:"Instagram URL",    type:"url" },
    { key:"social_tt",         label:"TikTok URL",       type:"url" },
    { key:"social_yt",         label:"YouTube URL",      type:"url" },
  ]},
  { label:"SHIPPING", fields:[
    { key:"free_shipping_threshold", label:"Free Shipping Above (₹)", type:"number" },
    { key:"standard_shipping_fee",   label:"Standard Shipping (₹)",  type:"number" },
    { key:"express_shipping_fee",    label:"Express Shipping (₹)",   type:"number" },
  ]},
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    adminApi.getSettings().then((d: any) => {
      const map: Record<string,string> = {};
      (Array.isArray(d) ? d : Object.entries(d).map(([k,v]) => ({ key:k, value:v }))).forEach((s: any) => { map[s.key] = s.value ?? ""; });
      setSettings(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try { await adminApi.updateSettings(settings); toast.success("Settings saved!"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding:"40px", textAlign:"center", color:"#888" }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>SETTINGS</h1>
        <button onClick={save} disabled={saving} className="zbtn-or" style={{ fontSize:"11px", padding:"9px 16px" }}>
          <Save size={13} /> {saving ? "SAVING..." : "SAVE ALL"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:"16px", alignItems:"start" }}>
        {/* Section tabs */}
        <div className="zcard" style={{ padding:"8px" }}>
          {SECTIONS.map((s, i) => (
            <button key={s.label} onClick={() => setActiveSection(i)}
              className={`zslink${activeSection===i?" active":""}`}
              style={{ background:"none", border:"none", cursor:"pointer", width:"100%", textAlign:"left", marginBottom:"2px", fontSize:"11px" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="zcard">
          <div style={{ fontSize:"12px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"16px" }}>{SECTIONS[activeSection].label}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {SECTIONS[activeSection].fields.map(f => (
              <div key={f.key}>
                <div className="zlabel">{f.label}</div>
                {f.type === "textarea" ? (
                  <textarea className="zinp" rows={3} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} style={{ resize:"none" }} />
                ) : (
                  <input className="zinp" type={f.type} value={settings[f.key] || ""} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:"18px" }}>
            <button onClick={save} disabled={saving} className="zbtn-or" style={{ fontSize:"11px", padding:"11px 22px" }}>
              <Save size={13} /> {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
