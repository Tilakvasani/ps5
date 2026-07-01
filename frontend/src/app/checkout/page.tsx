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

const STEPS = ["Address Selection", "Payment Method", "Order Review"];

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
  const shipping = calcShipping(subtotal, freeShippingThreshold, defaultShippingCharge);
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
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <p className="font-display text-2xl font-bold text-[#002A30] mb-4">Your cart is empty</p>
        <Link href="/products">
          <button className="btn-primary px-6 py-3 font-sans text-xs uppercase tracking-wider font-bold">Shop Now</button>
        </Link>
      </div>
    </main>
  );

  const handleSaveAddress = async () => {
    if (!newAddr.fullName || !newAddr.phone || !newAddr.addressLine1 || !newAddr.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }
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
        const options = {
          key: settingsRaw["razorpay_key_id"] || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
          theme: { color: "#48C062" },
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
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-black text-[#002A30] mb-8">Checkout</h1>

        {/* Stepper bubbles */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? "bg-[#48C062] text-white shadow-sm" : "bg-white border border-[#E8E2D9] text-[#45353E]"}`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`font-sans text-xs uppercase tracking-wider font-bold ${i <= step ? "text-[#002A30]" : "text-[#8C8276]"}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={12} className="text-[#8C8276] mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content forms columns */}
          <div className="lg:col-span-8 space-y-6">

            {/* Step 0: Address Selection */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="card bg-white border border-[#E8E2D9] shadow-soft">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#E8E2D9]/40 pb-3">
                    <MapPin size={16} className="text-[#48C062]" />
                    <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider">Select Delivery Address</h2>
                  </div>
                  
                  {addresses.length === 0 && !addingAddr && (
                    <p className="text-xs text-[#8C8276] font-semibold uppercase tracking-wider mb-4">No addresses saved. Please add a new delivery address.</p>
                  )}

                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`flex gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddress === addr.id ? "border-[#48C062] bg-[#48C062]/5 shadow-sm" : "border-[#E8E2D9] bg-[#FCFAF6] hover:border-[#48C062]/20"}`}>
                        <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#48C062]" />
                        <div className="text-xs font-semibold text-[#45353E] uppercase tracking-wider space-y-1">
                          <p className="font-bold text-[#002A30] text-sm capitalize">{addr.fullName}</p>
                          <p className="leading-relaxed">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-[#8C8276]">Phone: {addr.phone}</p>
                          {addr.gstin && <p className="text-[#48C062] font-bold">GSTIN: {addr.gstin}</p>}
                        </div>
                      </label>
                    ))}
                  </div>

                  <button onClick={() => setAddingAddr(!addingAddr)} className="flex items-center gap-1.5 text-xs font-bold text-[#48C062] uppercase tracking-wider mt-4">
                    <Plus size={14} strokeWidth={2.5} /> Add New Address
                  </button>

                  {addingAddr && (
                    <div className="mt-6 space-y-4 border-t border-[#E8E2D9]/40 pt-6">
                      {[
                        ["fullName","Full Name"],
                        ["phone","Phone Number"],
                        ["addressLine1","Address Details"],
                        ["city","City"],
                        ["state","State"],
                        ["pincode","Pincode"],
                        ["gstin","GSTIN (optional)"]
                      ].map(([k, label]) => (
                        <div key={k}>
                          <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">{label}</label>
                          <input type="text" value={(newAddr as any)[k]} onChange={(e) => setNewAddr(n => ({ ...n, [k]: e.target.value }))} className="input-field text-xs font-semibold rounded-xl" placeholder={label} />
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button onClick={handleSaveAddress} className="btn-primary text-xs font-bold uppercase tracking-wider py-2.5 px-6">Save Address</button>
                        <button onClick={() => setAddingAddr(false)} className="btn-outline text-xs font-bold uppercase tracking-wider py-2.5 px-6">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button onClick={() => { if (!selectedAddress) { toast.error("Select an address"); return; } setStep(1); }} className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                  Continue to Payment <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Step 1: Payment Method */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="card bg-white border border-[#E8E2D9] shadow-soft">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#E8E2D9]/40 pb-3">
                    <CreditCard size={16} className="text-[#48C062]" />
                    <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider">Choose Payment Method</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      ["razorpay","Razorpay (UPI, Cards, Netbanking)","🔐"],
                      ["cod","Cash on Delivery","💵"]
                    ].map(([val, label, icon]) => (
                      <label key={val} className={`flex gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === val ? "border-[#48C062] bg-[#48C062]/5 shadow-sm" : "border-[#E8E2D9] bg-[#FCFAF6] hover:border-[#48C062]/20"}`}>
                        <input type="radio" name="payment" checked={paymentMethod === val as any} onChange={() => setPaymentMethod(val as any)} className="mt-1 accent-[#48C062]" />
                        <div className="text-xs font-semibold text-[#45353E] uppercase tracking-wider space-y-0.5">
                          <span className="text-sm font-bold text-[#002A30]">{icon} {label}</span>
                          {val === "razorpay" && <p className="text-[10px] text-[#8C8276] font-bold mt-1">Instant, 100% secure payments via Razorpay gateway</p>}
                          {val === "cod" && <p className="text-[10px] text-[#8C8276] font-bold mt-1">Pay with cash or digital scan when package is delivered</p>}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E8E2D9]/40">
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5 block">Apply Coupon Discount (optional)</label>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input-field text-xs font-semibold rounded-xl max-w-sm" placeholder="Enter coupon code" />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setStep(0)} className="btn-outline py-3.5 px-6 text-xs uppercase tracking-wider font-bold">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                    Review Order <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Order Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="card bg-white border border-[#E8E2D9] shadow-soft">
                  <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider border-b border-[#E8E2D9]/40 pb-3 mb-4">Review Order Items</h2>
                  <div className="divide-y divide-[#E8E2D9]/40">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between py-3 text-xs font-semibold text-[#45353E] uppercase tracking-wider">
                        <span className="truncate max-w-[240px]">{item.name} <span className="text-[#8C8276]">× {item.qty}</span></span>
                        <span className="text-[#002A30] font-bold">₹{(Number(item.price) * Number(item.qty)).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policies agreement card */}
                <div className={`card bg-white border p-6 rounded-3xl transition-all shadow-soft ${agreedToTerms ? "border-[#48C062]/30 bg-[#48C062]/5" : "border-[#E8E2D9]"}`}>
                  <label className="flex items-start gap-3.5 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 accent-[#48C062] h-4.5 w-4.5 shrink-0 rounded-lg" />
                    <div className="text-xs font-semibold text-[#45353E] leading-relaxed uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Shield size={14} className="text-[#48C062] shrink-0" />
                        <span className="font-bold text-[#002A30]">Agree to Store Policies</span>
                      </div>
                      I have read and agree to ZUPWELL's{" "}
                      <Link href="/terms-of-service" target="_blank" className="text-[#48C062] hover:underline font-bold">Terms & Conditions</Link>,{" "}
                      <Link href="/privacy-policy" target="_blank" className="text-[#48C062] hover:underline font-bold">Privacy Policy</Link>, and{" "}
                      <Link href="/refund-policy" target="_blank" className="text-[#48C062] hover:underline font-bold">Refund & Cancellation Policy</Link>.
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-outline py-3.5 px-6 text-xs uppercase tracking-wider font-bold">← Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder} disabled={loading || !agreedToTerms}
                    className="btn-primary flex-1 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-xs uppercase tracking-[0.15em] font-bold">
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Placing Order...</span>
                      : `Place Order · ₹${total.toFixed(0)}`}
                  </motion.button>
                </div>
                {!agreedToTerms && (
                  <p className="text-[10px] font-bold text-center text-[#8C8276] uppercase tracking-wider mt-2">Agree to store policies to enable checkout.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Right sticky sidebar order summary */}
          <div className="lg:col-span-4">
            <div className="card h-fit sticky top-28 bg-white border border-[#E8E2D9] shadow-soft p-6">
              <h2 className="font-display font-bold text-lg text-[#002A30] mb-5 border-b border-[#E8E2D9]/40 pb-3 uppercase tracking-wider">Summary</h2>
              
              <div className="space-y-2.5 text-xs font-semibold text-[#8C8276] uppercase tracking-wider border-b border-[#E8E2D9]/40 pb-4 mb-4">
                <div className="flex justify-between"><span>Subtotal ({cart.length} items)</span><span className="text-[#002A30] font-bold">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>CGST @{cgstPct}%</span><span className="text-[#002A30] font-bold">₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @{sgstPct}%</span><span className="text-[#002A30] font-bold">₹{sgst.toFixed(2)}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#48C062] font-bold">FREE</span> : <span className="text-[#002A30] font-bold">₹{shipping}</span>}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] font-bold lowercase tracking-wider text-[#8C8276]">Free delivery on orders above ₹{freeShippingThreshold}</p>
                )}
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-[11px] italic"><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider">Total Amount</span>
                <span className="text-xl font-black text-[#48C062]">₹{total.toFixed(0)}</span>
              </div>
              <p className="text-[9px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mt-1 text-right">GST Inclusive</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
