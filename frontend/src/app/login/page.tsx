"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, ShieldCheck, Eye, EyeOff, LogIn, KeyRound } from "lucide-react";
import { authApi, adminApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { setAuthCookie, setAdminAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

type Step =
  | "phone"
  | "password"
  | "otp"
  | "register"
  | "setPassword"
  | "adminCredentials"
  | "forgotPhone"
  | "forgotReset";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
          <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "4px solid rgba(255,92,0,0.2)", borderTopColor: "var(--or)" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
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
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function LoginForm() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState(""); // phone or email, for the password step
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [loading, setLoading] = useState(false);

  // Populated after OTP verification, depending on which branch we land in.
  const [gateToken, setGateToken] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [registerMode, setRegisterMode] = useState<"register" | "setPassword" | "adminCredentials" | null>(null);

  const { setUser, setToken } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const finishUserLogin = (data: { accessToken: string; user: any }) => {
    setUser(data.user);
    setToken(data.accessToken);
    setAuthCookie(data.accessToken);
    toast.success(`Welcome, ${data.user.name || "there"}! 🎉`);
    router.push(nextUrl);
  };

  const finishAdminLogin = (data: { accessToken: string; admin: any }) => {
    try {
      localStorage.setItem("zupwell-admin", JSON.stringify({ name: data.admin.name, token: data.accessToken }));
      setAdminAuthCookie(data.accessToken);
    } catch {}
    toast.success(`Welcome back, ${data.admin.name}!`);
    router.push("/admin");
  };

  // ── Step 1: phone number ──────────────────────────────────────────
  const handleIdentify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.identify(cleanPhone);
      if (res.step === "password") {
        setIdentifier(cleanPhone);
        setStep("password");
      } else {
        toast.success("OTP sent to your mobile number!");
        setStep("otp");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2a: existing user — password, no OTP ─────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(identifier, password);
      finishUserLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2b: verify OTP, branch into the right next step ─────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter the OTP");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const res = await authApi.verifyIdentifyOtp(cleanPhone, otp);
      if (res.step === "admin-gate") {
        setGateToken(res.gateToken);
        setRegisterMode("adminCredentials");
        setStep("adminCredentials");
        toast.success("Verified! Enter your admin credentials.");
      } else if (res.step === "set-password") {
        setSetupToken(res.setupToken);
        setRegisterMode("setPassword");
        setStep("setPassword");
        toast.success("Verified! Please set a password for your account.");
      } else if (res.step === "register") {
        setSetupToken(res.setupToken);
        setRegisterMode("register");
        setStep("register");
      } else if (res.step === "logged-in") {
        finishUserLogin(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3a: brand-new user registration ──────────────────────────
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.completeRegistration({
        setupToken, name: name.trim(), email: email.trim() || undefined, password, confirmPassword, notified: notifyOffers,
      });
      finishUserLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3b: legacy user sets their first password ────────────────
  const handleCompletePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.completePasswordSetup({ setupToken, password, confirmPassword });
      finishUserLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3c: admin credentials (second factor) ─────────────────────
  const handleAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const data = await adminApi.login(email, password, gateToken);
      finishAdminLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password (OTP-based) ────────────────────────────────────
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPasswordRequest(cleanPhone);
      toast.success("If this number is registered, an OTP has been sent.");
      setStep("forgotReset");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const data = await authApi.forgotPasswordVerify({ phone: cleanPhone, otp, password, confirmPassword });
      finishUserLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetToPhone = () => {
    setStep("phone");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setGateToken("");
    setSetupToken("");
    setRegisterMode(null);
  };

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

        <div className="w-full bg-white rounded-3xl shadow-2xl p-8 border border-white/10">
          <AnimatePresence mode="wait">
            {/* STEP: phone */}
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <form onSubmit={handleIdentify} className="space-y-4">
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
                      className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loading ? "..." : "Continue"}
                    </button>
                  </div>

                  <div className="flex items-start gap-2.5 mt-2 px-1">
                    <input
                      id="notify-offers-checkbox"
                      type="checkbox"
                      checked={notifyOffers}
                      onChange={(e) => setNotifyOffers(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5"
                    />
                    <label htmlFor="notify-offers-checkbox" className="text-xs text-gray-600 select-none cursor-pointer leading-tight">
                      Notify me for any updates & offers
                    </label>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-100 mt-4 text-[11px] text-gray-500 leading-normal px-1">
                    <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
                    <span>
                      By proceeding, you are agreeing to our{" "}
                      <Link href="/privacy-policy" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</Link>,{" "}
                      <Link href="/terms-of-service" className="font-semibold text-indigo-600 hover:underline">T & C</Link> and{" "}
                      <Link href="/legal-disclaimer" className="font-semibold text-indigo-600 hover:underline">Legal Disclaimer</Link>.
                    </span>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP: password (existing user, no OTP) */}
            {step === "password" && (
              <motion.div key="password" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="text-center mb-5">
                  <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-3 text-indigo-600">
                    <LogIn size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Welcome back</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your password for <span className="font-semibold text-gray-800">+91 {identifier}</span>
                  </p>
                </div>
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
                  >
                    {loading ? "Signing in..." : "Log In"}
                  </button>
                  <div className="flex items-center justify-between text-xs font-semibold pt-2">
                    <button type="button" onClick={resetToPhone} className="text-gray-500 hover:text-indigo-600">Change Number</button>
                    <button type="button" onClick={() => { setStep("forgotPhone"); }} className="text-indigo-600 hover:text-indigo-700">Forgot Password?</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP: otp (shared for register / setPassword / admin gate) */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="text-center">
                <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We have sent a verification code to <span className="font-semibold text-gray-800">+91 {phone}</span>
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="w-full tracking-[8px] text-center border-2 border-indigo-600/80 rounded-2xl py-3.5 text-xl font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-300 placeholder:tracking-normal mb-1"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? "Verifying..." : "Verify & Proceed"}
                  </button>
                  <div className="flex items-center justify-between text-xs font-semibold pt-4">
                    <button type="button" onClick={resetToPhone} className="text-gray-500 hover:text-indigo-600">Change Number</button>
                    <button type="button" onClick={() => handleIdentify()} className="text-indigo-600 hover:text-indigo-700">Resend OTP</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP: register (brand-new user) */}
            {step === "register" && (
              <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Create your account</h3>
                <p className="text-sm text-gray-500 mb-5 text-center">Just a few details to finish setting up</p>
                <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Rahul Sharma"
                      className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. rahul@domain.com"
                      className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                    <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">Confirm Password <span className="text-red-500">*</span></label>
                    <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" autoComplete="new-password" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer mt-2">
                    {loading ? "Creating account..." : "Register & Continue"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP: setPassword (legacy OTP-only user, first password) */}
            {step === "setPassword" && (
              <motion.div key="setPassword" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-5">
                  <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-3 text-indigo-600">
                    <KeyRound size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Set a password</h3>
                  <p className="text-sm text-gray-500 mt-1">Secure your account with a password for next time</p>
                </div>
                <form onSubmit={handleCompletePasswordSetup} className="space-y-3.5">
                  <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" autoComplete="new-password" />
                  <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
                    {loading ? "Saving..." : "Set Password & Continue"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP: adminCredentials (second factor) */}
            {step === "adminCredentials" && (
              <motion.div key="adminCredentials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="text-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Admin Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">Complete credentials validation to continue</p>
                </div>
                <form onSubmit={handleAdminCredentials} className="space-y-3.5">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@zupwell.com" autoComplete="email"
                    className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400" />
                  <PasswordInput value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" />
                  <button type="submit" disabled={loading} className="w-full bg-[#FF5C00] hover:bg-[#E04B00] disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
                    {loading ? "Signing in..." : "Validate Credentials"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP: forgotPhone */}
            {step === "forgotPhone" && (
              <motion.div key="forgotPhone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div className="text-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Reset your password</h3>
                  <p className="text-sm text-gray-500 mt-1">We'll send an OTP to your registered mobile number</p>
                </div>
                <form onSubmit={handleForgotRequest} className="space-y-4">
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
                      className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                  </div>
                  <button type="submit" disabled={loading || phone.length !== 10} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                  <button type="button" onClick={resetToPhone} className="w-full text-xs font-semibold text-gray-500 hover:text-indigo-600 pt-1">Back to Login</button>
                </form>
              </motion.div>
            )}

            {/* STEP: forgotReset */}
            {step === "forgotReset" && (
              <motion.div key="forgotReset" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div className="text-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Enter OTP & new password</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Code sent to <span className="font-semibold text-gray-800">+91 {phone}</span>
                  </p>
                </div>
                <form onSubmit={handleForgotReset} className="space-y-3.5">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="w-full tracking-[8px] text-center border-2 border-indigo-600/80 rounded-2xl py-3.5 text-xl font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-300 placeholder:tracking-normal"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <PasswordInput value={password} onChange={setPassword} placeholder="New password (min 8 chars)" autoComplete="new-password" />
                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" autoComplete="new-password" />
                  <button type="submit" disabled={loading || otp.length < 4} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
                    {loading ? "Resetting..." : "Reset Password & Log In"}
                  </button>
                  <button type="button" onClick={resetToPhone} className="w-full text-xs font-semibold text-gray-500 hover:text-indigo-600 pt-1">Back to Login</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
