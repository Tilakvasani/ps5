"use client";
import { useSettings, calcShipping } from "@/lib/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, user } = useStore();
  const { cgstRate, sgstRate, freeShippingThreshold, defaultShippingCharge } = useSettings();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const cgst = subtotal * cgstRate;
  const sgst = subtotal * sgstRate;
  const shipping = calcShipping(subtotal, freeShippingThreshold, defaultShippingCharge);
  const discount = couponApplied ? couponDiscount : 0;
  const rawTotal = subtotal + cgst + sgst + shipping - discount;
  const total = Math.round(rawTotal);
  const roundOffDiff = total - rawTotal;

  const applyCoupon = async () => {
    if (!coupon.trim()) { toast.error("Enter a coupon code"); return; }
    try {
      const { cartApi } = await import("@/lib/api");
      const data = await cartApi.applyCoupon(coupon.trim());
      setCouponDiscount(data.discountAmount || subtotal * (data.discountPercent / 100));
      setCouponApplied(true);
      toast.success(`Coupon applied! ${data.discountPercent}% off`);
    } catch (err: any) {
      toast.error(err.message || "Invalid coupon code");
    }
  };

  if (cart.length === 0) return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ height: 96, width: 96, borderRadius: "1.5rem", background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, marginLeft: "auto", marginRight: "auto", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
            <ShoppingCart size={36} style={{ color: "rgba(12, 30, 57, 0.3)" }} />
          </div>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 900, color: "#0C1E39", marginBottom: 12 }}>Your cart is empty</h2>
          <p style={{ color: "#4A5568", marginBottom: 32 }}>Add some products to get started</p>
          <Link href="/products"><motion.button whileHover={{ scale: 1.04 }} className="btn-primary px-8 py-3">Browse Products</motion.button></Link>
        </motion.div>
      </div>
      <Footer />
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--gy)" }}>
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "2.25rem", fontWeight: 900, color: "#0C1E39", marginBottom: 32 }}>
          Your <span className="gradient-text">Cart</span>
          <span style={{ marginLeft: 12, fontSize: "1.125rem", color: "#6B7280" }}>({cart.length} items)</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div key={`${item.productId}-${item.variantId}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                  style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 16, display: "flex", gap: 16, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
                  {/* Image */}
                  <div style={{ height: 80, width: 80, flexShrink: 0, borderRadius: 12, background: "#F8F8F8", border: "1.5px solid rgba(12, 30, 57, 0.08)", overflow: "hidden" }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> :
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(12, 30, 57, 0.2)" }}><ShoppingCart size={24} /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontWeight: 600, color: "#0C1E39", fontSize: "0.875rem", marginBottom: 2 }} className="line-clamp-1">{item.name}</h3>
                    <p style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: 12 }}>{item.unit} · {item.sku}</p>
                    <div className="flex items-center justify-between">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, border: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#F8F8F8", padding: 2 }}>
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty - 1)}
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, color: "#0C1E39", transition: "background 0.15s" }}
                          className="hover:bg-[#0C1E39]/10 transition-colors"><Minus size={12} /></button>
                        <span style={{ width: 24, textAlign: "center", fontSize: "0.875rem", fontWeight: 700, color: "#0C1E39" }}>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty + 1)}
                          style={{ height: 28, width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, color: "#0C1E39", transition: "background 0.15s" }}
                          className="hover:bg-[#0C1E39]/10 transition-colors"><Plus size={12} /></button>
                      </div>
                      <div className="text-right">
                        <div style={{ fontWeight: 700, color: "#0C1E39" }}>₹{(item.price * item.qty).toFixed(2)}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>₹{item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} style={{ color: "var(--or)" }} />
                <span style={{ fontWeight: 600, color: "#0C1E39", fontSize: "0.875rem" }}>Coupon Code</span>
              </div>
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon" className="input text-sm flex-1" style={{ width: "100%" }} />
                <button onClick={applyCoupon} className="btn-primary text-sm px-4 py-2 flex-shrink-0">Apply</button>
              </div>
              {couponApplied && <p style={{ fontSize: "0.75rem", color: "var(--or)", marginTop: 8 }}>✓ Coupon applied — 10% off!</p>}
            </div>

            {/* Summary */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
              <h2 style={{ fontWeight: 700, color: "#0C1E39", marginBottom: 16 }}>Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>CGST @{(cgstRate * 100).toFixed(1)}%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}><span>SGST @{(sgstRate * 100).toFixed(1)}%</span><span>₹{sgst.toFixed(2)}</span></div>
                <div className="flex justify-between" style={{ color: "#4A5568" }}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: "var(--or)" }}>FREE</span> : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && <div className="flex justify-between" style={{ color: "var(--or)" }}><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-xs italic" style={{ color: "#6B7280" }}><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
                )}
              </div>
              <div style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#0C1E39" }}>Total</span>
                <span className="text-2xl font-black gradient-text">₹{total.toFixed(0)}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 4, textAlign: "right" }}>Inclusive of GST</p>

              <Link href={user ? "/checkout" : "/login?next=/checkout"} className="block mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  Proceed to Checkout <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/products">
                <button className="mt-2 w-full btn-outline text-sm py-2" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
