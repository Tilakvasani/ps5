"use client";
import { useEffect, useState } from "react";
import LegalPage from "@/components/storefront/LegalPage";
import { fetchSettings } from "@/lib/useSettings";

const DEFAULT_SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By accessing and using Zupwell's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services." },
  { title: "2. Products and Pricing", body: "All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST. We reserve the right to modify prices at any time without prior notice. Prices at the time of order confirmation are final." },
  { title: "3. Orders and Payment", body: "Orders are confirmed once payment is successfully processed (for online payments) or upon order placement (for COD orders). We accept UPI, credit/debit cards, net banking via Razorpay, and Cash on Delivery." },
  { title: "4. Delivery", body: "We aim to dispatch all orders within 1-2 business days from our Ahmedabad warehouse. Delivery timelines depend on your location and are estimates only. We are not responsible for delays caused by courier partners or unforeseen circumstances." },
  { title: "5. GST & Invoicing", body: "All purchases include GST at applicable rates. A valid GST tax invoice is generated automatically for every order. B2B buyers can provide their GSTIN at checkout to claim Input Tax Credit (ITC)." },
  { title: "6. Intellectual Property", body: "All content on this website, including text, graphics, logos, and images, is the property of Zupwell and is protected by applicable intellectual property laws." },
  { title: "7. Limitation of Liability", body: "Zupwell shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the value of the order placed." },
  { title: "8. Governing Law", body: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat." },
];

export default function TermsOfService() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    const onBust = (e: StorageEvent) => {
      if (e.key === "zupwell-settings-bust")
        fetchSettings().then(setSettings).catch(() => {});
    };
    window.addEventListener("storage", onBust);
    return () => window.removeEventListener("storage", onBust);
  }, []);

  let sections = DEFAULT_SECTIONS;
  if (settings.policy_terms_sections_json) {
    try {
      const parsed = JSON.parse(settings.policy_terms_sections_json);
      if (Array.isArray(parsed)) {
        sections = parsed;
      }
    } catch (err) {
      console.error("Failed to parse Terms of Service sections JSON:", err);
    }
  }

  return (
    <LegalPage
      badge={settings.policy_terms_badge || "Legal"}
      title={settings.policy_terms_title || "Terms & Conditions"}
      subtitle={settings.policy_terms_subtitle || "Please read these terms carefully before using our website and services."}
      updated={settings.policy_terms_updated || "April 2026"}
      sections={sections}
    />
  );
}
