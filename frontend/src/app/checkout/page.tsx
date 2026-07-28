"use client";
import { useSettings, calcShipping } from "@/lib/useSettings";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, CheckCircle, Plus, Shield, Trash2, X } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import api, { ordersApi, accountApi, paymentsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import AddressForm from "@/components/storefront/AddressForm";

import { useHydrated } from "@/lib/useHydrated";

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

function CodTruckIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <rect x="28" y="84" width="290" height="230" rx="14" stroke="currentColor" strokeWidth="22" fill="none" />
      <text x="173" y="222" fontSize="105" fontWeight="900" textAnchor="middle" fill="currentColor" fontFamily="system-ui, sans-serif" letterSpacing="4">COD</text>
      <path d="M318 184H406C430 184 454 204 462 228L482 280V314H318V184Z" stroke="currentColor" strokeWidth="22" strokeLinejoin="round" fill="none" />
      <path d="M366 208H418C428 208 438 216 442 228L452 258H366V208Z" fill="currentColor" opacity="0.25" />
      <path d="M28 350H484" stroke="currentColor" strokeWidth="22" strokeLinecap="round" />
      <circle cx="130" cy="374" r="42" stroke="currentColor" strokeWidth="22" fill="white" />
      <circle cx="130" cy="374" r="16" fill="currentColor" />
      <circle cx="386" cy="374" r="42" stroke="currentColor" strokeWidth="22" fill="white" />
      <circle cx="386" cy="374" r="16" fill="currentColor" />
    </svg>
  );
}

function RazorpayOfficialLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.436 0L10.526 7.773L9.352 12.049L13.977 9.03L11.723 17.242L22.436 0Z" fill="#0C2454" />
      <path d="M9.68 14.153L5.532 16.862L6.667 12.729L3.747 14.635L0 28.319L8.261 22.925L9.68 14.153Z" fill="#0052CC" />
      <text x="26" y="19" fontSize="18" fontWeight="800" fill="#0C2454" fontFamily="Inter, sans-serif" letterSpacing="-0.6px">Razorpay</text>
    </svg>
  );
}

