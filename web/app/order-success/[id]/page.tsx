"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment, Stars, Sparkles } from "@react-three/drei";
import { GlowingSphere } from "@/components/3D/GlowingSphere";

function SuccessScene() {
  return (
    <Canvas className="absolute inset-0" style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={200} factor={4} fade speed={0.5} />
        <Sparkles count={50} scale={8} size={3} speed={1} />
        <GlowingSphere position={[-3, 2, -5]} color="#10b981" size={1.5} speed={1} />
        <GlowingSphere position={[3, -2, -5]} color="#34d399" size={1.2} speed={1.3} />
        <GlowingSphere position={[0, -3, -5]} color="#6ee7b7" size={0.8} speed={1.5} />
        <ambientLight intensity={0.6} />
      </Suspense>
    </Canvas>
  );
}

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
      <SuccessScene />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="text-center max-w-2xl mx-auto px-6"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative w-24 h-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 border-r-green-500"
              />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                ✓
              </div>
            </div>
          </motion.div>

          {/* Success Text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-4 text-5xl font-black gradient-text"
          >
            Order Confirmed! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8 text-xl text-white/60"
          >
            Thank you for your purchase! Your order #{params.id} has been successfully placed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-lg mb-8"
          >
            <p className="text-white/60 mb-2">Order Number</p>
            <p className="text-3xl font-bold text-white">{params.id}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row justify-center"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 font-bold text-white hover:shadow-lg hover:shadow-pink-500/50"
              >
                View Order
              </motion.button>
            </Link>

            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-white/10 bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 text-white/40 text-sm"
          >
            You will receive an email confirmation shortly.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
