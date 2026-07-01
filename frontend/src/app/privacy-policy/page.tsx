"use client";
import { useEffect, useState } from "react";
import LegalPage from "@/components/storefront/LegalPage";
import { fetchSettings } from "@/lib/useSettings";

const DEFAULT_SECTIONS = [
  { title: "1. Information We Collect", body: "We collect information you provide directly to us, such as your name, email address, phone number, and shipping address when you create an account or place an order. We also collect payment information, though we do not store card details directly — these are handled by our payment partners (Razorpay)." },
  { title: "2. How We Use Your Information", body: [
    "Process orders and payments",
    "Send order confirmations and GST invoices",
    "Provide customer support",
    "Send promotional communications (with your consent)",
    "Improve our products and services",
    "Comply with legal obligations including GST filing",
  ]},
  { title: "3. Sharing Your Information", body: "We do not sell or rent your personal information to third parties. We may share your information with shipping partners to deliver your orders, payment processors to complete transactions, and government authorities as required by law (e.g., GST compliance)." },
  { title: "4. Data Security", body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is transmitted over SSL-encrypted connections." },
  { title: "5. Cookies", body: "We use cookies to maintain your session, remember your cart, and understand how you use our website. You can disable cookies in your browser settings, though this may affect some site functionality." },
  { title: "6. Your Rights", body: "You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at info@zupwell.com." },
  { title: "7. Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at support@zupwell.com." },
];

export default function PrivacyPolicy() {
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
  if (settings.policy_privacy_sections_json) {
    try {
      const parsed = JSON.parse(settings.policy_privacy_sections_json);
      if (Array.isArray(parsed)) {
        sections = parsed;
      }
    } catch (err) {
      console.error("Failed to parse Privacy Policy sections JSON:", err);
    }
  }

  return (
    <LegalPage
      badge={settings.policy_privacy_badge || "Legal"}
      title={settings.policy_privacy_title || "Privacy Policy"}
      subtitle={settings.policy_privacy_subtitle || "We respect your privacy and are committed to protecting your personal data."}
      updated={settings.policy_privacy_updated || "April 2026"}
      sections={sections}
    />
  );
}
