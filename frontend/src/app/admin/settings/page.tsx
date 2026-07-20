"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Save, Upload, X, Globe, Mail, ShieldAlert, 
  Award, FileText, Share2, HelpCircle, Key, CreditCard, Lock, Settings,
  ShoppingBag, MessageCircle, FlaskConical, Scale, RotateCcw, Truck, ShieldCheck
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { invalidateSettingsCache } from "@/lib/useSettings";
import toast from "react-hot-toast";

// ── SUB-EDITORS FOR JSON LISTS ─────────────────────────────────────────────

// 1. Editor for Title-Description pair list (special features, pillars)
function TitleDescListEditor({ 
  value, 
  onChange, 
  placeholderTitle = "Title", 
  placeholderDesc = "Description" 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholderTitle?: string; 
  placeholderDesc?: string; 
}) {
  let list: { title: string; desc: string }[] = [];
  try {
    list = JSON.parse(value || "[]");
  } catch (e) {}

  const update = (newList: any[]) => {
    onChange(JSON.stringify(newList, null, 2));
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border bg-gray-50/30" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
      {list.map((item, idx) => (
        <div key={idx} className="flex gap-3 items-start relative p-4 rounded-xl border bg-white" style={{ borderColor: "rgba(12, 30, 57, 0.06)", boxShadow: "0 2px 8px rgba(12,30,57,0.01)" }}>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={item.title || ""}
              onChange={e => {
                const copy = [...list];
                copy[idx] = { ...copy[idx], title: e.target.value };
                update(copy);
              }}
              placeholder={placeholderTitle}
              className="zinp text-sm py-1.5 px-3"
              style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
            />
            <textarea
              value={item.desc || ""}
              onChange={e => {
                const copy = [...list];
                copy[idx] = { ...copy[idx], desc: e.target.value };
                update(copy);
              }}
              placeholder={placeholderDesc}
              className="zinp text-sm py-1.5 px-3 h-16 resize-none"
              style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const copy = list.filter((_, i) => i !== idx);
              update(copy);
            }}
            className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...list, { title: "", desc: "" }])}
        className="w-full border border-dashed py-2.5 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
      >
        + Add Item
      </button>
    </div>
  );
}

// 2. Editor for String array list (future pipeline)
function StringListEditor({ 
  value, 
  onChange, 
  placeholder = "Pipeline Item" 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
}) {
  let list: string[] = [];
  try {
    list = JSON.parse(value || "[]");
  } catch (e) {}

  const update = (newList: string[]) => {
    onChange(JSON.stringify(newList, null, 2));
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border bg-gray-50/30" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
      {list.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={item || ""}
            onChange={e => {
              const copy = [...list];
              copy[idx] = e.target.value;
              update(copy);
            }}
            placeholder={placeholder}
            className="zinp text-sm py-1.5 px-3 flex-1"
            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
          />
          <button
            type="button"
            onClick={() => {
              const copy = list.filter((_, i) => i !== idx);
              update(copy);
            }}
            className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...list, ""])}
        className="w-full border border-dashed py-2.5 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
      >
        + Add Item
      </button>
    </div>
  );
}

