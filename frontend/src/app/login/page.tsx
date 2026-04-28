"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi, adminApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-[#F47C41]/30 border-t-[#F47C41] animate-spin" /></div>}>
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
    <main className="relative min-h-screen bg-[#F4F6FA] flex items-center justify-center px-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0B2C6F] transition-colors font-medium">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#F47C41]/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#0B2C6F]/8 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-display font-black inline-flex items-start" style={{
              background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Zupwell
              <sup style={{ fontSize: "0.4em", fontWeight: 700, lineHeight: 1, marginTop: "4px", background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>™</sup>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-black text-[#111827]">Welcome back</h1>
          <p className="text-[#6B7280] mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#D9DEE8] bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-[#374151]">
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#D9DEE8] bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-[#374151]">
              <FacebookIcon /> Continue with Facebook
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D9DEE8]" />
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wide">or with email</span>
            <div className="h-px flex-1 bg-[#D9DEE8]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2C6F]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-[#F47C41] hover:text-[#d9673a]">Forgot password?</Link>
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
            <div className="h-px flex-1 bg-[#D9DEE8]" />
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wide">or</span>
            <div className="h-px flex-1 bg-[#D9DEE8]" />
          </div>

          <p className="text-center text-sm text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#F47C41] hover:text-[#d9673a]">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
// LoginForm ends above; LoginPage wraps it in Suspense