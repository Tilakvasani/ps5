import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#6B7280] mb-10">Last updated: April 2026</p>
        {[
          { title: "1. Information We Collect", body: "We collect information you provide directly to us, such as your name, email address, phone number, and shipping address when you create an account or place an order. We also collect payment information, though we do not store card details directly — these are handled by our payment partners." },
          { title: "2. How We Use Your Information", body: "We use the information we collect to process orders and payments, send order confirmations and invoices, provide customer support, send promotional communications (with your consent), improve our products and services, and comply with legal obligations including GST filing." },
          { title: "3. Sharing Your Information", body: "We do not sell or rent your personal information to third parties. We may share your information with shipping partners to deliver your orders, payment processors to complete transactions, and government authorities as required by law (e.g., GST compliance)." },
          { title: "4. Data Security", body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is transmitted over SSL-encrypted connections." },
          { title: "5. Cookies", body: "We use cookies to maintain your session, remember your cart, and understand how you use our website. You can disable cookies in your browser settings, though this may affect some site functionality." },
          { title: "6. Your Rights", body: "You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at info@zupwell.com." },
          { title: "7. Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at info@zupwell.com or call +91 6355466208." },
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
