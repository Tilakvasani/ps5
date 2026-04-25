"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReusableBackground } from "@/components/ReusableBackground";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <ReusableBackground
        sphereColors={["#ec4899", "#8b5cf6"]}
        sphereCount={2}
        starCount={150}
        sparkleCount={15}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 text-9xl font-black gradient-text">404</h1>
          <p className="mb-2 text-2xl font-bold text-white">
            Lost in the void?
          </p>
          <p className="mb-8 text-white/60">
            The page you're looking for doesn't exist in this dimension.
          </p>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 font-bold text-white shadow-lg shadow-pink-500/30 transition-all hover:shadow-pink-500/50"
            >
              Return Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

