"use client";
import LegalPage from "@/components/storefront/LegalPage";
export default function RefundPolicy() {
  return (
    <LegalPage
      badge="Legal"
      title="Refund & Cancellation Policy"
      subtitle="Your satisfaction is our priority. Here's everything you need to know about returns and refunds."
      updated="May 2026"
      sections={[
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
      ]}
    />
  );
}