function RazorpayWatermarkIcon({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.436 0L10.526 7.773L9.352 12.049L13.977 9.03L11.723 17.242L22.436 0Z" fill="#0C2454" />
      <path d="M9.68 14.153L5.532 16.862L6.667 12.729L3.747 14.635L0 28.319L8.261 22.925L9.68 14.153Z" fill="#0052CC" />
    </svg>
  );
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
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", addressLine1: "", city: "Ahmedabad", state: "Gujarat", pincode: "", gstin: "" });
  const [addingAddr, setAddingAddr] = useState(false);
  const [backendMapsKey, setBackendMapsKey] = useState("");

  useEffect(() => {
    api.get("/api/address/maps-config")
      .then(r => { if (r.data?.apiKey) setBackendMapsKey(r.data.apiKey); })
      .catch(() => {});
  }, []);

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const discount = couponApplied ? couponDiscount : 0;
  const taxable  = Math.max(0, subtotal - discount);
  const cgst     = taxable * cgstRate;
  const sgst     = taxable * sgstRate;
  const shipping = paymentMethod === "razorpay" ? 0 : calcShipping(subtotal, freeShippingThreshold, defaultShippingCharge);
  const rawTotal = taxable + cgst + sgst + shipping;
  const total    = Math.round(rawTotal);
  const roundOffDiff = total - rawTotal;
  const cgstPct  = (cgstRate * 100).toFixed(1);
  const sgstPct  = (sgstRate * 100).toFixed(1);

  const validateAndApplyCoupon = async (code: string) => {
    if (!code.trim()) { toast.error("Enter a coupon code"); return; }
    try {
      const { cartApi } = await import("@/lib/api");
      const data = await cartApi.applyCoupon(code.trim());
      const calculatedDiscount = data.discountAmount || subtotal * (data.discountPercent / 100);
      setCouponDiscount(calculatedDiscount);
      setCouponApplied(true);
      toast.success(`Coupon applied! ${data.discountPercent || 0}% off`);
    } catch (err: any) {
      toast.error(err.message || "Invalid coupon code");
    }
  };

  const hydrated = useHydrated();
  const token = useStore((s) => s.token);

  useEffect(() => {
    if (!hydrated) return;
    if (!user && !token) { router.push("/login?next=/checkout"); return; }
    if (user || token) {
      accountApi.getAddresses()
        .then(setAddresses)
        .catch(() => toast.error("Could not load your addresses. Please refresh."));
    }
  }, [hydrated, user, token, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("coupon") || "";
      if (code) {
        setCouponCode(code);
        validateAndApplyCoupon(code);
      }
    }
  }, [subtotal]);

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
        items: cart.map(i => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, pack: i.pack || 1 })),
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
          image: "https://zupwell.com/zupwell-logo.png",
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

        <div className={`grid grid-cols-1 ${step > 0 ? "lg:grid-cols-3" : ""} gap-8`}>
          <div className={`${step > 0 ? "lg:col-span-2" : "w-full"} space-y-6`}>

            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left Side: Delivery Address */}
                  <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 12, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} style={{ color: "var(--or)" }} />
                        <h2 style={{ fontWeight: 700, color: "#0C1E39", fontSize: "1.05rem" }}>Delivery Address</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddingAddr(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C00] bg-[rgba(255,92,0,0.08)] hover:bg-[rgba(255,92,0,0.15)] border border-[rgba(255,92,0,0.2)] px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        <Plus size={14} /> Add New Address
                      </button>
                    </div>

                    {/* Scrollable Saved Addresses list */}
                    <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {addresses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <MapPin size={32} className="mx-auto mb-2 opacity-30 text-[var(--or)]" />
                          <p className="text-xs font-semibold">No saved addresses found</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add New Address" above to set your delivery location.</p>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr.id} className="relative group">
                            <label style={{
                              display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                              border: selectedAddress === addr.id ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                              background: selectedAddress === addr.id ? "rgba(255,92,0,0.08)" : "transparent",
                            }}>
                              <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-[#FF5C00]" />
                              <div className="text-sm flex-1 pr-8">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p style={{ fontWeight: 700, color: "#0C1E39" }}>{addr.fullName}</p>
                                  {addr.label && <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{addr.label}</span>}
                                </div>
                                <p style={{ color: "#4A5568" }}>{addr.addressLine1}</p>
                                {addr.addressLine2 ? <p className="text-xs text-slate-500">Landmark: {addr.addressLine2}</p> : null}
                                <p style={{ color: "#4A5568" }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p style={{ color: "#4A5568" }}>📞 {addr.phone}</p>
                                {addr.gstin && <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 4 }}>GSTIN: {addr.gstin}</p>}
                              </div>
                            </label>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this address?")) {
                                  try {
                                    await accountApi.deleteAddress(addr.id);
                                    const updated = addresses.filter(a => a.id !== addr.id);
                                    setAddresses(updated);
                                    if (selectedAddress === addr.id) {
                                      setSelectedAddress(updated[0]?.id || null);
                                    }
                                    toast.success("Address deleted");
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to delete address");
                                  }
                                }
                              }}
                              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100"
                              title="Delete address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Address Modal Dialog */}
                  {addingAddr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-[var(--or)]" />
                            <h3 className="font-extrabold text-slate-900 text-base">Add Delivery Address</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAddingAddr(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <AddressForm
                          onSave={async (payload) => {
                            try {
                              const created = await accountApi.addAddress(payload);
                              setAddresses(prev => [...prev, created]);
                              setSelectedAddress(created.id);
                              setAddingAddr(false);
                              toast.success("Address saved successfully!");
                            } catch (err: any) {
                              toast.error(err.message || "Failed to save address");
                            }
                          }}
                          onCancel={() => setAddingAddr(false)}
                          submitText="Save Address & Continue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Right Side: Real Google Maps Location & Address Verification */}
                  <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                    {(() => {
                      const activeAddr = addresses.find(a => a.id === selectedAddress);
                      const fullAddressString = activeAddr
                        ? `${activeAddr.addressLine1}, ${activeAddr.city}, ${activeAddr.state} ${activeAddr.pincode}, India`
                        : "";
                      const isPincodeValid = activeAddr ? /^\d{6}$/.test(activeAddr.pincode?.trim() || "") : false;
                      const isAddressValid = Boolean(activeAddr && activeAddr.addressLine1?.length >= 3 && activeAddr.city && activeAddr.state && isPincodeValid);
                      const googleMapsApiKey = backendMapsKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                      const mapEmbedSrc = googleMapsApiKey
                        ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(fullAddressString)}`
                        : `https://www.google.com/maps?q=${encodeURIComponent(fullAddressString)}&output=embed`;

                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin size={18} style={{ color: "var(--or)" }} />
                              <h3 style={{ fontWeight: 700, color: "#0C1E39", fontSize: "0.95rem" }}>Google Maps Verification</h3>
                            </div>
                            {selectedAddress ? (
                              isAddressValid ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                  ✓ Verified Address
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                                  ⚠️ Incomplete Address
                                </span>
                              )
                            ) : null}
                          </div>

                          {selectedAddress ? (
                            <div className="space-y-3">
                              {/* Real Interactive Google Maps Iframe Embed */}
                              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                                <iframe
                                  title="Google Maps Location Verification"
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  loading="lazy"
                                  allowFullScreen
                                  referrerPolicy="no-referrer-when-downgrade"
                                  src={mapEmbedSrc}
                                  className="w-full h-full"
                                />
                                <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow flex items-center gap-1.5 border border-white/20">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Live Google Maps Plot</span>
                                </div>
                              </div>

                              {/* Location & Dispatch Summary */}
                              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1.5 text-slate-600">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-slate-700">Pincode Status:</span>
                                  <span className={isPincodeValid ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                    {isPincodeValid ? `PIN ${activeAddr?.pincode} Valid` : "Check PIN Code"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-slate-700">Fulfillment Hub:</span>
                                  <span className="font-semibold text-slate-800">{activeAddr?.city || "Regional"} Logistics Center</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-slate-700">Delivery Status:</span>
                                  <span className="text-emerald-600 font-bold">Express Shipping Eligible</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-64 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                              <MapPin size={32} className="mb-2 opacity-50 text-[var(--or)]" />
                              <p className="text-xs font-semibold text-slate-600 mb-1">Live Google Maps Verification</p>
                              <p className="text-[11px] text-slate-400 max-w-xs">Select or add a delivery address on the left to display its live Google Maps pin and verification status.</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
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
                    <h2 style={{ fontWeight: 700, color: "#0C1E39" }}>Choose a Payment Method</h2>
                  </div>
                  <label style={{
                    display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s", position: "relative", overflow: "hidden",
                    border: paymentMethod === "razorpay" ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                    background: paymentMethod === "razorpay" ? "rgba(255,92,0,0.08)" : "transparent",
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="mt-1 accent-[#FF5C00]" />
                    <div className="flex-1 z-10">
                      <div className="flex justify-between items-center">
                        <img src="/razorpay.png" alt="Razorpay" className="h-6 w-auto object-contain" />
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Free Shipping</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Secure online payments via UPI, Cards, Net Banking, and Wallets.</p>
                    </div>
                  </label>

                  <label style={{
                    display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s", position: "relative",
                    border: paymentMethod === "cod" ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                    background: paymentMethod === "cod" ? "rgba(255,92,0,0.08)" : "transparent",
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1 accent-[#FF5C00]" />
                    <div className="flex-1 z-10">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0C1E39" }}>
                          <CodTruckIcon className="h-5 w-5 text-[#0C1E39]" />
                          Cash on Delivery
                        </span>
                        {subtotal >= freeShippingThreshold ? (
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Free Shipping</span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">₹{defaultShippingCharge} Delivery Fee</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Pay when your order is delivered.</p>
                    </div>
                  </label>

                  <div className="mt-4">
                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0C1E39", marginBottom: 8, display: "block" }}>Have a Coupon Code?</label>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input text-sm flex-1" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#F8F8F8" }} placeholder="Enter coupon code" />
                      <button type="button" onClick={() => validateAndApplyCoupon(couponCode)} className="btn-primary text-sm px-4 py-2 flex-shrink-0" style={{ height: "42px", borderRadius: "10px" }}>Apply</button>
                    </div>
                    {couponApplied && (
                      <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 8 }}>✓ Coupon applied successfully!</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline py-3 px-6" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>← Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    Continue to Review <ChevronRight size={16} />
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
          {step > 0 && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }} className="h-fit sticky top-24">
              <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>CGST @{cgstPct}%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>SGST @{sgstPct}%</span><span>₹{sgst.toFixed(2)}</span></div>
                <p style={{ fontSize: "0.7rem", color: "#6B7280", fontStyle: "italic", marginTop: 2, marginBottom: 4 }}>Taxes calculated as per applicable regulations.</p>
                <div className="flex justify-between" style={{ color: "#4A5568" }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between" style={{ color: "var(--or)", fontWeight: 600 }}>
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === "razorpay" ? (
                  <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>Free shipping applied</p>
                ) : (
                  shipping > 0 ? (
                    <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600, lineHeight: 1.5 }}>
                      COD orders include a ₹{shipping} delivery fee.<br />
                      Choose online payment to enjoy free shipping.
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>
                      Free shipping applied (above ₹{freeShippingThreshold})!
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
              <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4 }}>Includes all applicable taxes</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
