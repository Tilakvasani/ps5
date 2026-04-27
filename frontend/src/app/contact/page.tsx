import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-black text-[#111827] mb-2">Contact Us</h1>
        <p className="text-[#6B7280] mb-12">We're here to help. Reach out to us through any of the channels below.</p>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: MapPin, label: "Address", value: "A-102 Adarsh Lifestyle, Near Devashya International School, New India Colony, Nikol, Ahmedabad, Gujarat - 382350" },
            { icon: Phone, label: "Phone / WhatsApp", value: "+91 6355466208" },
            { icon: Mail, label: "Email", value: "info@zupwell.com" },
            { icon: Clock, label: "Business Hours", value: "Monday – Saturday: 9:00 AM – 7:00 PM\nSunday: Closed" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4 p-6 rounded-xl border border-[#E5E7EB] bg-white">
              <div className="w-10 h-10 rounded-lg bg-[#FEF3EC] flex items-center justify-center flex-shrink-0">
                <Icon size={18} style={{ color: "#F47C41" }} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-1">{label}</p>
                <p className="text-[#111827] font-medium whitespace-pre-line">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
