"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
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
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [exists, setExists] = useState<boolean | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.sendOtp(cleanPhone);
      setExists(response.exists);
      toast.success("OTP verification code sent!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (exists === false) {
      if (!name || !name.trim()) {
        toast.error("Full Name is compulsory for new registrations.");
        return;
      }
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(
        cleanPhone,
        otp,
        notifyOffers,
        exists === false ? name.trim() : undefined,
        exists === false ? email.trim() || undefined : undefined
      );
      setUser(data.user);
      setToken(data.accessToken);
      setAuthCookie(data.accessToken);

      toast.success(`Logged in successfully! Welcome, ${data.user.name || "User"} 🎉`);
      router.push(nextUrl);
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center py-12 px-6" 
      style={{ 
        background: 'radial-gradient(circle at top right, #0C1E39 0%, #051124 100%)',
        overflow: 'hidden' 
      }}>
      
      {/* Background decoration - sports & nutrition vibe lines pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors text-white hover:text-white/80">
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <span className="text-5xl font-black text-white tracking-tight" style={{ fontWeight: 900, letterSpacing: '-2px' }}>
              Zupwell<sup style={{ fontSize: "18px", fontWeight: 700, color: '#FFFFFF', opacity: 0.9, marginLeft: "3px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>
        </div>

        {/* Card Component */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-8 border border-white/10">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Phone Input Box Styled like Fast&Up / Shiprocket */}
                  <div className="flex items-center border-2 border-indigo-600/80 rounded-2xl p-1 bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                    {/* Country Code with Flag */}
                    <div className="flex items-center gap-2 px-3 py-2 shrink-0">
                      <span className="text-lg">🇮🇳</span>
                      <span className="text-sm font-bold text-gray-600">+91</span>
                    </div>
                    {/* Vertical Divider */}
                    <div className="w-px h-6 bg-gray-200 shrink-0" />
                    {/* Input */}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      required
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                    {/* Integrated Login Button */}
                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {loading ? "..." : "Login"}
                    </button>
                  </div>

                  {/* Pre-checked notify checkbox */}
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

                  {/* T&C and Privacy Policy Disclaimer Line */}
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
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We have sent a verification code to <span className="font-semibold text-gray-800">+91 {phone}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
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
                  </div>

                  {exists === false && (
                    <div className="space-y-3.5 mt-2 animate-fade-in-up">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="e.g. Rahul Sharma"
                          className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="text-left">
                        <label className="block text-xs font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wider">
                          Email Address <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. rahul@domain.com"
                          className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4 || (exists === false && !name.trim())}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? "Verifying..." : exists === false ? "Register & Verify" : "Verify & Proceed"}
                  </button>

                  <div className="flex items-center justify-between text-xs font-semibold pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setExists(null);
                      }}
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
