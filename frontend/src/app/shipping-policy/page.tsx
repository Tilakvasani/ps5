"use client";
import LegalPage from "@/components/storefront/LegalPage";
export default function ShippingPolicy() {
  return (
    <LegalPage
      badge="Legal"
      title="Shipping Policy"
      subtitle="We know you don't like to wait! Here's how we get Zupwell to your doorstep."
      updated="May 2026"
      sections={[
        { title: "Processing Time", body: "All orders are processed within 1-2 business days (Monday–Saturday, excluding public holidays) from our warehouse in Ahmedabad, Gujarat." },
        { title: "Delivery Timeline", body: [
          "Within Ahmedabad: 1-2 business days",
          "Gujarat (other cities): 2-3 business days",
          "Rest of India: 3-5 business days",
          "These are estimates and may vary based on courier partner performance",
        ]},
        { title: "Shipping Charges", body: "A nominal shipping charge may apply. The exact amount, if any, will be displayed at checkout before you complete your order." },
        { title: "Courier Partners", body: "We ship via reputed courier partners. A tracking number will be shared via SMS/email once your order is dispatched so you can track it in real time." },
        { title: "Bulk / B2B Orders", body: "For bulk B2B orders, shipping timelines and charges may differ. Please contact us for a custom shipping quote." },
        { title: "Damaged or Lost Shipments", body: "If your order arrives damaged or is lost in transit, please contact us within 48 hours of delivery (or expected delivery). We will work with the courier to resolve the issue or arrange a replacement." },
      ]}
    />
  );
}
