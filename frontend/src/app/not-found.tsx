import Link from "next/link";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--dk)", padding:"40px 24px" }}>
        <div style={{ textAlign:"center", maxWidth:"480px" }}>
          <div style={{ fontSize:"80px", fontWeight:900, letterSpacing:"-4px", color:"var(--wh)", lineHeight:1, marginBottom:"4px" }}>404</div>
          <div style={{ fontSize:"14px", fontWeight:900, color:"var(--or)", letterSpacing:"2px", marginBottom:"16px" }}>PAGE NOT FOUND</div>
          <p style={{ fontSize:"13px", color:"#8F9CAE", lineHeight:1.7, marginBottom:"24px", fontWeight:500 }}>
            Looks like you took a wrong turn. This page doesn't exist — but your hydration journey doesn't have to end here.
          </p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <Link href="/" className="zbtn-or" style={{ padding:"13px 24px", fontSize:"12px", borderRadius: "30px" }}>GO HOME</Link>
            <Link href="/products" className="zbtn-out" style={{ padding:"12px 22px", fontSize:"12px", borderRadius: "30px" }}>SHOP NOW</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
