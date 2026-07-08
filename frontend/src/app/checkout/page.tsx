"use client";
import { useSettings, calcShipping } from "@/lib/useSettings";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, CheckCircle, Plus, Shield } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { ordersApi, accountApi, paymentsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

const STEPS = ["Address", "Payment", "Review"];

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay. Please refresh the page."));
    document.body.appendChild(s);
  });
}

async function retryAsync(fn: () => Promise<void>, times = 3, delay = 600): Promise<boolean> {
  for (let i = 0; i < times; i++) {
    try { await fn(); return true; } catch {
      if (i < times - 1) await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  return false;
}

export default function CheckoutPage() {
  const { cart, user, clearCart } = useStore();
  const { freeShippingThreshold, defaultShippingCharge, cgstRate, sgstRate, gstin, stateCode, siteName, raw: settingsRaw } = useSettings();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", addressLine1: "", city: "Ahmedabad", state: "Gujarat", pincode: "", gstin: "" });
  const [addingAddr, setAddingAddr] = useState(false);

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const cgst     = subtotal * cgstRate;
  const sgst     = subtotal * sgstRate;
  const shipping = paymentMethod === "razorpay" ? 0 : calcShipping(subtotal, freeShippingThreshold, defaultShippingCharge);
  const rawTotal = subtotal + cgst + sgst + shipping;
  const total    = Math.round(rawTotal);
  const roundOffDiff = total - rawTotal;
  const cgstPct  = (cgstRate * 100).toFixed(1);
  const sgstPct  = (sgstRate * 100).toFixed(1);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    accountApi.getAddresses()
      .then(setAddresses)
      .catch(() => toast.error("Could not load your addresses. Please refresh."));
  }, [user, router]);

  if (cart.length === 0) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Your cart is empty</p>
        <Link href="/products"><button className="btn-primary px-6 py-3">Shop Now</button></Link>
      </div>
    </main>
  );

  const handleSaveAddress = async () => {
    try {
      const addr = await accountApi.addAddress(newAddr);
      setAddresses([...addresses, addr]);
      setSelectedAddress(addr.id);
      setAddingAddr(false);
      toast.success("Address saved!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    if (!agreedToTerms) { toast.error("Please agree to the Terms, Privacy and Refund Policy to continue."); return; }
    setLoading(true);
    try {
      const order = await ordersApi.create({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: cart.map(i => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
        cgstRate,
        sgstRate,
        shippingCharge: shipping,
        freeShippingThreshold,
      });

      if (paymentMethod === "razorpay") {
        await loadRazorpay();
        const rzp = await paymentsApi.createRazorpayOrder(order.id);
        
        const key = rzp.keyId || settingsRaw["razorpay_key_id"] || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
          toast.error("Razorpay Key ID is missing. Please set it in your environment variables or settings.");
          setLoading(false);
          return;
        }
        if (!rzp.razorpayOrderId) {
          toast.error("Failed to initialize payment order with Razorpay.");
          setLoading(false);
          return;
        }

        const options = {
          key,
          amount: rzp.amount,
          currency: "INR",
          name: siteName || process.env.NEXT_PUBLIC_SITE_NAME || "Zupwell",
          description: `Order ${order.orderNumber}`,
          order_id: rzp.razorpayOrderId,
          handler: async (response: any) => {
            try {
              await paymentsApi.verify({ ...response, orderId: order.id });
              clearCart();
              toast.success("Payment successful! 🎉");
              router.push(`/order/${order.orderNumber}`);
            } catch {
              await retryAsync(() => ordersApi.cancel(order.id));
              toast.error("Payment verification failed. Please try again.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async () => {
              const cancelled = await retryAsync(() => ordersApi.cancel(order.id));
              toast.error(cancelled
                ? "Payment cancelled. Your order has been removed."
                : "Payment cancelled. Contact support if a pending order appears.");
              setLoading(false);
            },
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#FF5C00" },
        };
        new (window as any).Razorpay(options).open();
      } else {
        clearCart();
        toast.success("Order placed! You'll pay on delivery.");
        router.push(`/order/${order.orderNumber}`);
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Order failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0C1E39", marginBottom: 32 }}>Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div style={{
                height: 32, width: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.875rem", fontWeight: 700, transition: "all 0.2s",
                background: i <= step ? "var(--or)" : "#FFFFFF",
                color: i <= step ? "#FFFFFF" : "#0C1E39",
                border: i <= step ? "none" : "1.5px solid rgba(12, 30, 57, 0.08)",
              }}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: i <= step ? "#0C1E39" : "#6B7280" }}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} style={{ color: "rgba(12,30,57,0.2)", margin: "0 8px" }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} style={{ color: "var(--or)" }} />
                    <h2 style={{ fontWeight: 700, color: "#0C1E39" }}>Delivery Address</h2>
                  </div>
                  {addresses.map((addr) => (
                    <label key={addr.id} style={{
                      display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s",
                      border: selectedAddress === addr.id ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                      background: selectedAddress === addr.id ? "rgba(255,92,0,0.08)" : "transparent",
                    }}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#FF5C00]" />
                      <div className="text-sm">
                        <p style={{ fontWeight: 700, color: "#0C1E39" }}>{addr.fullName}</p>
                        <p style={{ color: "#4A5568" }}>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p style={{ color: "#4A5568" }}>{addr.phone}</p>
                        {addr.gstin && <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 4 }}>GSTIN: {addr.gstin}</p>}
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setAddingAddr(!addingAddr)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "var(--or)", marginTop: 8 }}>
                    <Plus size={14} /> Add new address
                  </button>
                  {addingAddr && (
                    <div style={{ marginTop: 16, borderTop: "1.5px solid rgba(12, 30, 57, 0.08)", paddingTop: 16 }} className="space-y-3">
                      {[["fullName","Full Name"],["phone","Phone"],["addressLine1","Address Line 1"],["city","City"],["state","State"],["pincode","Pincode"],["gstin","GSTIN (optional)"]].map(([k, label]) => (
                        <div key={k}>
                          <label style={{ fontSize: "0.75rem", color: "#0C1E39", marginBottom: 4, display: "block" }}>{label}</label>
                          <input type="text" value={(newAddr as any)[k]} onChange={(e) => setNewAddr(n => ({ ...n, [k]: e.target.value }))} className="input text-sm w-full" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#F8F8F8" }} placeholder={label} />
                        </div>
                      ))}
                      <button onClick={handleSaveAddress} className="btn-primary text-sm px-4 py-2 mt-2">Save Address</button>
                    </div>
                  )}
                </div>
                <button onClick={() => { if (!selectedAddress) { toast.error("Select an address"); return; } setStep(1); }} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} style={{ color: "var(--or)" }} />
                    <h2 style={{ fontWeight: 700, color: "#0C1E39" }}>Payment Method</h2>
                  </div>
                  {[["razorpay","Razorpay (UPI, Card, Netbanking)","🔐"],["cod","Cash on Delivery","💵"]].map(([val, label, icon]) => (
                    <label key={val} style={{
                      display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s",
                      border: paymentMethod === val ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                      background: paymentMethod === val ? "rgba(255,92,0,0.08)" : "transparent",
                    }}>
                      <input type="radio" name="payment" checked={paymentMethod === val as any} onChange={() => setPaymentMethod(val as any)} className="mt-1 accent-[#FF5C00]" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0C1E39" }}>{icon} {label}</span>
                          {val === "razorpay" ? (
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">FREE SHIPPING</span>
                          ) : (
                            subtotal >= freeShippingThreshold ? (
                              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">FREE SHIPPING</span>
                            ) : (
                              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">+₹{defaultShippingCharge} Shipping</span>
                            )
                          )}
                        </div>
                        {val === "razorpay" && <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Secure payments powered by Razorpay. Save on shipping!</p>}
                        {val === "cod" && <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Pay when your order arrives. Get free shipping by paying online!</p>}
                      </div>
                    </label>
                  ))}
                  <div className="mt-4">
                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0C1E39", marginBottom: 8, display: "block" }}>Coupon Code (optional)</label>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input text-sm w-full" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#F8F8F8" }} placeholder="Enter coupon code" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline py-3 px-6" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Order Items</h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                        <span style={{ color: "#4A5568" }}>{item.name} × {item.qty}</span>
                        <span style={{ color: "#0C1E39", fontWeight: 600 }}>₹{(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div style={{
                  background: "#FFFFFF", borderRadius: 10, padding: 20, marginBottom: 16, transition: "all 0.2s",
                  border: agreedToTerms ? "1.5px solid rgba(52,211,153,0.4)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                  boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)",
                }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 accent-[#FF5C00] h-4 w-4 shrink-0" />
                    <div style={{ fontSize: "0.875rem", color: "#4A5568", lineHeight: 1.6 }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield size={14} style={{ color: "var(--or)", flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: "#0C1E39" }}>I agree to the following policies</span>
                      </div>
                      I have read and agree to the{" "}
                      <Link href="/terms-of-service" target="_blank" style={{ color: "var(--or)", fontWeight: 500 }} className="hover:underline">Terms &amp; Conditions</Link>,{" "}
                      <Link href="/privacy-policy" target="_blank" style={{ color: "var(--or)", fontWeight: 500 }} className="hover:underline">Privacy Policy</Link>, and{" "}
                      <Link href="/refund-policy" target="_blank" style={{ color: "var(--or)", fontWeight: 500 }} className="hover:underline">Refund &amp; Cancellation Policy</Link> of Zupwell.
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline py-3 px-6" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>← Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder} disabled={loading || !agreedToTerms}
                    className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                       ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Placing Order...</span>
                      : `Place Order · ₹${total.toFixed(0)}`}
                  </motion.button>
                </div>
                {!agreedToTerms && (
                  <p style={{ fontSize: "0.75rem", textAlign: "center", color: "#6B7280", marginTop: 8 }}>Please agree to the policies above to place your order.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }} className="h-fit sticky top-24">
            <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between" style={{ color: "#4A5568" }}><span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ color: "#4A5568" }}><span>CGST @{cgstPct}%</span><span>₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ color: "#4A5568" }}><span>SGST @{sgstPct}%</span><span>₹{sgst.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ color: "#4A5568" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
              </div>
              {paymentMethod === "razorpay" ? (
                <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>Prepaid Promo: Free Shipping applied!</p>
              ) : (
                shipping > 0 ? (
                  <p style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 500 }}>
                    COD Order: Shipping charge of ₹{shipping} applies. (Pay online for FREE shipping!)
                  </p>
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>
                    COD Order: Free shipping applied (above ₹{freeShippingThreshold})!
                  </p>
                )
              )}
              {roundOffDiff !== 0 && (
                <div className="flex justify-between text-xs italic" style={{ color: "#6B7280" }}><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
              )}
            </div>
            <div style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#0C1E39" }}>Total</span>
              <span className="text-2xl font-black gradient-text">₹{total.toFixed(0)}</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4 }}>Inclusive of all taxes</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
