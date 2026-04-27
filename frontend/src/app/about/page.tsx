import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function AboutUs() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">About Zupwell</h1>
        <p className="text-sm text-[#6B7280] mb-10">Ahmedabad's trusted B2B/B2C packaging partner</p>
        {[
          { title: "Who We Are", body: "Zupwell is a premium packaging materials supplier based in Ahmedabad, Gujarat. We supply high-quality BOPP tapes, bubble wrap, stretch films, and industrial packaging solutions to businesses and individuals across India." },
          { title: "Our Mission", body: "To make reliable, GST-compliant packaging materials accessible to every business — from small home-based sellers to large manufacturing units — with transparent pricing, fast delivery, and excellent service." },
          { title: "Why Choose Us", body: "We offer ISI-certified products, auto-generated GST invoices with valid HSN codes for easy ITC claims, competitive bulk pricing, and same-day dispatch from our Ahmedabad warehouse. Our team is always available to help you find the right packaging solution." },
          { title: "Our Location", body: "A-102 Adarsh Lifestyle, Near Devashya International School, New India Colony, Nikol, Ahmedabad, Gujarat - 382350. We welcome walk-in customers and bulk buyers to our warehouse." },
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
