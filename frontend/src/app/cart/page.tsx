"use client";
import Link from "next/link";
import { Trash2, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty } = useStore();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ZUPFIRST") { setDiscount(50); toast.success("₹50 off applied!"); }
    else toast.error("Invalid coupon code");
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, letterSpacing: "-2px", marginBottom: "24px", color: "#8f9cae" }}>
          YOUR CART <span style={{ fontSize: "16px", fontWeight: 600, color: "#8F9CAE", letterSpacing: "0" }}>({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
            <h2 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "10px", color: "#8f9cae" }}>YOUR CART IS EMPTY</h2>
            <p style={{ color: "#8F9CAE", fontSize: "13px", marginBottom: "24px" }}>Go grab something good</p>
            <Link href="/products" className="zbtn-or" style={{ padding: "14px 28px", fontSize: "12px", borderRadius: "30px" }}>SHOP NOW →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }}>
            {/* Cart items */}
            <div>
              {cart.map(item => (
                <div key={item.productId} className="zcard" style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ width: "66px", height: "66px", borderRadius: "8px", border: "1.5px solid var(--bd-soft)", overflow: "hidden", flexShrink: 0, background: "var(--dk-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "28px" }}>🍊</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "-0.3px", marginBottom: "2px" }}>{item.name}</div>
                    <div style={{ fontSize: "10px", color: "#8F9CAE", fontWeight: 600, marginBottom: "10px" }}>{item.unit}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px", border: "1.5px solid var(--bd-soft)", borderRadius: "7px", padding: "6px 14px", fontWeight: 900, fontSize: "13px", background: "var(--dk-card)" }}>
                        <button onClick={() => item.qty > 1 ? updateCartQty(item.productId, item.variantId, item.qty - 1) : removeFromCart(item.productId, item.variantId)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900, fontSize: "16px", color: "#8F9CAE" }}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty + 1)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900, fontSize: "16px", color: "var(--or)" }}>+</button>
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "-0.5px" }}>₹{(item.price * item.qty).toFixed(0)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.variantId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8F9CAE", alignSelf: "flex-start" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="zcard" style={{ position: "sticky", top: "90px" }}>
              <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "16px" }}>ORDER SUMMARY</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                <span style={{ color: "#8F9CAE" }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>
                <span style={{ color: "#8F9CAE" }}>Shipping</span>
                <span style={{ color: shipping === 0 ? "var(--lm)" : "var(--wh)", fontWeight: 800 }}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>
              {/* Coupon */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                <input className="zinp" placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "9px 12px" }} />
                <button onClick={applyCoupon} className="zbtn-dk" style={{ fontSize: "11px", padding: "0 14px", flexShrink: 0, background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)" }}>APPLY</button>
              </div>
              {discount > 0 && (
                <div style={{ background: "rgba(22, 101, 52, 0.15)", border: "1.5px solid #166534", borderRadius: "7px", padding: "9px 12px", fontSize: "11px", fontWeight: 700, color: "#EDFADF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Tag size={12} /> ZUPFIRST applied — ₹{discount} off!
                </div>
              )}
              {subtotal < 500 && (
                <div style={{ background: "rgba(255, 92, 0, 0.15)", border: "1.5px solid rgba(255, 92, 0, 0.35)", borderRadius: "7px", padding: "9px 12px", fontSize: "11px", fontWeight: 600, color: "var(--or)", marginBottom: "12px" }}>
                  Add ₹{(500 - subtotal).toFixed(0)} more for FREE shipping!
                </div>
              )}
              <div style={{ height: "1.5px", background: "var(--bd-soft)", margin: "14px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "16px" }}>
                <span>TOTAL</span><span>₹{total.toFixed(0)}</span>
              </div>
              <Link href="/checkout" className="zbtn-or" style={{ width: "100%", padding: "14px", fontSize: "13px", borderRadius: "30px", justifyContent: "center" }}>
                CHECKOUT <ArrowRight size={14} />
              </Link>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "10px", fontWeight: 700, color: "#8F9CAE" }}>
                <ShieldCheck size={13} color="#8F9CAE" /> SECURE & ENCRYPTED CHECKOUT
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
