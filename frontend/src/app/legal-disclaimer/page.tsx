"use client";
import { useEffect, useState } from "react";
import LegalPage from "@/components/storefront/LegalPage";
import { useSettings } from "@/lib/useSettings";

const DEFAULT_SECTIONS = [
  { title: "Health Supplement Disclaimer", body: "All products sold by Zupwell are health supplements and are NOT intended to diagnose, treat, cure, or prevent any disease or medical condition. These products are not medicines and should not be used as a substitute for professional medical advice, diagnosis, or treatment." },
  { title: "Consult Your Doctor", body: "Always seek the advice of your physician or other qualified health provider before starting any new supplement regimen. If you are pregnant, nursing, have a medical condition, or are taking prescription medications, please consult your doctor before use." },
  { title: "Allergies", body: "Please check the full ingredients list of each product before purchase. Zupwell is not responsible for adverse reactions resulting from undisclosed allergies or failure to read the product label." },
  { title: "FSSAI Compliance", body: "All Zupwell products are manufactured in FSSAI-licensed facilities and comply with all applicable food safety regulations in India. Our FSSAI License Number is available in the footer of our website." },
  { title: "Results Disclaimer", body: "Individual results may vary. Product effectiveness depends on various factors including diet, exercise, age, and overall health condition. Testimonials and reviews reflect individual experiences and are not guaranteed results." },
  { title: "Limitation of Liability", body: "Zupwell shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our products. By purchasing and using our products, you agree to this limitation of liability." },
  { title: "Contact Us", body: "For any legal queries or concerns, please contact us at support@zupwell.com." },
];

export default function LegalDisclaimer() {
  const { raw: settings, loading } = useSettings();

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)" }} />
      </div>
    </main>
  );

  let sections = DEFAULT_SECTIONS;
  if (settings.policy_disclaimer_sections_json) {
    try {
      const parsed = JSON.parse(settings.policy_disclaimer_sections_json);
      if (Array.isArray(parsed)) {
        sections = parsed;
      }
    } catch (err) {
      console.error("Failed to parse Legal Disclaimer sections JSON:", err);
    }
  }

  return (
    <LegalPage
      badge={settings.policy_disclaimer_badge || "Legal"}
      title={settings.policy_disclaimer_title || "Legal Disclaimer"}
      subtitle={settings.policy_disclaimer_subtitle || "Important information about Zupwell products and their intended use."}
      updated={settings.policy_disclaimer_updated || "April 2026"}
      sections={sections}
    />
  );
}
