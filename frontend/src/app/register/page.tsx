"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import { authApi } from "@/lib/api";
import { GoogleIcon, FacebookIcon } from "@/components/ui";
import { useStore } from "@/lib/store";
import { setAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

// Password strength rules
const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

// ── Google Icon ──────────────────────────────────────

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const passedRules = rules.filter(r => r.test(form.password));
  const strength = passedRules.length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];
  const isPasswordStrong = strength === 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      toast.error("Please meet all password requirements");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setUser(data.user);
      setToken(data.accessToken);
      setAuthCookie(data.accessToken); // sync cookie so middleware lets user through
      toast.success("Account created! Welcome to Zupwell 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign Up ───────────────────────────────────
  const handleGoogleSignUp = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com";
    window.location.href = `${API_URL}/api/auth/google`;
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
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full" style={{ background: 'rgba(255,92,0,0.06)' }} />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full" style={{ background: 'rgba(5,17,36,0.5)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-black" style={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: '-1.5px' }}>
              Zupwell<sup style={{ fontSize: "16px", fontWeight: 700, color: '#F8F8F8', marginLeft: "2.5px", letterSpacing: "1px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>
          <h1 className="text-3xl font-black" style={{ color: '#FFFFFF' }}>Create account</h1>
          <p className="mt-1" style={{ color: '#F8F8F8' }}>Start your wellness journey today</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>

          {/* ✅ Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            className="zbtn-out w-full justify-center flex items-center gap-3 text-sm font-semibold mb-6" style={{ borderRadius: '8px', padding: '11px' }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#0C1E39' }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: '#F8F8F8' }}>or with email</span>
            <div className="h-px flex-1" style={{ background: '#0C1E39' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ color: '#F8F8F8', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px' }}>Full Name</label>
              <input type="text" value={form.name} onChange={update("name")} required minLength={2}
                className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#F8F8F8', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px' }}>Email</label>
              <input type="email" value={form.email} onChange={update("email")} required
                className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#F8F8F8', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={update("phone")} required
                className="input-field" placeholder="+91 9999999999" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ color: '#F8F8F8', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  onFocus={() => setShowRules(true)}
                  required
                  className="input-field pr-10"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#F8F8F8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#F8F8F8')}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor : "#0C1E39" }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}

              {/* Password rules */}
              {showRules && (
                <div className="mt-3 p-3 rounded-xl space-y-1.5" style={{ background: '#0C1E39', border: '1.5px solid #0C1E39' }}>
                  {rules.map((rule, i) => {
                    const passed = rule.test(form.password);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center`} style={{ background: passed ? 'var(--or)' : '#0C1E39' }}>
                          {passed ? <Check size={10} className="text-white" /> : <X size={10} style={{ color: '#F8F8F8' }} />}
                        </div>
                        <span className="text-xs" style={{ color: passed ? '#FFFFFF' : '#F8F8F8' }}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <motion.button
              type="submit" disabled={loading || !isPasswordStrong}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Creating account...
                  </span>
                : "Create Free Account"
              }
            </motion.button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: '#F8F8F8' }}>
            By creating an account you agree to our{" "}
            <Link href="/terms-of-service" style={{ color: 'var(--or)' }}>Terms</Link> and{" "}
            <Link href="/privacy-policy" style={{ color: 'var(--or)' }}>Privacy Policy</Link>
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#0C1E39' }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: '#F8F8F8' }}>or</span>
            <div className="h-px flex-1" style={{ background: '#0C1E39' }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#F8F8F8' }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--or)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
