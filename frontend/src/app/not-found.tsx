"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-[#48C062]/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="text-center relative z-10 space-y-6 max-w-md">
        
        {/* Floating pill shape graphic */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-24 h-12 rounded-full bg-gradient-to-r from-[#48C062] to-[#359E4C] flex items-center justify-center shadow-lg border border-[#A5D6A7]"
        >
          <Sparkles className="text-white" size={20} />
        </motion.div>

        <div>
          <h1 className="font-display text-[8rem] md:text-[10rem] font-black leading-none text-[#002A30] tracking-tight selection:bg-[#48C062] selection:text-white">
            404
          </h1>
          <h2 className="font-display text-2xl font-bold text-[#002A30] uppercase tracking-wider mt-2">
            Oops! Page not found
          </h2>
          <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-3 leading-relaxed max-w-xs mx-auto">
            Looks like you've taken a wrong turn on your wellness routine. Let's get you back on track!
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2 mx-auto px-8 py-3.5 font-sans text-xs uppercase tracking-[0.15em] font-bold"
            >
              <Home size={14} /> Back to Home
            </motion.button>
          </Link>
        </div>
      </div>
    </main>
  );
}
