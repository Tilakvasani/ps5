import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function ShippingPolicy() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">Shipping Policy</h1>
        <p className="text-sm text-[#6B7280] mb-10">Last updated: April 2026</p>
        {[
          { title: "Processing Time", body: "All orders are processed within 1-2 business days (Monday–Saturday, excluding public holidays) from our warehouse in Ahmedabad, Gujarat." },
          { title: "Shipping Charges", body: "Orders above ₹500 qualify for FREE shipping. Orders below ₹500 are charged a flat ₹50 shipping fee. This is calculated automatically at checkout." },
          { title: "Delivery Timeline", body: "Within Ahmedabad: 1-2 business days. Gujarat (other cities): 2-3 business days. Rest of India: 4-7 business days. These are estimates and may vary based on courier partner performance." },
          { title: "Courier Partners", body: "We ship via reputed courier partners including Delhivery, DTDC, and Blue Dart. A tracking number will be shared via SMS/email once your order is dispatched." },
          { title: "Bulk Orders", body: "For bulk B2B orders, shipping timelines and charges may differ. Please contact us at info@zupwell.com or call +91 6355466208 for a custom shipping quote." },
          { title: "Damaged or Lost Shipments", body: "If your order arrives damaged or is lost in transit, please contact us within 48 hours of delivery (or expected delivery). We will work with the courier to resolve the issue or arrange a replacement." },
        ].map(s => (
          <section key={s.title} className="mb-8">
            <h2 className="text-lg font-display font-bold text-[#111827] mb-2">{s.title}</h2>
            <p className="text-[#374151] leading-relaxed">{s.body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
