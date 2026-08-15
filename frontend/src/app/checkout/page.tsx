"use client";
import { useSettings, calcShipping } from "@/lib/useSettings";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, CheckCircle, Plus, Shield, Trash2, X, Zap } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore, SRAddress } from "@/lib/store";
import { ordersApi, accountApi, paymentsApi } from "@/lib/api";
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

// ── Address card ──────────────────────────────────────────────────────────────
type AnyAddress = { id: number | string; fullName: string; phone: string; addressLine1: string; addressLine2?: string | null; city: string; state: string; pincode: string; gstin?: string | null; label?: string; source?: string; isDefault?: boolean; };

function AddressCard({ addr, selected, onSelect, onDelete }: {
  addr: AnyAddress; selected: boolean; onSelect: () => void; onDelete?: () => void;
}) {
  const isVault = addr.source === "shiprocket";
  return (
    <div className="relative group">
      <label style={{
        display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
        border: selected ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
        background: selected ? "rgba(255,92,0,0.08)" : "transparent",
      }}>
        <input type="radio" name="address" checked={selected} onChange={onSelect} className="mt-1 accent-[#FF5C00]" />
        <div className="text-sm flex-1 pr-8">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p style={{ fontWeight: 700, color: "#0C1E39" }}>{addr.fullName}</p>
            {addr.label && <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{addr.label}</span>}
            {isVault && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <Zap size={9} /> Shiprocket
              </span>
            )}
          </div>
          <p style={{ color: "#4A5568" }}>{addr.addressLine1}</p>
          {addr.addressLine2 ? <p className="text-xs text-slate-500">Landmark: {addr.addressLine2}</p> : null}
          <p style={{ color: "#4A5568" }}>{addr.city}, {addr.state} – {addr.pincode}</p>
          <p style={{ color: "#4A5568" }}>📞 {addr.phone}</p>
          {addr.gstin && <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 4 }}>GSTIN: {addr.gstin}</p>}
        </div>
      </label>
      {onDelete && (
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm("Delete this address?")) onDelete();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          title="Delete address"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, user, clearCart, srAddresses } = useStore();
  const { freeShippingThreshold, defaultShippingCharge, cgstRate, sgstRate, siteName, raw: settingsRaw } = useSettings();
  const router = useRouter();

  const [step, setStep]                   = useState(0);
  const [dbAddresses, setDbAddresses]     = useState<any[]>([]);
  const [selectedId, setSelectedId]       = useState<number | string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [couponCode, setCouponCode]       = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [addingAddr, setAddingAddr]       = useState(false);

  // Merge Shiprocket vault + local DB addresses, de-duping by phone+pincode
  const allAddresses: AnyAddress[] = [
    // Shiprocket vault addresses (shown first)
    ...srAddresses.map((a) => ({ ...a, id: a.id } as AnyAddress)),
    // Local DB addresses (filter out any that exactly match a vault entry by phone+pincode)
    ...dbAddresses.filter((d) =>
      !srAddresses.some((s) => s.phone === d.phone && s.pincode === d.pincode)
    ),
  ];

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
      setCouponDiscount(data.discountAmount || subtotal * (data.discountPercent / 100));
      setCouponApplied(true);
      toast.success(`Coupon applied! ${data.discountPercent || 0}% off`);
    } catch (err: any) { toast.error(err.message || "Invalid coupon code"); }
  };

  const hydrated = useHydrated();
  const token    = useStore((s) => s.token);

  useEffect(() => {
    if (!hydrated) return;
    if (!user && !token) { router.push("/login?next=/checkout"); return; }
    accountApi.getAddresses()
      .then((list) => {
        setDbAddresses(list);
        // Auto-select: default Shiprocket vault address, or first DB address
        if (!selectedId) {
          const defaultVault = srAddresses.find((a) => a.isDefault);
          if (defaultVault) { setSelectedId(defaultVault.id); return; }
          if (srAddresses.length > 0) { setSelectedId(srAddresses[0].id); return; }
          if (list.length > 0) setSelectedId(list[0].id);
        }
      })
      .catch(() => {});
  }, [hydrated, user, token, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = new URLSearchParams(window.location.search).get("coupon") || "";
      if (code) { setCouponCode(code); validateAndApplyCoupon(code); }
    }
  }, [subtotal]);

  // Auto-select first vault address when srAddresses load
  useEffect(() => {
    if (srAddresses.length > 0 && !selectedId) {
      const def = srAddresses.find((a) => a.isDefault) || srAddresses[0];
      setSelectedId(def.id);
    }
  }, [srAddresses]);

  if (cart.length === 0) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Your cart is empty</p>
        <Link href="/products"><button className="btn-primary px-6 py-3">Shop Now</button></Link>
      </div>
    </main>
  );

  /**
   * Ensure we have a numeric DB address ID before placing an order.
   * If the user selected a Shiprocket vault address (string "sr_xxx"), we
   * save it to our DB first so orders always reference a proper DB row.
   */
  const resolveAddressId = async (): Promise<number | null> => {
    if (typeof selectedId === "number") return selectedId;

    // Shiprocket vault address – save to DB
    const srAddr = srAddresses.find((a) => a.id === selectedId);
    if (!srAddr) return null;

    try {
      const saved = await accountApi.addAddress({
        fullName    : srAddr.fullName,
        phone       : srAddr.phone,
        addressLine1: srAddr.addressLine1,
        addressLine2: srAddr.addressLine2 || null,
        city        : srAddr.city,
        state       : srAddr.state,
        pincode     : srAddr.pincode,
        label       : srAddr.label || "home",
      });
      setDbAddresses((prev) => [...prev, saved]);
      setSelectedId(saved.id); // switch to numeric ID for future use
      return saved.id;
    } catch {
      toast.error("Could not save address. Please add it manually.");
      return null;
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedId) return toast.error("Please select a delivery address");
    // If it's a vault address, pre-save silently (non-blocking for UX)
    if (typeof selectedId === "string") {
      setLoading(true);
      const id = await resolveAddressId();
      setLoading(false);
      if (!id) return;
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) { toast.error("Please agree to the Terms, Privacy and Refund Policy to continue."); return; }
    setLoading(true);
    try {
      const addressId = await resolveAddressId();
      if (!addressId) { setLoading(false); return; }

      const order = await ordersApi.create({
        addressId,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: cart.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, pack: i.pack || 1 })),
        cgstRate,
        sgstRate,
        shippingCharge: shipping,
        freeShippingThreshold,
      });

      if (paymentMethod === "razorpay") {
        await loadRazorpay();
        const rzp = await paymentsApi.createRazorpayOrder(order.id);
        const key = rzp.keyId || settingsRaw["razorpay_key_id"] || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) { toast.error("Razorpay Key ID is missing."); setLoading(false); return; }
        if (!rzp.razorpayOrderId) { toast.error("Failed to create Razorpay order."); setLoading(false); return; }

        const options = {
          key,
          amount     : rzp.amount,
          currency   : "INR",
          name       : siteName || process.env.NEXT_PUBLIC_SITE_NAME || "Zupwell",
          description: `Order ${order.orderNumber}`,
          image      : "https://zupwell.com/zupwell-logo.png",
          order_id   : rzp.razorpayOrderId,
          handler    : async (response: any) => {
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
          theme  : { color: "#FF5C00" },
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

            {/* ── Step 0: Address ─────────────────────────────────────────────── */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 items-start max-w-xl">
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
                        <Plus size={14} /> Add New
                      </button>
                    </div>

                    {/* Shiprocket vault banner */}
                    {srAddresses.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl mb-3">
                        <Zap size={13} className="text-indigo-500 shrink-0" />
                        <p className="text-[11px] font-semibold text-indigo-700">Your saved addresses from Shiprocket have been pre-filled for faster checkout.</p>
                      </div>
                    )}

                    <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {allAddresses.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <MapPin size={32} className="mx-auto mb-2 opacity-30 text-[var(--or)]" />
                          <p className="text-xs font-semibold">No saved addresses found</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add New" above to set your delivery location.</p>
                        </div>
                      ) : (
                        allAddresses.map((addr) => (
                          <AddressCard
                            key={String(addr.id)}
                            addr={addr}
                            selected={selectedId === addr.id}
                            onSelect={() => setSelectedId(addr.id)}
                            onDelete={addr.source !== "shiprocket" ? async () => {
                              try {
                                await accountApi.deleteAddress(addr.id as number);
                                const updated = dbAddresses.filter((a) => a.id !== addr.id);
                                setDbAddresses(updated);
                                if (selectedId === addr.id) setSelectedId(allAddresses.find((a) => a.id !== addr.id)?.id || null);
                                toast.success("Address deleted");
                              } catch (err: any) { toast.error(err.message || "Failed to delete"); }
                            } : undefined}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Address Modal */}
                  {addingAddr && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-[var(--or)]" />
                            <h3 className="font-extrabold text-slate-900 text-base">Add Delivery Address</h3>
                          </div>
                          <button type="button" onClick={() => setAddingAddr(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                            <X size={18} />
                          </button>
                        </div>
                        <AddressForm
                          onSave={async (payload) => {
                            try {
                              const created = await accountApi.addAddress(payload);
                              setDbAddresses((prev) => [...prev, created]);
                              setSelectedId(created.id);
                              setAddingAddr(false);
                              toast.success("Address saved!");
                            } catch (err: any) { toast.error(err.message || "Failed to save address"); }
                          }}
                          onCancel={() => setAddingAddr(false)}
                          submitText="Save Address & Continue"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleContinueToPayment}
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Saving address..." : <><span>Continue to Payment</span><ChevronRight size={16} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Payment ──────────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} style={{ color: "var(--or)" }} />
                    <h2 style={{ fontWeight: 700, color: "#0C1E39" }}>Choose a Payment Method</h2>
                  </div>

                  <label style={{
                    display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s",
                    border: paymentMethod === "razorpay" ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                    background: paymentMethod === "razorpay" ? "rgba(255,92,0,0.08)" : "transparent",
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="mt-1 accent-[#FF5C00]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <img src="/razorpay.png" alt="Razorpay" className="h-6 w-auto object-contain" />
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Free Shipping</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Secure online payments via UPI, Cards, Net Banking, and Wallets.</p>
                    </div>
                  </label>

                  <label style={{
                    display: "flex", gap: 12, padding: 16, borderRadius: 12, cursor: "pointer", marginBottom: 12, transition: "all 0.2s",
                    border: paymentMethod === "cod" ? "1.5px solid var(--or)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                    background: paymentMethod === "cod" ? "rgba(255,92,0,0.08)" : "transparent",
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1 accent-[#FF5C00]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0C1E39" }}>
                          <CodTruckIcon className="h-5 w-5 text-[#0C1E39]" /> Cash on Delivery
                        </span>
                        {subtotal >= freeShippingThreshold
                          ? <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Free Shipping</span>
                          : <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">₹{defaultShippingCharge} Delivery Fee</span>
                        }
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>Pay when your order is delivered.</p>
                    </div>
                  </label>

                  <div className="mt-4">
                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0C1E39", marginBottom: 8, display: "block" }}>Have a Coupon Code?</label>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                        className="input text-sm flex-1" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#F8F8F8" }} placeholder="Enter coupon code" />
                      <button type="button" onClick={() => validateAndApplyCoupon(couponCode)} className="btn-primary text-sm px-4 py-2 flex-shrink-0" style={{ height: "42px", borderRadius: "10px" }}>Apply</button>
                    </div>
                    {couponApplied && <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 8 }}>✓ Coupon applied!</p>}
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

            {/* ── Step 2: Review ───────────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Order Items</h2>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                        <span style={{ color: "#4A5568" }}>{item.name} × {item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: "#FFFFFF", borderRadius: 10, padding: 20, marginBottom: 16, transition: "all 0.2s",
                  border: agreedToTerms ? "1.5px solid rgba(52,211,153,0.4)" : "1.5px solid rgba(12, 30, 57, 0.08)",
                  boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)",
                }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 accent-[#FF5C00] h-4 w-4 shrink-0" />
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
                {!agreedToTerms && <p style={{ fontSize: "0.75rem", textAlign: "center", color: "#6B7280", marginTop: 8 }}>Please agree to the policies above to place your order.</p>}
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          {step > 0 && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }} className="h-fit sticky top-24">
              <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>Subtotal ({cart.length} {cart.length !== 1 ? "Items" : "Item"})</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>CGST ({cgstPct}%)</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>SGST ({sgstPct}%)</span><span>₹{sgst.toFixed(2)}</span></div>
                <p style={{ fontSize: "0.7rem", color: "#6B7280", fontStyle: "italic" }}>Taxes calculated as per applicable regulations.</p>
                <div className="flex justify-between" style={{ color: "#4A5568" }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-500 font-semibold">FREE</span> : `₹${shipping}`}</span>
                </div>
                {discount > 0 && <div className="flex justify-between" style={{ color: "var(--or)", fontWeight: 600 }}><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                {paymentMethod === "razorpay"
                  ? <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>Free shipping applied</p>
                  : shipping > 0
                    ? <p style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.5 }}><span style={{ color: "#F43F5E" }}>COD includes ₹{shipping} delivery fee.</span><br /><span style={{ color: "#10B981" }}>Choose online payment for free shipping.</span></p>
                    : <p style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>Free shipping applied!</p>
                }
                {roundOffDiff !== 0 && <div className="flex justify-between text-xs italic" style={{ color: "#6B7280" }}><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>}
              </div>
              <div style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#0C1E39" }}>Total Payable</span>
                <span className="text-2xl font-black gradient-text">₹{total.toFixed(0)}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4 }}>Includes all applicable taxes</p>
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col items-center justify-center">
                <img src="/100-secure-payment.png" alt="100% Secure Payment" className="h-24 sm:h-28 w-auto max-w-[240px] object-contain mx-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
