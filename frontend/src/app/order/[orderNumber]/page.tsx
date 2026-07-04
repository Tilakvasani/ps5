"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Download, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { ordersApi, invoicesApi } from "@/lib/api";
import Link from "next/link";

const STATUS_STEPS = ["PENDING","PROCESSING","SHIPPED","DELIVERED"];
const STATUS_CLS: Record<string,string> = { PENDING:"zbadge-am", PROCESSING:"zbadge-or", SHIPPED:"zbadge-bu", DELIVERED:"zbadge-gr", CANCELLED:"zbadge-rd" };

export default function OrderPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(params.orderNumber).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [params.orderNumber]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <div style={{ fontSize:"13px", color:"#8F9CAE", fontWeight:600 }}>Loading order...</div>
      </div>
      <Footer />
    </>
  );

  if (!order) return (
    <>
      <Navbar />
      <div style={{ textAlign:"center", padding:"80px 24px" }}>
        <div style={{ fontSize:"48px", marginBottom:"14px" }}>🔍</div>
        <h2 style={{ fontSize:"22px", fontWeight:900, letterSpacing:"-1px", marginBottom:"10px", color: "var(--wh)" }}>ORDER NOT FOUND</h2>
        <Link href="/account" className="zbtn-or" style={{ borderRadius: "30px" }}>MY ORDERS</Link>
      </div>
      <Footer />
    </>
  );

  const stepIdx = STATUS_STEPS.indexOf(order.status);
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <>
      <Navbar />
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"10px", fontWeight:700, color:"#8F9CAE", letterSpacing:"1px", marginBottom:"4px" }}>ORDER</div>
            <h1 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:900, letterSpacing:"-1px", marginBottom:"4px", color: "var(--wh)" }}>#{order.orderNumber}</h1>
            <div style={{ fontSize:"12px", color:"#8F9CAE", fontWeight:600 }}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <span className={`zbadge ${STATUS_CLS[order.status]||"zbadge-dk"}`} style={{ fontSize:"11px", padding:"6px 12px" }}>{order.status}</span>
            {order.invoice && (
              <button onClick={() => invoicesApi.downloadPdf(order.invoice.invoiceNumber)} className="zbtn-out" style={{ fontSize:"11px", padding:"8px 14px", borderRadius: "30px" }}>
                <Download size={13} /> PDF
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!isCancelled && (
          <div className="zcard" style={{ marginBottom:"16px" }}>
            <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"14px" }}>ORDER PROGRESS</div>
            <div style={{ display:"flex", alignItems:"center" }}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ display:"flex", alignItems:"center", flex: i < STATUS_STEPS.length-1 ? 1 : undefined }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
                    <div style={{ width:"28px", height:"28px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"11px", background: i<=stepIdx ? "var(--or)" : "var(--dk-card)", border: i<=stepIdx ? "none" : "1.5px solid var(--bd-soft)", color: i<=stepIdx ? "#FFF" : "#8F9CAE" }}>
                      {i < stepIdx ? <CheckCircle size={14} /> : i+1}
                    </div>
                    <div style={{ fontSize:"9px", fontWeight:800, color: i<=stepIdx ? "var(--or)" : "#8F9CAE", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{step}</div>
                  </div>
                  {i < STATUS_STEPS.length-1 && (
                    <div style={{ flex:1, height:"2px", background: i<stepIdx ? "var(--or)" : "var(--bd-soft)", margin:"0 6px", marginBottom:"18px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isDelivered && (
          <div style={{ background:"rgba(22, 101, 52, 0.15)", border:"1.5px solid #166534", borderRadius:"10px", padding:"16px", marginBottom:"16px", display:"flex", gap:"10px", alignItems:"center" }}>
            <CheckCircle size={20} color="#EDFADF" />
            <div>
              <div style={{ fontSize:"13px", fontWeight:800, color: "#EDFADF" }}>ORDER DELIVERED!</div>
              <div style={{ fontSize:"11px", color:"#EDFADF", fontWeight:600 }}>Your order has been successfully delivered. Hope you love it!</div>
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"14px", alignItems:"start" }}>
          {/* Items */}
          <div className="zcard">
            <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"14px" }}>ITEMS ORDERED</div>
            {order.items?.map((item: any) => (
              <div key={item.id} style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"12px", paddingBottom:"12px", borderBottom:"1px solid var(--bd-soft)" }}>
                <div style={{ width:"50px", height:"50px", borderRadius:"8px", border:"1.5px solid var(--bd-soft)", overflow:"hidden", background:"var(--dk-card)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {item.product?.images?.[0]?.imageUrl ? <img src={item.product.images[0].imageUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={item.name} /> : <Package size={18} color="var(--mu)" />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"12px", fontWeight:800 }}>{item.name || item.product?.name}</div>
                  <div style={{ fontSize:"10px", color:"#8F9CAE", fontWeight:600 }}>Qty: {item.qty} · ₹{Number(item.price).toFixed(0)} each</div>
                </div>
                <div style={{ fontSize:"14px", fontWeight:900 }}>₹{(item.qty * item.price).toFixed(0)}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="zcard" style={{ marginBottom:"12px" }}>
              <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"12px" }}>ORDER SUMMARY</div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", fontWeight:600, marginBottom:"6px" }}><span style={{ color:"#8F9CAE" }}>Subtotal</span><span>₹{Number(order.subtotal||0).toFixed(0)}</span></div>
              {Number(order.discountAmount) > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", fontWeight:600, marginBottom:"6px" }}><span style={{ color:"#8F9CAE" }}>Discount</span><span style={{ color:"var(--lm)", fontWeight:800 }}>−₹{Number(order.discountAmount).toFixed(0)}</span></div>}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", fontWeight:600, marginBottom:"10px" }}><span style={{ color:"#8F9CAE" }}>Shipping</span><span style={{ fontWeight:800, color: !Number(order.shippingCharge) ? "var(--lm)" : "var(--wh)" }}>{Number(order.shippingCharge) ? `₹${Number(order.shippingCharge).toFixed(0)}` : "FREE"}</span></div>
              <div style={{ height:"1.5px", background:"var(--bd-soft)", margin:"10px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"16px", fontWeight:900, letterSpacing:"-0.5px" }}><span>TOTAL</span><span>₹{Number(order.totalAmount||0).toFixed(0)}</span></div>
            </div>

            {order.address && (
              <div className="zcard">
                <div style={{ fontSize:"11px", fontWeight:900, letterSpacing:"0.5px", marginBottom:"10px" }}>SHIPPING TO</div>
                <div style={{ fontSize:"12px", color:"#8F9CAE", lineHeight:1.7, fontWeight:500 }}>
                  <div style={{ fontWeight:700, color:"var(--wh)" }}>{order.address.fullName}</div>
                  <div>{order.address.addressLine1}</div>
                  {order.address.addressLine2 && <div>{order.address.addressLine2}</div>}
                  <div>{order.address.city}, {order.address.state} — {order.address.pincode}</div>
                  <div style={{ marginTop:"4px" }}>{order.address.phone}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <Link href="/products" className="zbtn-or" style={{ padding:"13px 22px", fontSize:"12px", borderRadius: "30px" }}>SHOP AGAIN <ArrowRight size={13} /></Link>
          <Link href="/account?tab=orders" className="zbtn-out" style={{ padding:"12px 22px", fontSize:"12px", borderRadius: "30px" }}>ALL ORDERS</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
