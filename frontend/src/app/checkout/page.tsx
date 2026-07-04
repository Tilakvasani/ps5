"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import { useStore } from "@/lib/store";
import { ordersApi, accountApi } from "@/lib/api";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, user } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "", shipping: "standard" });

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingCost;

  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleOrder = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      // 1. Save address to account
      const addressPayload = {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        addressLine1: form.address,
        addressLine2: "",
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      const savedAddress = await accountApi.addAddress(addressPayload);

      // 2. Map items correctly
      const orderItems = cart.map(i => ({
        productId: i.productId,
        variantId: i.variantId || null,
        qty: i.qty
      }));

      // 3. Create order with COD payment
      const order = await ordersApi.create({
        items: orderItems,
        addressId: savedAddress.id,
        paymentMethod: "cod"
      });

      clearCart();
      toast.success("Order placed!");
      router.push(`/order/${order.orderNumber}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || e.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const STEP_LABELS = ["INFO", "SHIPPING", "PAYMENT"];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 24px" }}>
        {/* Step bar */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
          {STEP_LABELS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div className={step > i ? "zsdot-on" : step === i + 1 ? "zsdot-on" : "zsdot-off"}>{i + 1}</div>
                <span style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.5px", color: step >= i + 1 ? "var(--wh)" : "#8F9CAE" }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: "1.5px", background: step > i + 1 ? "var(--or)" : "var(--bd-soft)", margin: "0 10px" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
          {/* Form */}
          <div className="zcard">
            {step === 1 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "14px" }}>CONTACT INFO</div>
                <input className="zinp" placeholder="Email address" value={form.email} onChange={e => u("email", e.target.value)} style={{ marginBottom: "8px" }} />
                <input className="zinp" placeholder="Phone number" value={form.phone} onChange={e => u("phone", e.target.value)} style={{ marginBottom: "20px" }} />
                <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "14px" }}>SHIPPING ADDRESS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  <input className="zinp" placeholder="First name" value={form.firstName} onChange={e => u("firstName", e.target.value)} />
                  <input className="zinp" placeholder="Last name" value={form.lastName} onChange={e => u("lastName", e.target.value)} />
                </div>
                <input className="zinp" placeholder="Street address" value={form.address} onChange={e => u("address", e.target.value)} style={{ marginBottom: "8px" }} />
                <input className="zinp" placeholder="City" value={form.city} onChange={e => u("city", e.target.value)} style={{ marginBottom: "8px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                  <input className="zinp" placeholder="State" value={form.state} onChange={e => u("state", e.target.value)} />
                  <input className="zinp" placeholder="PIN code" value={form.pincode} onChange={e => u("pincode", e.target.value)} />
                </div>
                <button onClick={() => setStep(2)} className="zbtn-or" style={{ width: "100%", padding: "14px", fontSize: "12px", justifyContent: "center", letterSpacing: "1px", borderRadius: "30px" }}>
                  CONTINUE TO SHIPPING →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "14px" }}>DELIVERY METHOD</div>
                {[
                  { key: "standard", label: "Standard Delivery (3–5 days)", sub: subtotal >= 500 ? "Free on your order" : "₹50", price: subtotal >= 500 ? "FREE" : "₹50" },
                ].map(opt => (
                  <div key={opt.key}
                    style={{ border: "2px solid var(--or)", borderRadius: "8px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: "8px", background: "rgba(255, 92, 0, 0.1)" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 800 }}>{opt.label}</div>
                      <div style={{ fontSize: "10px", color: "#8F9CAE", fontWeight: 600, marginTop: "2px" }}>{opt.sub}</div>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: opt.price === "FREE" ? "var(--lm)" : "var(--wh)" }}>{opt.price}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button onClick={() => setStep(1)} className="zbtn-out" style={{ flex: 1, padding: "13px", justifyContent: "center", borderRadius: "30px" }}>← BACK</button>
                  <button onClick={() => setStep(3)} className="zbtn-or" style={{ flex: 2, padding: "13px", fontSize: "12px", justifyContent: "center", letterSpacing: "1px", borderRadius: "30px" }}>
                    CONTINUE TO PAYMENT →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "14px" }}>PAYMENT METHOD</div>
                <div style={{ border: "2px solid var(--or)", borderRadius: "8px", padding: "14px", background: "rgba(255, 92, 0, 0.1)", marginBottom: "8px", cursor: "pointer" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800 }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: "10px", color: "#8F9CAE", marginTop: "2px" }}>Pay when your order arrives</div>
                </div>
                <div style={{ border: "1.5px solid var(--bd-soft)", borderRadius: "8px", padding: "14px", marginBottom: "20px", cursor: "pointer" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#8F9CAE" }}>Online Payment (UPI / Cards)</div>
                  <div style={{ fontSize: "10px", color: "var(--mu)", marginTop: "2px" }}>Coming soon</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setStep(2)} className="zbtn-out" style={{ flex: 1, padding: "13px", justifyContent: "center", borderRadius: "30px" }}>← BACK</button>
                  <button onClick={handleOrder} disabled={loading} className="zbtn-or" style={{ flex: 2, padding: "13px", fontSize: "12px", justifyContent: "center", letterSpacing: "1px", borderRadius: "30px" }}>
                    {loading ? "PLACING ORDER..." : "PLACE ORDER →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="zcard" style={{ position: "sticky", top: "80px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "14px" }}>YOUR ORDER</div>
            {cart.map(item => (
              <div key={item.productId} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "6px", border: "1.5px solid var(--bd-soft)", background: "var(--dk-card)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {item.imageUrl ? <img src={item.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "14px" }}>🍊</span>}
                </div>
                <div style={{ flex: 1, fontSize: "11px", fontWeight: 600 }}>{item.name} ×{item.qty}</div>
                <span style={{ fontSize: "12px", fontWeight: 800 }}>₹{(item.price * item.qty).toFixed(0)}</span>
              </div>
            ))}
            <div className="zdiv" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}><span style={{ color: "#8F9CAE" }}>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, marginBottom: "10px" }}>
              <span style={{ color: "#8F9CAE" }}>Shipping</span>
              <span style={{ fontWeight: 800, color: shippingCost === 0 ? "var(--lm)" : "var(--wh)" }}>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
            </div>
            <div className="zdiv" />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.5px" }}>
              <span>TOTAL</span><span>₹{total.toFixed(0)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "14px", fontSize: "10px", color: "#8F9CAE", fontWeight: 700, justifyContent: "center" }}>
              <ShieldCheck size={13} /> SECURE CHECKOUT
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
