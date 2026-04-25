"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReusableBackground } from "@/components/ReusableBackground";
import { store } from "@/lib/store";
import { useSnapshot } from "valtio";
import { orderApi } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const snap = useSnapshot(store);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: snap.user?.email || "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const cartTotal = snap.cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const tax = cartTotal * 0.1;
  const shipping = 10;
  const total = cartTotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        items: snap.cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zip_code: formData.zipCode,
        },
      };

      const order = await orderApi.create(orderData);

      // Clear cart
      store.cart = [];

      // Show success
      router.push(`/order-success/${order.id}`);
    } catch (error: unknown) {
      store.error = error instanceof Error ? error.message : "Checkout failed";
    } finally {
      setIsProcessing(false);
    }
  };

  if (snap.cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-6">Your cart is empty</p>
          <Link href="/products">
            <button className="rounded-lg bg-pink-500 px-6 py-3 font-bold text-white">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <ReusableBackground
        sphereColors={["#10b981", "#ec4899"]}
        sphereCount={2}
        starCount={200}
        sparkleCount={20}
        ambientIntensity={0.4}
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-2 text-4xl font-black gradient-text">Secure Checkout</h1>
            <p className="text-white/60">Complete your purchase</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg"
                >
                  <h2 className="mb-6 text-xl font-bold text-white">Shipping Information</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                  />

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg"
                >
                  <h2 className="mb-6 text-xl font-bold text-white">Payment Information</h2>

                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    maxLength={19}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                      maxLength={4}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 py-4 font-bold text-white hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </motion.button>
              </form>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg h-fit"
            >
              <h2 className="mb-6 text-xl font-bold text-white">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {snap.cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-white/60">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="text-white font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-lg font-bold text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
