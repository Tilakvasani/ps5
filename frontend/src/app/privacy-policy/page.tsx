"use client";
import { useEffect, useState } from "react";
import LegalPage from "@/components/storefront/LegalPage";
import { useSettings } from "@/lib/useSettings";

const DEFAULT_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We may collect the following types of information:\n\nPersonal Information:\n→ Full name\n→ Email address\n→ Mobile number\n→ Billing address\n→ Shipping address\n→ GST details (if applicable)\n\nOrder Information:\n→ Products purchased\n→ Order history\n→ Payment status\n→ Delivery information\n→ Returns and refund details\n\nPayment Information:\nPayments are securely processed through trusted payment partners such as Razorpay. Zupwell does not store your debit card, credit card, UPI PIN, CVV, or complete banking details.\n\nTechnical Information:\nWhen you use our website, we may automatically collect:\n→ IP address\n→ Browser type\n→ Device information\n→ Operating system\n→ Referral URLs\n→ Website usage data\n→ Cookie identifiers"
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "Process and fulfill your orders",
      "Verify payments",
      "Generate invoices and GST records",
      "Deliver products",
      "Provide customer support",
      "Manage your account",
      "Improve our website and services",
      "Personalize your shopping experience",
      "Detect fraud and unauthorized activities",
      "Send order updates and shipping notifications",
      "Send promotional offers and newsletters (only where permitted)",
      "Comply with applicable laws and legal obligations"
    ]
  },
  {
    title: "3. Cookies and Tracking Technologies",
    body: "We use cookies and similar technologies to:\n\n→ Keep you signed in\n→ Remember your shopping cart\n→ Save your preferences\n→ Improve website performance\n→ Analyze website traffic\n→ Measure marketing effectiveness\n\nYou can disable cookies through your browser settings; however, some website features may not function properly."
  },
  {
    title: "4. Marketing Communications",
    body: "With your consent, we may send:\n\n→ Promotional emails\n→ Product updates\n→ Exclusive offers\n→ New product launches\n→ Educational content\n\nYou can unsubscribe at any time by clicking the Unsubscribe link in our emails or by contacting our support team."
  },
  {
    title: "5. Sharing Your Information",
    body: "We never sell or rent your personal information.\n\nWe may share your information only with trusted third parties necessary to operate our business, including:\n\n→ Payment processors (such as Razorpay)\n→ Shipping and logistics partners\n→ Cloud hosting providers\n→ Customer support platforms\n→ Analytics providers\n→ Marketing service providers\n→ Government authorities when legally required\n\nAll third-party service providers are required to maintain appropriate security and confidentiality standards."
  },
  {
    title: "6. Data Security",
    body: "Protecting your information is important to us.\n\nWe implement industry-standard security measures, including:\n\n→ SSL/TLS encrypted connections\n→ Secure cloud infrastructure\n→ Restricted employee access\n→ Authentication controls\n→ Firewalls\n→ Routine security monitoring\n\nWhile we take reasonable steps to protect your information, no method of transmission over the internet is completely secure."
  },
  {
    title: "7. Data Retention",
    body: "We retain your personal information only for as long as necessary to:\n\n→ Fulfill your orders\n→ Provide customer support\n→ Maintain business records\n→ Comply with legal, tax, and regulatory requirements\n→ Resolve disputes\n→ Enforce our agreements\n\nWhen your information is no longer required, it is securely deleted or anonymized."
  },
  {
    title: "8. Your Rights",
    body: "Subject to applicable law, you may have the right to:\n\n→ Access your personal information\n→ Correct inaccurate information\n→ Request deletion of your information\n→ Withdraw consent for marketing communications\n→ Request a copy of your personal data\n→ Raise concerns regarding how your information is processed\n\nTo exercise these rights, please contact us using the details below."
  },
  {
    title: "9. Children's Privacy",
    body: "Our website is intended for individuals who are at least 18 years of age.\n\nWe do not knowingly collect personal information from children. If we become aware that a child's information has been collected, we will delete it promptly."
  },
  {
    title: "10. Third-Party Services",
    body: "Our website may contain links to third-party websites or services.\n\nWe are not responsible for the privacy practices or content of those external websites. We encourage you to review their privacy policies before sharing any personal information."
  },
  {
    title: "11. Third-Party Analytics",
    body: "We may use trusted analytics providers such as Google Analytics or similar tools to better understand how visitors interact with our website.\n\nThese services may collect anonymous usage information using cookies or similar technologies."
  },
  {
    title: "12. Legal Compliance",
    body: "We may disclose your information when required to:\n\n→ Comply with applicable laws\n→ Respond to lawful government requests\n→ Protect our legal rights\n→ Prevent fraud or illegal activity\n→ Enforce our Terms and Conditions"
  },
  {
    title: "13. International Data Processing",
    body: "Some of our technology providers may process or store information outside India.\n\nWhere applicable, we take appropriate safeguards to ensure your information remains protected in accordance with applicable privacy laws."
  },
  {
    title: "14. Changes to This Privacy Policy",
    body: "We may update this Privacy Policy from time to time.\n\nAny changes will be posted on this page with an updated Last Updated date. Continued use of our website after changes become effective constitutes your acceptance of the revised policy."
  },
  {
    title: "15. Contact Us",
    body: "If you have any questions, requests, or concerns regarding this Privacy Policy or your personal information, please contact us:\n\nEmail: support@zupwell.com\n\nWe will make reasonable efforts to respond to your request as promptly as possible."
  }
];

export default function PrivacyPolicy() {
  const { raw: settings, loading } = useSettings();

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <div className="flex items-center justify-center pt-40">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--or)" }} />
      </div>
    </main>
  );

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
      subtitle={settings.policy_privacy_subtitle || "At Zupwell, we value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, share, and safeguard your personal information when you visit our website, create an account, purchase our products, or interact with our services.\n\nBy accessing or using our website, you agree to the practices described in this Privacy Policy."}
      updated={settings.policy_privacy_updated || "Last Updated: April 2026"}
      sections={sections}
    />
  );
}
