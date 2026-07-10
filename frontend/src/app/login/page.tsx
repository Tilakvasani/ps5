"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi, adminApi, API_URL } from "@/lib/api";
import { GoogleIcon, FacebookIcon, InlineSpinner } from "@/components/ui";
import { useStore } from "@/lib/store";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";



export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--dk)' }}><div className="h-8 w-8 rounded-full animate-spin" style={{ border: '4px solid rgba(255,92,0,0.2)', borderTopColor: 'var(--or)' }} /></div>}>
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
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center pt-14 pb-12 px-6" style={{ background: 'var(--dk)' }}>
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: '#F8F8F8' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={e => (e.currentTarget.style.color = '#F8F8F8')}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full" style={{ background: 'rgba(255,92,0,0.06)' }} />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full" style={{ background: 'rgba(5,17,36,0.5)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-black" style={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: '-1.5px' }}>
              Zupwell<sup style={{ fontSize: "16px", fontWeight: 700, color: '#FF5C00', marginLeft: "2.5px", letterSpacing: "1px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>
          <h1 className="text-3xl font-black" style={{ color: '#FFFFFF' }}>Welcome back</h1>
          <p className="mt-1" style={{ color: '#F8F8F8' }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogleLogin}
              className="zbtn-out w-full justify-center flex items-center gap-3 text-sm font-semibold" 
              style={{ borderRadius: '8px', padding: '11px', color: '#0C1E39', borderColor: 'rgba(12, 30, 57, 0.12)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(12, 30, 57, 0.05)';
                e.currentTarget.style.color = '#0C1E39';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#0C1E39';
              }}>
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={handleFacebookLogin}
              className="zbtn-out w-full justify-center flex items-center gap-3 text-sm font-semibold" 
              style={{ borderRadius: '8px', padding: '11px', color: '#0C1E39', borderColor: 'rgba(12, 30, 57, 0.12)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(12, 30, 57, 0.05)';
                e.currentTarget.style.color = '#0C1E39';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#0C1E39';
              }}>
              <FacebookIcon /> Continue with Facebook
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#0C1E39', opacity: 0.15 }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: '#0C1E39', opacity: 0.6 }}>or with email</span>
            <div className="h-px flex-1" style={{ background: '#0C1E39', opacity: 0.15 }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ color: '#0C1E39', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#0C1E39', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.8 }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="input-field pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#0C1E39' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--or)')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#0C1E39')}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs" style={{ color: 'var(--or)' }}>Forgot password?</Link>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <InlineSpinner />
                    Signing in...
                  </span>
                : "Sign In"
              }
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#0C1E39', opacity: 0.15 }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: '#0C1E39', opacity: 0.6 }}>or</span>
            <div className="h-px flex-1" style={{ background: '#0C1E39', opacity: 0.15 }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#0C1E39', opacity: 0.8 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--or)' }}>Create one free</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
// LoginForm ends above; LoginPage wraps it in Suspense