// 3. Editor for structured nested FAQ JSON List
function FaqsListEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  let list: { category: string; emoji: string; questions: { q: string; a: string }[] }[] = [];
  try {
    list = JSON.parse(value || "[]");
  } catch (e) {}

  const update = (newList: any[]) => {
    onChange(JSON.stringify(newList, null, 2));
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-gray-50/30" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
      {list.map((cat, catIdx) => (
        <div key={catIdx} className="p-4 rounded-xl border bg-white relative space-y-3" style={{ borderColor: "rgba(12, 30, 57, 0.08)", boxShadow: "0 4px 12px rgba(12,30,57,0.01)" }}>
          <button
            type="button"
            onClick={() => {
              const copy = list.filter((_, i) => i !== catIdx);
              update(copy);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold mb-1 block text-slate-500 uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                value={cat.category || ""}
                onChange={e => {
                  const copy = [...list];
                  copy[catIdx] = { ...copy[catIdx], category: e.target.value };
                  update(copy);
                }}
                placeholder="e.g. Product Related"
                className="zinp text-xs py-1.5 px-3"
                style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block text-slate-500 uppercase tracking-wider">Emoji</label>
              <input
                type="text"
                value={cat.emoji || ""}
                onChange={e => {
                  const copy = [...list];
                  copy[catIdx] = { ...copy[catIdx], emoji: e.target.value };
                  update(copy);
                }}
                placeholder="e.g. 📦"
                className="zinp text-xs py-1.5 px-3"
                style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
              />
            </div>
          </div>

          <div className="pl-4 border-l-2 border-orange-500/20 space-y-3 mt-4">
            <label className="text-xs font-bold text-[#0C1E39] uppercase tracking-wide block">Questions & Answers</label>
            {(cat.questions || []).map((q, qIdx) => (
              <div key={qIdx} className="p-3 rounded-lg border bg-[#F8F8F8] relative space-y-2" style={{ borderColor: "rgba(12, 30, 57, 0.04)" }}>
                <button
                  type="button"
                  onClick={() => {
                    const copy = [...list];
                    copy[catIdx].questions = copy[catIdx].questions.filter((_: any, i: number) => i !== qIdx);
                    update(copy);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
                >
                  <X size={12} />
                </button>
                <input
                  type="text"
                  value={q.q || ""}
                  onChange={e => {
                    const copy = [...list];
                    copy[catIdx].questions[qIdx] = { ...copy[catIdx].questions[qIdx], q: e.target.value };
                    update(copy);
                  }}
                  placeholder="Question text"
                  className="zinp text-xs py-1.5 px-3 bg-white"
                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.04)" }}
                />
                <textarea
                  value={q.a || ""}
                  onChange={e => {
                    const copy = [...list];
                    copy[catIdx].questions[qIdx] = { ...copy[catIdx].questions[qIdx], a: e.target.value };
                    update(copy);
                  }}
                  placeholder="Answer text"
                  className="zinp text-xs py-1.5 px-3 h-16 resize-none bg-white"
                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.04)" }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const copy = [...list];
                if (!copy[catIdx].questions) copy[catIdx].questions = [];
                copy[catIdx].questions.push({ q: "", a: "" });
                update(copy);
              }}
              className="border border-dashed py-1.5 px-3 rounded-lg text-[10px] font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
            >
              + Add Question Card
            </button>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => {
          update([...list, { category: "", emoji: "", questions: [] }]);
        }}
        className="w-full border border-dashed py-2.5 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
      >
        + Add FAQ Category Group
      </button>
    </div>
  );
}

// 4. Editor for Policy page sections JSON list
function PolicySectionsEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  let list: { title: string; body: string | string[] }[] = [];
  try {
    list = JSON.parse(value || "[]");
  } catch (e) {}

  const update = (newList: any[]) => {
    onChange(JSON.stringify(newList, null, 2));
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-gray-50/30" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
      {list.map((sec, idx) => {
        const isBulletPoints = Array.isArray(sec.body);
        
        return (
          <div key={idx} className="p-4 rounded-xl border bg-white relative space-y-3" style={{ borderColor: "rgba(12, 30, 57, 0.08)", boxShadow: "0 4px 12px rgba(12,30,57,0.01)" }}>
            <button
              type="button"
              onClick={() => {
                const copy = list.filter((_, i) => i !== idx);
                update(copy);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>

            <div>
              <label className="text-xs font-bold mb-1 block text-slate-500 uppercase tracking-wider">Section Title</label>
              <input
                type="text"
                value={sec.title || ""}
                onChange={e => {
                  const copy = [...list];
                  copy[idx] = { ...copy[idx], title: e.target.value };
                  update(copy);
                }}
                placeholder="e.g. 1. Information We Collect"
                className="zinp text-xs py-1.5 px-3"
                style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold block text-slate-500 uppercase tracking-wider">Section Content</label>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border">
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...list];
                      copy[idx] = { ...copy[idx], body: [""] };
                      update(copy);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-all"
                    style={{
                      background: isBulletPoints ? "#FFFFFF" : "transparent",
                      color: isBulletPoints ? "var(--or)" : "#0C1E39",
                      boxShadow: isBulletPoints ? "0 1px 4px rgba(12,30,57,0.06)" : "none"
                    }}
                  >
                    Bullets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...list];
                      copy[idx] = { ...copy[idx], body: "" };
                      update(copy);
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-all"
                    style={{
                      background: !isBulletPoints ? "#FFFFFF" : "transparent",
                      color: !isBulletPoints ? "var(--or)" : "#0C1E39",
                      boxShadow: !isBulletPoints ? "0 1px 4px rgba(12,30,57,0.06)" : "none"
                    }}
                  >
                    Paragraph
                  </button>
                </div>
              </div>

              {isBulletPoints ? (
                <div className="pl-4 border-l-2 border-orange-500/20 space-y-2 mt-2">
                  {(sec.body as string[]).map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={bullet || ""}
                        onChange={e => {
                          const copy = [...list];
                          const newBullets = [...(copy[idx].body as string[])];
                          newBullets[bulletIdx] = e.target.value;
                          copy[idx] = { ...copy[idx], body: newBullets };
                          update(copy);
                        }}
                        placeholder="Bullet list item"
                        className="zinp text-xs py-1.5 px-3 bg-[#F8F8F8]"
                        style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.04)" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...list];
                          const newBullets = (copy[idx].body as string[]).filter((_, i) => i !== bulletIdx);
                          copy[idx] = { ...copy[idx], body: newBullets };
                          update(copy);
                        }}
                        className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...list];
                      const newBullets = [...(copy[idx].body as string[]), ""];
                      copy[idx] = { ...copy[idx], body: newBullets };
                      update(copy);
                    }}
                    className="border border-dashed py-1.5 px-3 rounded-lg text-[10px] font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                  >
                    + Add Bullet Item
                  </button>
                </div>
              ) : (
                <textarea
                  value={(sec.body as string) || ""}
                  onChange={e => {
                    const copy = [...list];
                    copy[idx] = { ...copy[idx], body: e.target.value };
                    update(copy);
                  }}
                  placeholder="Type policy section content here..."
                  className="zinp text-xs py-2 px-3 h-24 resize-y"
                  style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)" }}
                />
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => {
          update([...list, { title: "", body: "" }]);
        }}
        className="w-full border border-dashed py-2.5 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
      >
        + Add Policy Section Block
      </button>
    </div>
  );
}

// ── REDESIGNED SETTINGS METADATA GROUPS ───────────────────────────────────

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
      { key: "hero_badge",        label: "Top Badge Text", type: "text" },
      { key: "hero_subtext",      label: "Hero Subtext", type: "textarea" },
<<<<<<< HEAD
=======
      { key: "hero_image",        label: "Hero Product Image", type: "image" },
      { key: "hero_image_link",   label: "Hero Image Redirect URL", type: "text" },
>>>>>>> 3bf54fbd9a12ff4e65d422727741f10564305b9f
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
    label: "Home Page — Certificate Logos",
    desc: "Upload or paste image URLs for official logo icons",
    keys: [
      { key: "cert_fssai_logo", label: "FSSAI Logo",  type: "image" },
      { key: "cert_iso_logo",   label: "ISO Logo",    type: "image" },
      { key: "cert_gmp_logo",   label: "GMP Logo",    type: "image" },
      { key: "cert_haccp_logo", label: "HACCP Logo",  type: "image" },
      { key: "cert_gst_logo",   label: "GST Logo",    type: "image" },
      { key: "cert_iec_logo",   label: "IEC Logo",    type: "image" },
      { key: "cert_msme_logo",  label: "MSME Logo",   type: "image" },
      { key: "cert_tm_logo",    label: "TM Logo",     type: "image" },
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
    desc: "Content and structural data for the About Us page",
    keys: [
      { key: "about_punchline",    label: "Punchline", type: "text" },
      { key: "about_description",  label: "About Zupwell (short paragraph)", type: "textarea" },
      { key: "about_brand_story",  label: "Brand Story", type: "textarea" },
      { key: "about_mission",      label: "Our Mission", type: "textarea" },
      { key: "about_vision",       label: "Our Vision", type: "textarea" },
      { key: "about_future",       label: "Future of Zupwell", type: "textarea" },
      { key: "about_story_badge",  label: "Story Section Badge", type: "text" },
      { key: "about_story_title",  label: "Story Section Title", type: "text" },
      { key: "about_why_title",    label: "Why Section Title", type: "text" },
      { key: "about_why_subtitle", label: "Why Section Subtitle", type: "text" },
      { key: "about_future_title", label: "Future Section Title", type: "text" },
      { key: "about_cta_title",    label: "CTA Section Title", type: "text" },
      { key: "about_why_special_json", label: "Product Special Features List", type: "special_list" },
      { key: "about_pillars_json", label: "Core Pillars List", type: "pillars_list" },
      { key: "about_future_pipeline_json", label: "Future Pipeline Products List", type: "pipeline_list" },
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
    desc: "Content for Contact Us and Distributor Inquiry section. (Social links live under General & Orders → Social Media, not here.)",
    keys: [
      { key: "contact_whatsapp",      label: "WhatsApp Number (with country code, e.g. 916355466208)", type: "text" },
      { key: "contact_support_email", label: "Support Email", type: "email" },
      { key: "contact_info_email",    label: "Info Email", type: "email" },
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
    desc: "Frequently Asked Questions configurations",
    keys: [
      { key: "faqs_hero_badge", label: "Hero Badge", type: "text" },
      { key: "faqs_hero_title", label: "Hero Title", type: "text" },
      { key: "faqs_hero_subtext", label: "Hero Subtext", type: "textarea" },
      { key: "faqs_footer_title", label: "Footer Title (still have questions?)", type: "text" },
      { key: "faqs_footer_subtext", label: "Footer Subtext", type: "textarea" },
      { key: "faqs_list_json", label: "FAQs Nested Accordions List", type: "faqs_list" },
    ],
  },
  {
    label: "Privacy Policy Page",
    desc: "Configure content for the Privacy Policy page",
    keys: [
      { key: "policy_privacy_badge", label: "Badge", type: "text" },
      { key: "policy_privacy_title", label: "Title", type: "text" },
      { key: "policy_privacy_subtitle", label: "Subtitle", type: "textarea" },
      { key: "policy_privacy_updated", label: "Last Updated", type: "text" },
      { key: "policy_privacy_sections_json", label: "Sections List", type: "policy_sections_list" },
    ],
  },
  {
    label: "Terms of Service Page",
    desc: "Configure content for the Terms of Service page",
    keys: [
      { key: "policy_terms_badge", label: "Badge", type: "text" },
      { key: "policy_terms_title", label: "Title", type: "text" },
      { key: "policy_terms_subtitle", label: "Subtitle", type: "textarea" },
      { key: "policy_terms_updated", label: "Last Updated", type: "text" },
      { key: "policy_terms_sections_json", label: "Sections List", type: "policy_sections_list" },
    ],
  },
  {
    label: "Refund Policy Page",
    desc: "Configure content for the Refund Policy page",
    keys: [
      { key: "policy_refund_badge", label: "Badge", type: "text" },
      { key: "policy_refund_title", label: "Title", type: "text" },
      { key: "policy_refund_subtitle", label: "Subtitle", type: "textarea" },
      { key: "policy_refund_updated", label: "Last Updated", type: "text" },
      { key: "policy_refund_sections_json", label: "Sections List", type: "policy_sections_list" },
    ],
  },
  {
    label: "Shipping Policy Page",
    desc: "Configure content for the Shipping Policy page",
    keys: [
      { key: "policy_shipping_badge", label: "Badge", type: "text" },
      { key: "policy_shipping_title", label: "Title", type: "text" },
      { key: "policy_shipping_subtitle", label: "Subtitle", type: "textarea" },
      { key: "policy_shipping_updated", label: "Last Updated", type: "text" },
      { key: "policy_shipping_sections_json", label: "Sections List", type: "policy_sections_list" },
    ],
  },
  {
    label: "Legal Disclaimer Page",
    desc: "Configure content for the Legal Disclaimer page",
    keys: [
      { key: "policy_disclaimer_badge", label: "Badge", type: "text" },
      { key: "policy_disclaimer_title", label: "Title", type: "text" },
      { key: "policy_disclaimer_subtitle", label: "Subtitle", type: "textarea" },
      { key: "policy_disclaimer_updated", label: "Last Updated", type: "text" },
      { key: "policy_disclaimer_sections_json", label: "Sections List", type: "policy_sections_list" },
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
];

// ── ONE TAB PER PAGE ────────────────────────────────────────────────────
// General & Orders / Payment & SMTP are the only "global" (non-page)
// tabs — everything else maps 1:1 to an actual storefront page, so
// "where do I edit page X" is always obvious: it's the tab called X.
const TABS = [
  { id: "general",     label: "General & Orders",     desc: "Store information, social links, and order fees",              icon: Globe,        groups: ["Store Information", "Social Media", "Order Settings"] },
  { id: "payments",    label: "Payment & SMTP",        desc: "Razorpay keys and SMTP mail server credentials",                icon: CreditCard,   groups: ["Razorpay", "Email (SMTP)"] },
  { id: "home",        label: "Home Page",             desc: "Hero, stats, features, and certification logos",                icon: Settings,     groups: ["Home Page — Hero Section", "Home Page — Certificate Logos", "Home Page — Founder's Message"] },
  { id: "about",       label: "About Page",            desc: "Brand story, mission, pillars, and future pipeline",            icon: Award,        groups: ["About Us Page"] },
  { id: "shop",        label: "Shop / Products Page",  desc: "Badge, title, and subtext shown on the Shop page",              icon: ShoppingBag,  groups: ["Shop Page Settings"] },
  { id: "science",     label: "Science Page",          desc: "Content for the Science & Quality page sections",               icon: FlaskConical, groups: ["Science Page"] },
  { id: "certifications", label: "Certifications Page", desc: "Certificate details and document upload paths",                icon: ShieldCheck,  groups: ["Certifications Settings"] },
  { id: "contact",     label: "Contact Page",          desc: "Contact Us hero and distributor inquiry form copy",             icon: MessageCircle, groups: ["Contact Us Page"] },
  { id: "faqs",        label: "FAQs Page",             desc: "Frequently Asked Questions accordions",                        icon: HelpCircle,   groups: ["FAQs Page"] },
  { id: "legal-privacy",    label: "Privacy Policy Page",    desc: "Content sections for the Privacy Policy page",     icon: FileText, groups: ["Privacy Policy Page"] },
  { id: "legal-terms",      label: "Terms of Service Page",  desc: "Content sections for the Terms of Service page",  icon: Scale,    groups: ["Terms of Service Page"] },
  { id: "legal-refund",     label: "Refund Policy Page",     desc: "Content sections for the Refund Policy page",     icon: RotateCcw, groups: ["Refund Policy Page"] },
  { id: "legal-shipping",   label: "Shipping Policy Page",   desc: "Content sections for the Shipping Policy page",   icon: Truck,    groups: ["Shipping Policy Page"] },
  { id: "legal-disclaimer", label: "Legal Disclaimer Page",  desc: "Content sections for the Legal Disclaimer page",  icon: ShieldAlert, groups: ["Legal Disclaimer Page"] },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState("general");

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
    <div className="flex justify-center py-32">
      <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin animate-duration-700" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
    </div>
  );

  const activeTabMeta = TABS.find(t => t.id === activeTab) || TABS[0];
  const activeGroups = SETTING_GROUPS.filter(g => activeTabMeta.groups.includes(g.label));

  return (
    <div className="min-h-screen">
      <div className="mb-8 border-b pb-5" style={{ borderColor: "rgba(12,30,57,0.08)" }}>
        <h1 className="text-3xl font-black text-[#0C1E39] tracking-tight flex items-center gap-2">
          <span>Settings Dashboard</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure global variables, inner pages content, and API credentials instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Tab switcher panel on Left */}
        <aside className="lg:col-span-3 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: isActive ? "rgba(255, 92, 0, 0.08)" : "transparent",
                  border: isActive ? "1.5px solid rgba(255, 92, 0, 0.15)" : "1.5px solid transparent",
                }}
              >
                {isActive && (
                  <span className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF5C00]" />
                )}
                <Icon 
                  size={18} 
                  className="mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110" 
                  style={{ color: isActive ? "var(--or)" : "#0C1E39" }} 
                />
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wide" style={{ color: isActive ? "var(--or)" : "#0C1E39" }}>
                    {tab.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Tab Content display on Right */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSave}>
            <div className="space-y-6">
              
              {activeGroups.map(group => (
                <div key={group.label} className="zcard relative" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)", padding: '24px' }}>
                  <div className="mb-5 pb-3.5 border-b" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                    <h2 className="font-black text-base text-[#0C1E39]">{group.label}</h2>
                    {(group as any).desc && (
                      <p className="text-xs text-slate-400 mt-1">{(group as any).desc}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {group.keys.map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="zlabel flex mb-1.5 font-semibold text-xs text-[#0C1E39] uppercase tracking-wider opacity-85">{label}</label>
                        
                        {type === "certifications_list" ? (
                          <div className="space-y-4 p-4 rounded-xl border bg-gray-50/30" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
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
                                    <div key={idx} className="p-4 rounded-xl border relative space-y-3 bg-[#FFFFFF]" style={{ borderColor: "rgba(12, 30, 57, 0.08)", boxShadow: "0 2px 8px rgba(12,30,57,0.01)" }}>
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
                                          <label className="text-[10px] uppercase tracking-wider font-bold mb-1 block text-slate-400">Badge/Label</label>
                                          <input
                                            type="text"
                                            value={item.label || ""}
                                            onChange={e => {
                                              const copy = [...list];
                                              copy[idx] = { ...copy[idx], label: e.target.value };
                                              updateList(copy);
                                            }}
                                            className="zinp text-xs py-1.5 px-3"
                                            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                                            placeholder="e.g. FSSAI"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] uppercase tracking-wider font-bold mb-1 block text-slate-400">Official Title</label>
                                          <input
                                            type="text"
                                            value={item.title || ""}
                                            onChange={e => {
                                              const copy = [...list];
                                              copy[idx] = { ...copy[idx], title: e.target.value };
                                              updateList(copy);
                                            }}
                                            className="zinp text-xs py-1.5 px-3"
                                            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                                            placeholder="e.g. Food Safety License"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold mb-1 block text-slate-400">Description</label>
                                        <textarea
                                          value={item.desc || ""}
                                          onChange={e => {
                                            const copy = [...list];
                                            copy[idx] = { ...copy[idx], desc: e.target.value };
                                            updateList(copy);
                                          }}
                                          className="zinp text-xs py-1.5 px-3 h-14 resize-none"
                                          style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                                          placeholder="e.g. Licensed under FSSAI regulations..."
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold mb-1 block text-slate-400">Certificate Image / PDF Path</label>
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
                                              <span className="text-[9px]" style={{ color: '#0C1E39', fontWeight: 600 }}>Upload</span>
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
                                            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                                            placeholder="Or paste file path/URL"
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
                                    className="w-full border border-dashed py-2 rounded-xl text-xs font-bold text-[#FF5C00] bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
                                  >
                                    + Add Certificate Card
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        ) : type === "special_list" || type === "pillars_list" ? (
                          <TitleDescListEditor 
                            value={settings[key] || ""} 
                            onChange={(val) => setSettings(s => ({ ...s, [key]: val }))} 
                          />
                        ) : type === "pipeline_list" ? (
                          <StringListEditor 
                            value={settings[key] || ""} 
                            onChange={(val) => setSettings(s => ({ ...s, [key]: val }))} 
                          />
                        ) : type === "faqs_list" ? (
                          <FaqsListEditor 
                            value={settings[key] || ""} 
                            onChange={(val) => setSettings(s => ({ ...s, [key]: val }))} 
                          />
                        ) : type === "policy_sections_list" ? (
                          <PolicySectionsEditor 
                            value={settings[key] || ""} 
                            onChange={(val) => setSettings(s => ({ ...s, [key]: val }))} 
                          />
                        ) : type === "textarea" ? (
                          <textarea
                            value={settings[key] || ""}
                            onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                            className="zinp text-sm resize-none h-24"
                            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                          />
                        ) : type === "image" ? (
                          <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
                            {settings[key] ? (
                              <div className="relative h-20 w-36 shrink-0 rounded-xl overflow-hidden border bg-white/5" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                                <img src={settings[key]} alt="" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => setSettings(s => ({ ...s, [key]: "" }))}
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
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
                              style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                              placeholder="Or paste direct image URL here"
                            />
                          </div>
                        ) : (
                          <input
                            type={type === "number" ? "number" : type === "password" ? "password" : type === "email" ? "email" : "text"}
                            value={settings[key] || ""}
                            onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                            className="zinp text-sm"
                            style={{ background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.06)", color: "#0C1E39" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <motion.button type="submit" disabled={saving}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="zbtn-or flex items-center gap-2 px-8 py-3 disabled:opacity-50"
                  style={{ boxShadow: "0 8px 24px rgba(255,92,0,0.15)" }}>
                  <Save size={16} /> {saving ? "Saving changes..." : "Save Active Tab Settings"}
                </motion.button>
              </div>

            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
