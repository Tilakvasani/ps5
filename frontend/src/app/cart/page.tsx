"use client";
import { useSettings, calcShipping } from "@/lib/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from "lucide-react";
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

  const remaining = freeShippingThreshold - subtotal;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

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
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="h-24 w-24 rounded-3xl bg-white border border-[#E8E2D9] flex items-center justify-center mb-6 mx-auto shadow-soft">
            <ShoppingCart size={36} className="text-[#002A30]/30" />
          </div>
          <h2 className="font-display text-3xl font-black text-[#002A30] mb-3">Your cart is empty</h2>
          <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mb-8">Add some supplements to fuel your routine</p>
          <Link href="/products">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="btn-primary px-8 py-3.5 font-sans text-xs uppercase tracking-[0.15em] font-bold">
              Browse Catalog
            </motion.button>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-black text-[#002A30] mb-8">
          Your <span className="text-[#48C062]">Cart</span>
          <span className="ml-3 font-sans text-xs font-semibold text-[#8C8276] uppercase tracking-wider">({cart.length} items)</span>
        </motion.h1>

        {/* Free Shipping Progress Indicator */}
        <div className="card mb-8 bg-white border border-[#E8E2D9] shadow-soft p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#48C062]">
              <Truck size={18} />
            </div>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#002A30]">
              {remaining > 0 ? (
                <>You're only <span className="text-[#48C062]">₹{remaining.toFixed(0)}</span> away from free shipping!</>
              ) : (
                <>Congratulations! You've unlocked <span className="text-[#48C062]">FREE</span> shipping! 🎉</>
              )}
            </p>
          </div>
          <div className="w-full h-2.5 bg-[#FCFAF6] rounded-full overflow-hidden border border-[#E8E2D9]/60">
            <div className="h-full bg-gradient-to-r from-[#48C062] to-[#359E4C] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div key={`${item.productId}-${item.variantId}`}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ delay: i * 0.05 }}
                  className="card flex gap-5 bg-white border border-[#E8E2D9] hover:border-[#48C062]/20 shadow-soft">
                  {/* Thumbnail Image */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-[#FCFAF6] border border-[#E8E2D9] overflow-hidden">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-[#002A30]/20"><ShoppingCart size={24} /></div>}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-[#002A30] text-sm leading-snug line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mt-0.5">{item.unit} · {item.sku}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty count selector */}
                      <div className="flex items-center gap-1.5 rounded-xl border border-[#E8E2D9] bg-[#FCFAF6] p-0.5">
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty - 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-[#002A30]"><Minus size={10} /></button>
                        <span className="w-6 text-center text-xs font-bold text-[#002A30]">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.productId, item.variantId, item.qty + 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-[#002A30]"><Plus size={10} /></button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-sans font-bold text-sm text-[#002A30]">₹{(item.price * item.qty).toFixed(0)}</div>
                        <div className="text-[9px] font-sans font-bold text-[#8C8276] uppercase tracking-wider">₹{item.price.toFixed(0)} each</div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl text-red-400 border border-transparent hover:border-red-100 hover:bg-red-50 transition-all self-start">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code Block */}
            <div className="card bg-white border border-[#E8E2D9] shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-[#48C062]" />
                <span className="font-display font-bold text-xs uppercase tracking-wider text-[#002A30]">Coupon Discount</span>
              </div>
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code" className="input-field text-xs font-semibold flex-1 py-2 rounded-xl" />
                <button onClick={applyCoupon} className="btn-primary text-xs font-bold uppercase tracking-wider py-2 px-4 flex-shrink-0">Apply</button>
              </div>
              {couponApplied && <p className="text-[10px] font-bold text-[#48C062] uppercase tracking-wider mt-2">✓ Coupon code applied successfully!</p>}
            </div>

            {/* Calculations Card */}
            <div className="card bg-white border border-[#E8E2D9] shadow-soft p-6">
              <h2 className="font-display font-bold text-lg text-[#002A30] mb-5 border-b border-[#E8E2D9]/40 pb-3 uppercase tracking-wider">Order Summary</h2>
              <div className="space-y-3 text-xs font-semibold text-[#8C8276] uppercase tracking-wider">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-[#002A30] font-bold">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>CGST @{cgstRate * 100}%</span><span className="text-[#002A30] font-bold">₹{cgst.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>SGST @{sgstRate * 100}%</span><span className="text-[#002A30] font-bold">₹{sgst.toFixed(2)}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#48C062] font-bold">FREE</span> : <span className="text-[#002A30] font-bold">₹{shipping.toFixed(2)}</span>}</span>
                </div>
                {discount > 0 && <div className="flex justify-between text-[#48C062]"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                {roundOffDiff !== 0 && (
                  <div className="flex justify-between text-xs italic"><span>Round Off</span><span>{roundOffDiff > 0 ? "+" : ""}₹{roundOffDiff.toFixed(2)}</span></div>
                )}
              </div>
              
              <div className="border-t border-[#E8E2D9]/60 pt-4 mt-4 flex justify-between items-center">
                <span className="font-display font-bold text-base text-[#002A30]">Total</span>
                <span className="text-xl font-black text-[#48C062]">₹{total.toFixed(0)}</span>
              </div>
              <p className="text-[9px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mt-1 text-right">GST Inclusive</p>

              <Link href={user ? "/checkout" : "/login?next=/checkout"} className="block mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 font-sans text-xs uppercase tracking-[0.15em] font-bold">
                  Proceed to Checkout <ArrowRight size={14} />
                </motion.button>
              </Link>
              <Link href="/products">
                <button className="mt-2.5 w-full btn-outline text-xs uppercase tracking-wider font-bold py-2.5">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
