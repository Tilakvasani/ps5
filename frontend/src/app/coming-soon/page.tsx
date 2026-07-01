"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, ArrowRight, Instagram, MessageCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you! We'll notify you as soon as we launch.");
    setSubmitted(true);
    setEmail("");
  };

  return (
    <main className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-[#48C062]/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        
        {/* Animated label badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-sans text-[10px] font-bold uppercase tracking-[0.15em] mx-auto"
        >
          <Sparkles size={12} /> Launching Soon
        </motion.div>

        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-black text-[#002A30] leading-tight tracking-tight">
            Something Amazing<br />
            <span className="text-[#48C062]">Is Coming Soon!</span>
          </h1>
          <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider max-w-md mx-auto leading-relaxed">
            We are working hard to build a premium, science-backed wellness experience. Be the first to know when we launch!
          </p>
        </div>

        {/* Subscribe Form */}
        <div className="card bg-white border border-[#E8E2D9] p-8 shadow-premium rounded-3xl max-w-md mx-auto">
          {submitted ? (
            <div className="space-y-2 py-4">
              <div className="h-10 w-10 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <p className="font-display font-bold text-sm text-[#002A30] uppercase tracking-wider">You're on the list!</p>
              <p className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider">We'll keep you updated with our latest sneak peeks.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-2 block text-left">Stay Updated</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field text-xs font-semibold rounded-xl"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-[0.15em] font-bold"
              >
                <Bell size={14} /> Notify Me
              </motion.button>
            </form>
          )}
        </div>

        {/* Social connections footer */}
        <div className="flex flex-col items-center gap-3 pt-6 border-t border-[#E8E2D9]/40 max-w-xs mx-auto">
          <p className="text-[9px] font-bold text-[#8C8276] uppercase tracking-wider">Follow our journey</p>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/zupwell" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center text-[#002A30] hover:border-[#48C062] hover:text-[#48C062] transition-colors">
              <Instagram size={16} />
            </a>
            <a href="https://wa.me/916355466208" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-xl border border-[#E8E2D9] bg-white flex items-center justify-center text-[#002A30] hover:border-[#48C062] hover:text-[#48C062] transition-colors">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-[10px] font-bold text-[#8C8276] uppercase tracking-widest hover:underline hover:text-[#002A30] flex items-center justify-center gap-1.5">
            ➔ Return to Storefront
          </Link>
        </div>

      </div>
    </main>
  );
}
