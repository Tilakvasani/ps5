"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi, adminApi } from "@/lib/api";
import { GoogleIcon, FacebookIcon } from "@/components/ui";
import { useStore } from "@/lib/store";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";



export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F1FAFF] flex items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-[#45B08C]/30 border-t-[#45B08C] animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Try admin login first (silently)
    try {
      const adminData = await adminApi.login(email, password);
      localStorage.setItem("zupwell-admin", JSON.stringify({ name: adminData.admin.name, token: adminData.accessToken }));
      toast.success(`Welcome, ${adminData.admin.name}!`);
      setLoading(false);
      router.push("/admin");
      return;
    } catch {
      // Not admin — continue
    }

    // 2. Try regular user login
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      setToken(data.accessToken);
      setAuthCookie(data.accessToken); // sync cookie so middleware lets user through
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(nextUrl);
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // ── FIX: Use production backend URL as fallback (not localhost) ──
  const handleGoogleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com";
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com";
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  return (
    <main className="relative min-h-screen bg-[#F1FAFF] flex items-center justify-center px-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[#4A6A82] hover:text-[#1D3557] transition-colors font-medium">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#45B08C]/10 " />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#1D3557]/8 " />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-black inline-flex items-start" style={{
              background: "#45B08C",
              }}>
              Zupwell
              <sup style={{ fontSize: "0.4em", fontWeight: 700, lineHeight: 1, marginTop: "4px", background: "#45B08C", }}>™</sup>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-[#1D3557]">Welcome back</h1>
          <p className="text-[#4A6A82] mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#C8DCEA] bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-[#4A6A82]">
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#C8DCEA] bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-[#4A6A82]">
              <FacebookIcon /> Continue with Facebook
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#C8DCEA]" />
            <span className="text-xs text-[#7A9BB5] uppercase tracking-wide">or with email</span>
            <div className="h-px flex-1 bg-[#C8DCEA]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#4A6A82] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4A6A82] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6A82] hover:text-[#1D3557]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-[#45B08C] hover:text-[#389475]">Forgot password?</Link>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </span>
                : "Sign In"
              }
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#C8DCEA]" />
            <span className="text-xs text-[#7A9BB5] uppercase tracking-wide">or</span>
            <div className="h-px flex-1 bg-[#C8DCEA]" />
          </div>

          <p className="text-center text-sm text-[#4A6A82]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#45B08C] hover:text-[#389475]">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
// LoginForm ends above; LoginPage wraps it in Suspense