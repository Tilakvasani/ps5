"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      setToken(data.accessToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F4F6FA] flex items-center justify-center px-6">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#F47C41]/8 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-yellow-400/8 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F47C41] to-[#FFD166] flex items-center justify-center">
              <Package size={20} className="text-black" />
            </div>
            <span className="text-2xl font-display font-black gradient-text">Zupwell</span>
          </Link>
          <h1 className="text-3xl font-display font-black text-[#111827]">Welcome back</h1>
          <p className="text-[#6B7280] mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2C6F]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-[#F47C41] hover:text-[#f79b6e]">Forgot password?</Link>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-[#D9DEE8] border-t-transparent animate-spin" />Signing in...</span> : "Sign In"}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#FFFFFF]" />
            <span className="text-xs text-[#6B7280] uppercase">or</span>
            <div className="h-px flex-1 bg-[#FFFFFF]" />
          </div>

          <p className="text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-[#F47C41] hover:text-[#f79b6e]">Create one free</Link>
          </p>
          <p className="text-center text-sm text-[#6B7280] mt-2">
            Admin?{" "}
            <Link href="/admin/login" className="font-semibold text-[#374151] hover:text-[#0B2C6F]">Admin login →</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
