"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { authApi, adminApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { setAuthCookie, setAdminAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";
import { EMAIL_REGEX } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Step = "phone" | "otp" | "adminCreds";

// ─────────────────────────────────────────────────────────────────────────────
// Small components
// ─────────────────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      required
      placeholder="Enter 6-digit OTP"
      autoFocus
      autoComplete="one-time-code"
      className="w-full tracking-[8px] text-center border-2 border-indigo-600/80 rounded-2xl py-3.5 text-xl font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-300 placeholder:tracking-normal"
    />
  );
}

function PasswordInput({ value, onChange, placeholder, autoComplete }: {
  value: string; onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600" tabIndex={-1}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center py-12 px-6"
      style={{ background: "radial-gradient(circle at top right, #0C1E39 0%, #051124 100%)", overflow: "hidden" }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-white hover:text-white/80">
        <ArrowLeft size={16} /> Back to Store
      </Link>
      <div className="relative w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <span className="text-5xl font-black text-white tracking-tight" style={{ fontWeight: 900, letterSpacing: "-2px" }}>
              Zupwell<sup style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", opacity: 0.9, marginLeft: "3px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>
        </div>
        <div className="w-full bg-white rounded-3xl shadow-2xl p-8 border border-white/10">{children}</div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
          <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "4px solid rgba(255,92,0,0.2)", borderTopColor: "var(--or)" }} />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState("");
  const [gateToken, setGateToken] = useState("");
  const [adminEmail, setAdminEmail]   = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminFlow, setIsAdminFlow] = useState(false);
  const [loading, setLoading]     = useState(false);

  const { setUser, setToken, setSRAddresses } = useStore();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const nextUrl     = searchParams.get("next") || "/";

  const cleanedPhone = phone.replace(/\D/g, "");

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(cleanedPhone))
      return toast.error("Please enter a valid 10-digit mobile number starting with 6–9");

    setLoading(true);
    try {
      const res = await authApi.srSendOtp(cleanedPhone);
      if (res.step === "admin-otp") {
        setIsAdminFlow(true);
        toast.success("Admin OTP sent to registered number");
      } else {
        toast.success("OTP sent to your phone via Shiprocket");
      }
      setOtp("");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return toast.error("Please enter the OTP");

    setLoading(true);
    try {
      const res = await authApi.srVerifyOtp(cleanedPhone, otp);

      if (res.step === "admin-credentials") {
        setGateToken(res.gateToken);
        setStep("adminCreds");
        toast.success("Verified! Enter your admin credentials.");
      } else if (res.step === "logged-in") {
        // Regular user logged in via Shiprocket
        setUser(res.user);
        setToken(res.accessToken);
        setAuthCookie(res.accessToken);
        if (res.srAddresses?.length) {
          setSRAddresses(res.srAddresses);
        }
        toast.success(`Welcome, ${res.user.name || "there"}! 🎉`);
        router.push(nextUrl);
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 (Admin only): Email + password ───────────────────────────────────
  const handleAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = adminEmail.trim();
    if (!email || !EMAIL_REGEX.test(email)) return toast.error("Please enter a valid admin email");
    if (!adminPassword) return toast.error("Password is required");

    setLoading(true);
    try {
      const data = await adminApi.login(email, adminPassword, gateToken);
      try {
        localStorage.setItem("zupwell-admin", JSON.stringify({ name: data.admin.name, token: data.accessToken }));
        setAdminAuthCookie(data.accessToken);
      } catch {}
      toast.success(`Welcome back, ${data.admin.name}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Shell>
      <AnimatePresence mode="wait">
        {/* ── STEP 1: Phone number ─────────────────────────────────────────── */}
        {step === "phone" && (
          <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your mobile number to receive an OTP</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex items-center border-2 border-indigo-600/80 rounded-2xl p-1 bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <div className="flex items-center gap-2 px-3 py-2 shrink-0">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm font-bold text-gray-600">+91</span>
                </div>
                <div className="w-px h-6 bg-gray-200 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  placeholder="10-digit mobile number"
                  autoFocus
                  className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading || cleanedPhone.length !== 10}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            {/* Shiprocket badge */}
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
              <svg className="h-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Login secured by Shiprocket
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: OTP entry ──────────────────────────────────────────────── */}
        {step === "otp" && (
          <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-center">
            {isAdminFlow ? (
              <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                <ShieldCheck size={28} />
              </div>
            ) : (
              <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-sm border border-emerald-100">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.149 4.197 4.292-1.059z" />
                </svg>
              </div>
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-1">Enter OTP</h3>
            <p className="text-sm text-gray-600 mb-6">
              Code sent to <span className="font-bold text-gray-900">+91 {phone}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} />
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className={`w-full ${isAdminFlow ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"} disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer shadow-sm`}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <div className="flex items-center justify-between text-xs font-semibold pt-2">
                <button type="button" onClick={() => { setStep("phone"); setOtp(""); setIsAdminFlow(false); }} className="text-gray-500 hover:text-indigo-600">
                  Change Number
                </button>
                <button type="button" onClick={handleSendOtp} className="text-indigo-600 hover:text-indigo-700">
                  Resend OTP
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── STEP 3: Admin credentials (2nd factor) ─────────────────────────── */}
        {step === "adminCreds" && (
          <motion.div key="adminCreds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Admin Verification</h3>
              <p className="text-sm text-gray-500 mt-1">Confirm your admin credentials to continue</p>
            </div>
            <form onSubmit={handleAdminCredentials} className="space-y-3.5">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                placeholder="admin@zupwell.com"
                autoComplete="email"
                className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400"
              />
              <PasswordInput value={adminPassword} onChange={setAdminPassword} placeholder="Admin password" autoComplete="current-password" />
              <button type="submit" disabled={loading} className="w-full bg-[#FF5C00] hover:bg-[#E04B00] disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
                {loading ? "Signing in..." : "Validate Credentials"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
