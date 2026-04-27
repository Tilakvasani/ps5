import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function RefundPolicy() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">Refund & Return Policy</h1>
        <p className="text-sm text-[#6B7280] mb-10">Last updated: April 2026</p>
        {[
          { title: "Return Eligibility", body: "Returns are accepted within 7 days of delivery for products that are damaged, defective, or incorrectly shipped. Products must be unopened, in their original sealed condition, and accompanied by the original invoice." },
          { title: "Non-Returnable Items", body: "Opened or partially used supplement pouches, products without original seals, and clearance/sale items are not eligible for return unless they are defective." },
          { title: "How to Initiate a Return", body: "Contact us at info@zupwell.com or WhatsApp +91 6355466208 within 7 days of delivery. Share your order number, photos of the damaged/defective product, and reason for return. Our team will respond within 24 hours." },
          { title: "Refund Process", body: "Once your return is received and inspected, we will notify you via email. Approved refunds are processed within 5-7 business days. Online payments are refunded to the original payment method. COD orders are refunded via bank transfer." },
          { title: "Exchange", body: "We offer exchanges for the same product (different quantity or variant) subject to availability. If the exchanged item is of higher value, the difference must be paid. If lower, the difference will be refunded." },
          { title: "Cancellations", body: "Orders can be cancelled before dispatch. Once shipped, cancellation is not possible — please use the return process. To cancel, contact us immediately after placing the order at info@zupwell.com." },
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
