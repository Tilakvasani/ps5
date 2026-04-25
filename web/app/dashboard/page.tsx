"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReusableBackground } from "@/components/ReusableBackground";
import { store } from "@/lib/store";
import { useSnapshot } from "valtio";
import { authApi } from "@/lib/api";
import { showToast } from "@/components/Toast";

export default function DashboardPage() {
  const router = useRouter();
  const snap = useSnapshot(store);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    cartItems: 0,
  });

  useEffect(() => {
    if (!snap.token) {
      router.push("/login");
      return;
    }

    setStats({
      totalOrders: 0,
      totalSpent: 0,
      cartItems: snap.cart.length,
    });
  }, [snap.token, router, snap.cart.length]);

  const cartTotal = snap.cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <ReusableBackground
        sphereColors={["#ec4899", "#8b5cf6", "#0ea5e9"]}
        sphereCount={3}
        starCount={300}
        sparkleCount={30}
        ambientIntensity={0.5}
      />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black gradient-text">zupwell</h1>
          <button
            onClick={() => {
              authApi.logout();
              router.push("/login");
            }}
            className="rounded-lg bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="mb-2 text-4xl font-black md:text-5xl">
              Welcome back, <span className="gradient-text">{snap.user?.name || "Guest"}</span>
            </h2>
            <p className="text-lg text-white/60">Continue your zupwell journey</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                label: "Cart Items",
                value: snap.cart.length,
                icon: "🛒",
                color: "from-pink-500 to-pink-600",
              },
              {
                label: "Total Value",
                value: `$${cartTotal.toFixed(2)}`,
                icon: "💰",
                color: "from-purple-500 to-purple-600",
              },
              {
                label: "Orders",
                value: stats.totalOrders,
                icon: "📦",
                color: "from-blue-500 to-blue-600",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-lg"
              >
                <div className="mb-4 text-4xl">{stat.icon}</div>
                <p className="mb-2 text-white/60 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Cart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg"
          >
            <h3 className="mb-6 text-2xl font-bold">Your Cart</h3>

            {snap.cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 mb-4">Your cart is empty</p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-3 font-bold text-white"
                  >
                    Browse Products
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {snap.cart.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-white">{item.product.name}</p>
                        <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-pink-400">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-white/40">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          store.cart = store.cart.filter((_, i) => i !== idx);
                          showToast("Item removed from cart", "info");
                        }}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-all"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="mb-6 flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <Link href="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 py-3 font-bold text-white hover:shadow-lg hover:shadow-pink-500/50"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-6 text-left font-semibold text-white hover:bg-white/10 transition-all"
              >
                ✨ Explore More Products
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-6 text-left font-semibold text-white hover:bg-white/10 transition-all"
              >
                📊 View Order History
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
