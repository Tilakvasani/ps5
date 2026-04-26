"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, CheckCircle, Plus } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { ordersApi, accountApi, paymentsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

const STEPS = ["Address", "Payment", "Review"];

export default function CheckoutPage() {
  const { cart, user, clearCart } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", addressLine1: "", city: "Ahmedabad", state: "Gujarat", pincode: "", gstin: "" });
  const [addingAddr, setAddingAddr] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + cgst + sgst + shipping;

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    accountApi.getAddresses().then(setAddresses).catch(() => {});
  }, [user, router]);

  if (cart.length === 0) return (
    <main className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <p className="text-2xl font-bold text-[#111827] mb-4">Your cart is empty</p>
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
    setLoading(true);
    try {
      const order = await ordersApi.create({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: cart.map(i => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
      });

      if (paymentMethod === "razorpay") {
        const rzp = await paymentsApi.createRazorpayOrder(order.id);
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzp.amount,
          currency: "INR",
          name: "Zupwell",
          description: `Order ${order.orderNumber}`,
          order_id: rzp.razorpayOrderId,
          handler: async (response: any) => {
            await paymentsApi.verify({ ...response, orderId: order.id });
            clearCart();
            toast.success("Payment successful! 🎉");
            router.push(`/order/${order.orderNumber}`);
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: "#F47C41" },
        };
        const Razorpay = (window as any).Razorpay;
        if (Razorpay) { new Razorpay(options).open(); }
        else { toast.error("Razorpay not loaded"); }
      } else {
        clearCart();
        toast.success("Order placed! You'll pay on delivery.");
        router.push(`/order/${order.orderNumber}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <h1 className="text-4xl font-display font-black text-[#111827] mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-[#F47C41] text-[#111827]" : "bg-[#FFFFFF] text-[#6B7280]"}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-semibold ${i <= step ? "text-[#111827]" : "text-[#6B7280]"}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#111827]/30 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-[#F47C41]" />
                    <h2 className="font-display font-bold text-[#111827]">Delivery Address</h2>
                  </div>
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all ${selectedAddress === addr.id ? "border-[#F47C41] bg-[#F47C41]/10" : "border-[#D9DEE8] hover:border-[#D9DEE8]"}`}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#F47C41]" />
                      <div className="text-sm">
                        <p className="font-bold text-[#111827]">{addr.fullName}</p>
                        <p className="text-[#374151]">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-[#6B7280]">{addr.phone}</p>
                        {addr.gstin && <p className="text-xs text-[#F47C41] mt-1">GSTIN: {addr.gstin}</p>}
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setAddingAddr(!addingAddr)} className="flex items-center gap-2 text-sm text-[#F47C41] hover:text-[#f79b6e] mt-2">
                    <Plus size={14} /> Add new address
                  </button>
                  {addingAddr && (
                    <div className="mt-4 space-y-3 border-t border-[#D9DEE8] pt-4">
                      {[["fullName", "Full Name"], ["phone", "Phone"], ["addressLine1", "Address Line 1"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"], ["gstin", "GSTIN (optional)"]].map(([k, label]) => (
                        <div key={k}>
                          <label className="text-xs text-[#6B7280] mb-1 block">{label}</label>
                          <input type="text" value={(newAddr as any)[k]} onChange={(e) => setNewAddr(n => ({ ...n, [k]: e.target.value }))}
                            className="input-field text-sm" placeholder={label} />
                        </div>
                      ))}
                      <button onClick={handleSaveAddress} className="btn-primary text-sm px-4 py-2">Save Address</button>
                    </div>
                  )}
                </div>
                <button onClick={() => { if (!selectedAddress) { toast.error("Select an address"); return; } setStep(1); }}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-[#F47C41]" />
                    <h2 className="font-display font-bold text-[#111827]">Payment Method</h2>
                  </div>
                  {[["razorpay", "Razorpay (UPI, Card, Netbanking)", "🔐"], ["cod", "Cash on Delivery", "💵"]].map(([val, label, icon]) => (
                    <label key={val} className={`flex gap-3 p-4 rounded-xl border cursor-pointer mb-3 transition-all ${paymentMethod === val ? "border-[#F47C41] bg-[#F47C41]/10" : "border-[#D9DEE8] hover:border-[#D9DEE8]"}`}>
                      <input type="radio" name="payment" checked={paymentMethod === val as any} onChange={() => setPaymentMethod(val as any)} className="mt-1 accent-[#F47C41]" />
                      <div>
                        <span className="text-sm font-semibold text-[#111827]">{icon} {label}</span>
                        {val === "razorpay" && <p className="text-xs text-[#6B7280] mt-0.5">Secure payments powered by Razorpay</p>}
                        {val === "cod" && <p className="text-xs text-[#6B7280] mt-0.5">Pay when your order arrives</p>}
                      </div>
                    </label>
                  ))}
                  <div className="mt-4">
                    <label className="text-sm font-semibold text-[#374151] mb-2 block">Coupon Code (optional)</label>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input-field text-sm flex-1" placeholder="Enter coupon" />
                    </div>
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
                  <h2 className="font-display font-bold text-[#111827] mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                        <span className="text-[#374151]">{item.name} × {item.qty}</span>
                        <span className="text-[#111827] font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline py-3 px-6">← Back</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePlaceOrder} disabled={loading}
                    className="btn-primary flex-1 py-3 disabled:opacity-50">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-[#D9DEE8] border-t-transparent animate-spin" />Placing Order...</span> : `Place Order · ₹${total.toFixed(2)}`}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className="card h-fit sticky top-24">
            <h2 className="font-display font-bold text-[#111827] mb-4">Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-[#374151]"><span>Subtotal ({cart.length} items)</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#374151]"><span>CGST @2.5%</span><span>₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#374151]"><span>SGST @2.5%</span><span>₹{sgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#374151]"><span>Shipping</span><span>{shipping === 0 ? <span className="text-emerald-400">FREE</span> : `₹${shipping}`}</span></div>
            </div>
            <div className="border-t border-[#D9DEE8] pt-4 flex justify-between items-center">
              <span className="font-display font-bold text-[#111827]">Total</span>
              <span className="text-2xl font-display font-black gradient-text">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">Inclusive of all taxes</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
