"use client";
import { useEffect, useState } from "react";
import LegalPage from "@/components/storefront/LegalPage";
import { fetchSettings } from "@/lib/useSettings";

const DEFAULT_SECTIONS = [
  { title: "Return Eligibility", body: "Returns are accepted within 48 hours of delivery for products that are damaged, defective, or incorrectly shipped. Products must be unopened, in their original sealed condition, and accompanied by the original invoice." },
  { title: "How to Initiate a Return", body: "WhatsApp us within 48 hours of delivery with your order number and photos of the damaged/defective product. Our team will respond within 2-3 business days." },
  { title: "Refund Process", body: "Once your return is received and inspected, we will notify you. Approved refunds are processed within 7-10 business days. Online payments are refunded to the original payment method. COD orders are refunded via bank transfer." },
  { title: "Non-Returnable Items", body: [
    "Opened or partially used supplement products",
    "Products without original seals or packaging",
    "Clearance or sale items (unless defective)",
  ]},
  { title: "Cancellations", body: "You can cancel your order until the product ships. Once it leaves our warehouse, cancellation is not possible — please use the return process after delivery. To cancel, contact us immediately after placing the order." },
  { title: "Exchange", body: "We offer exchanges for the same product (different quantity or variant) subject to availability. If the exchanged item is of higher value, the difference must be paid. If lower, the difference will be refunded." },
];

export default function RefundPolicy() {
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
  if (settings.policy_refund_sections_json) {
    try {
      const parsed = JSON.parse(settings.policy_refund_sections_json);
      if (Array.isArray(parsed)) {
        sections = parsed;
      }
    } catch (err) {
      console.error("Failed to parse Refund Policy sections JSON:", err);
    }
  }

  return (
    <LegalPage
      badge={settings.policy_refund_badge || "Legal"}
      title={settings.policy_refund_title || "Refund & Cancellation Policy"}
      subtitle={settings.policy_refund_subtitle || "Your satisfaction is our priority. Here's everything you need to know about returns and refunds."}
      updated={settings.policy_refund_updated || "May 2026"}
      sections={sections}
    />
  );
}
