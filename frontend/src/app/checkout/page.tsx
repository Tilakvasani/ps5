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
    <main className="min-h-screen bg-[#F1FAFF]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <p className="text-2xl font-bold text-[#1D3557] mb-4">Your cart is empty</p>
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
        // Live settings — backend uses these for GST, shipping & invoice
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
          theme: { color: "#45B08C" },
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
    <main className="min-h-screen bg-[#F1FAFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <h1 className="text-4xl font-black text-[#1D3557] mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-[#45B08C] text-white" : "bg-white text-[#4A6A82]"}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-semibold ${i <= step ? "text-[#1D3557]" : "text-[#4A6A82]"}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#1D3557]/30 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-[#45B08C]" />
                    <h2 className="font-bold text-[#1D3557]">Delivery Address</h2>
                  </div>
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all ${selectedAddress === addr.id ? "border-[#45B08C] bg-[#45B08C]/10" : "border-[#C8DCEA]"}`}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#45B08C]" />
                      <div className="text-sm">
                        <p className="font-bold text-[#1D3557]">{addr.fullName}</p>
                        <p className="text-[#4A6A82]">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-[#4A6A82]">{addr.phone}</p>
                        {addr.gstin && <p className="text-xs text-[#45B08C] mt-1">GSTIN: {addr.gstin}</p>}
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setAddingAddr(!addingAddr)} className="flex items-center gap-2 text-sm text-[#45B08C] hover:text-[#45B08C] mt-2">
                    <Plus size={14} /> Add new address
                  </button>
                  {addingAddr && (
                    <div className="mt-4 space-y-3 border-t border-[#C8DCEA] pt-4">
                      {[["fullName","Full Name"],["phone","Phone"],["addressLine1","Address Line 1"],["city","City"],["state","State"],["pincode","Pincode"],["gstin","GSTIN (optional)"]].map(([k, label]) => (
                        <div key={k}>
                          <label className="text-xs text-[#4A6A82] mb-1 block">{label}</label>
                          <input type="text" value={(newAddr as any)[k]} onChange={(e) => setNewAddr(n => ({ ...n, [k]: e.target.value }))} className="input-field text-sm" placeholder={label} />
                        </div>
                      ))}
                      <button onClick={handleSaveAddress} className="btn-primary text-sm px-4 py-2">Save Address</button>
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
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-[#45B08C]" />
                    <h2 className="font-bold text-[#1D3557]">Payment Method</h2>
                  </div>
                  {[["razorpay","Razorpay (UPI, Card, Netbanking)","🔐"],["cod","Cash on Delivery","💵"]].map(([val, label, icon]) => (
                    <label key={val} className={`flex gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all ${paymentMethod === val ? "border-[#45B08C] bg-[#45B08C]/10" : "border-[#C8DCEA]"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === val as any} onChange={() => setPaymentMethod(val as any)} className="mt-1 accent-[#45B08C]" />
                      <div>
                        <span className="text-sm font-semibold text-[#1D3557]">{icon} {label}</span>
                        {val === "razorpay" && <p className="text-xs text-[#4A6A82] mt-0.5">Secure payments powered by Razorpay</p>}
                        {val === "cod" && <p className="text-xs text-[#4A6A82] mt-0.5">Pay when your order arrives</p>}
                      </div>
                    </label>
                  ))}
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-[#4A6A82] mb-2 block">Coupon Code (optional)</label>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input-field text-sm" placeholder="Enter coupon code" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline py-3 px-6">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card mb-4">
                  <h2 className="font-bold text-[#1D3557] mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                        <span className="text-[#4A6A82]">{item.name} × {item.qty}</span>
                        <span className="text-[#1D3557] font-semibold">₹{(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className={`card mb-4 border transition-all ${agreedToTerms ? "border-emerald-400/40 bg-emerald-50/30" : "border-[#C8DCEA]"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 accent-[#45B08C] h-4 w-4 shrink-0" />
                    <div className="text-sm text-[#4A6A82] leading-relaxed">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield size={14} className="text-[#45B08C] shrink-0" />
                        <span className="font-semibold text-[#1D3557]">I agree to the following policies</span>
                      </div>
                      I have read and agree to the{" "}
                      <Link href="/terms-of-service" target="_blank" className="text-[#45B08C] hover:underline font-medium">Terms & Conditions</Link>,{" "}
                      <Link href="/privacy-policy" target="_blank" className="text-[#45B08C] hover:underline font-medium">Privacy Policy</Link>, and{" "}
                      <Link href="/refund-policy" target="_blank" className="text-[#45B08C] hover:underline font-medium">Refund & Cancellation Policy</Link> of Zupwell.
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline py-3 px-6">← Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder} disabled={loading || !agreedToTerms}
                    className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Placing Order...</span>
                      : `Place Order · ₹${total.toFixed(0)}`}
                  </motion.button>
                </div>
                {!agreedToTerms && (
                  <p className="text-xs text-center text-[#7A9BB5] mt-2">Please agree to the policies above to place your order.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="card h-fit sticky top-24">
            <h2 className="font-bold text-[#1D3557] mb-4">Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-[#4A6A82]"><span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#4A6A82]"><span>CGST @{cgstPct}%</span><span>₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#4A6A82]"><span>SGST @{sgstPct}%</span><span>₹{sgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#4A6A82]">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-[#7A9BB5]">Free shipping on orders above ₹{freeShippingThreshold}</p>
              )}
              {roundOffDiff !== 0 && (
                <div className="flex justify-between text-[#7A9BB5] text-xs italic"><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
              )}
            </div>
            <div className="border-t border-[#C8DCEA] pt-4 flex justify-between items-center">
              <span className="font-bold text-[#1D3557]">Total</span>
              <span className="text-2xl font-black gradient-text">₹{total.toFixed(0)}</span>
            </div>
            <p className="text-xs text-[#4A6A82] mt-1">Inclusive of all taxes</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}