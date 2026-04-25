"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReusableBackground } from "@/components/ReusableBackground";
import { authApi } from "@/lib/api";
import { store } from "@/lib/store";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register(email, password, name);
      store.user = response.user;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <ReusableBackground
        sphereColors={["#8b5cf6", "#0ea5e9"]}
        sphereCount={2}
        starCount={200}
        sparkleCount={0}
        ambientIntensity={0.3}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-2xl shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-4xl font-black gradient-text">Join Us</h1>
              <p className="text-white/60">Start your zupwell journey today</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  placeholder="••••••••"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase text-white/40">Or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-white/60">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-pink-400 hover:text-pink-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
