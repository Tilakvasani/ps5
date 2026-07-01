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
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="h-24 w-24 rounded-3xl bg-[#FCFAF6] border border-[#E8E2D9] flex items-center justify-center mb-6 mx-auto">
            <ShoppingCart size={36} className="text-[#001c54]/30" />
          </div>
          <h2 className="text-3xl font-black text-[#001c54] mb-3">Your cart is empty</h2>
          <p className="text-[#45353E] mb-8">Add some products to get started</p>
          <Link href="/products"><motion.button whileHover={{ scale: 1.04 }} className="btn-primary px-8 py-3">Browse Products</motion.button></Link>
        </motion.div>
      </div>
      <Footer />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-[#001c54] mb-8">
          Your <span className="gradient-text">Cart</span>
          <span className="ml-3 text-lg text-[#45353E]">({cart.length} items)</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div key={`${item.productId}-${item.variantId}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                  className="card flex gap-4">
                  {/* Image */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-[#FCFAF6] border border-[#E8E2D9] overflow-hidden">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-[#001c54]/20"><ShoppingCart size={24} /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#001c54] text-sm mb-0.5 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-[#45353E] mb-3">{item.unit} · {item.sku}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-[#E8E2D9] bg-[#FCFAF6] p-0.5">
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty - 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#FFFFFF] transition-colors"><Minus size={12} /></button>
                        <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty + 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#FFFFFF] transition-colors"><Plus size={12} /></button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#001c54]">₹{(item.price * item.qty).toFixed(2)}</div>
                        <div className="text-xs text-[#45353E]">₹{item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-[#EB9220]" />
                <span className="font-semibold text-[#001c54] text-sm">Coupon Code</span>
              </div>
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon" className="input-field text-sm flex-1" />
                <button onClick={applyCoupon} className="btn-primary text-sm px-4 py-2 flex-shrink-0">Apply</button>
              </div>
              {couponApplied && <p className="text-xs text-[#EB9220] mt-2">✓ Coupon applied — 10% off!</p>}
            </div>

            {/* Summary */}
            <div className="card">
              <h2 className="font-bold text-[#001c54] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-[#45353E]"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[#45353E]"><span>CGST @2.5%</span><span>₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between text-[#45353E]"><span>SGST @2.5%</span><span>₹{sgst.toFixed(2)}</span></div>
                <div className="flex justify-between text-[#45353E]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#EB9220]">FREE</span> : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && <div className="flex justify-between text-[#EB9220]"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-[#8C8276] text-xs italic"><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
                )}
              </div>
              <div className="border-t border-[#E8E2D9] pt-4 flex justify-between items-center">
                <span className="font-bold text-[#001c54]">Total</span>
                <span className="text-2xl font-black gradient-text">₹{total.toFixed(0)}</span>
              </div>
              <p className="text-xs text-[#45353E] mt-1 text-right">Inclusive of GST</p>

              <Link href={user ? "/checkout" : "/login?next=/checkout"} className="block mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  Proceed to Checkout <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/products">
                <button className="mt-2 w-full btn-outline text-sm py-2">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
