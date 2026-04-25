"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setFinished(true), 1000);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo or Main Text */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-black tracking-[0.5em] text-white"
            >
              zupwell
            </motion.h1>
            
            {/* Progress Bar Container */}
            <div className="mt-8 h-[2px] w-64 overflow-hidden rounded-full bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#ff4d77] to-[#ffd74a]"
              />
            </div>

            {/* Percentage Text */}
            <motion.p 
              className="mt-4 font-mono text-xs tracking-widest text-white/40"
            >
              {Math.round(progress)}% SYNTHESIZING
            </motion.p>

            {/* Abstract Orbs */}
            <div className="absolute -z-10 h-64 w-64 animate-pulse rounded-full bg-pink-500/10 blur-[100px]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
