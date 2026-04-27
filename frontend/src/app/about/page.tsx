import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function AboutUs() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">About Zupwell</h1>
        <p className="text-sm text-[#6B7280] mb-10">Ahmedabad's trusted health supplement brand</p>
        {[
          { title: "Who We Are", body: "Zupwell is a premium health and wellness brand based in Ahmedabad, Gujarat. We supply high-quality electrolytes, vitamins, protein supplements, and wellness products to individuals and businesses across India." },
          { title: "Our Mission", body: "To make science-backed, authentic health supplements accessible to every Indian — with transparent pricing, GST-compliant invoicing, and fast delivery right to your doorstep." },
          { title: "Why Choose Us", body: "We offer clinically tested products, auto-generated GST invoices with valid HSN codes for easy ITC claims, competitive pricing, and same-day dispatch from our Ahmedabad facility. Our team is always available to help you choose the right supplement." },
          { title: "Our Location", body: "A-102 Adarsh Lifestyle, Near Devashya International School, New India Colony, Nikol, Ahmedabad, Gujarat - 382350. We welcome walk-in customers and bulk buyers." },
          { title: "Contact Us", body: "Email: info@zupwell.com | Phone: +91 6355466208 | WhatsApp: +91 6355466208. Business hours: Monday to Saturday, 9:00 AM – 7:00 PM." },
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
