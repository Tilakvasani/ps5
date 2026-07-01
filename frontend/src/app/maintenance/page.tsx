"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hammer, Sparkles, Instagram, MessageCircle } from "lucide-react";

export default function MaintenancePage() {
  // Real running timer state starting at 2 hours, 34 mins, 56 secs
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 34 * 60 + 56);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, "0"),
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <main className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-[#48C062]/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        
        {/* Decorative Hammer badge */}
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          className="h-16 w-16 bg-white border border-[#E8E2D9] rounded-3xl flex items-center justify-center mx-auto shadow-soft"
        >
          <Hammer className="text-[#48C062]" size={28} />
        </motion.div>

        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-black text-[#002A30] leading-tight tracking-tight">
            We're Under<br />
            <span className="text-[#48C062]">Maintenance</span>
          </h1>
          <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider max-w-md mx-auto leading-relaxed">
            We are upgrading our storefront server to bring you an even faster, more premium wellness shopping experience. We'll be back shortly!
          </p>
        </div>

        {/* Countdown Widgets Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { val: hours, label: "Hours" },
            { val: minutes, label: "Minutes" },
            { val: seconds, label: "Seconds" },
          ].map((unit, idx) => (
            <div key={idx} className="card bg-white border border-[#E8E2D9] p-5 text-center shadow-soft rounded-2xl">
              <span className="font-display text-3xl font-black text-[#002A30] tracking-tight">{unit.val}</span>
              <span className="text-[9px] font-bold text-[#8C8276] uppercase tracking-widest block mt-1">{unit.label}</span>
            </div>
          ))}
        </div>

        {/* Contact/Support Links */}
        <div className="flex flex-col items-center gap-3 pt-6 border-t border-[#E8E2D9]/40 max-w-xs mx-auto">
          <p className="text-[9px] font-bold text-[#8C8276] uppercase tracking-wider">Need urgent assistance?</p>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/916355466208" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center text-[#002A30] hover:border-[#48C062] hover:text-[#48C062] transition-colors">
              <MessageCircle size={16} />
            </a>
            <a href="https://instagram.com/zupwell" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center text-[#002A30] hover:border-[#48C062] hover:text-[#48C062] transition-colors">
              <Instagram size={16} />
            </a>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-[10px] font-bold text-[#8C8276] uppercase tracking-widest hover:underline hover:text-[#002A30]">
            ➔ Try Storefront Home
          </Link>
        </div>

      </div>
    </main>
  );
}
