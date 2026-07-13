"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PhoneCall, ShieldCheck, Eye, EyeOff, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "@/lib/api";
import { setAdminAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  
  const [step, setStep] = useState<"phone" | "otp" | "credentials">("phone");
  const [loading, setLoading] = useState(false);
  const [gateToken, setGateToken] = useState("");
  const [showPass, setShowPass] = useState(false);
  
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Mobile number is required");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await adminApi.checkNumber(cleanPhone, website);
      setStep("otp");
      toast.success("OTP verification code sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to request access code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const data = await adminApi.verifyOtpGate(cleanPhone, otp);
      setGateToken(data.gateToken);
      setStep("credentials");
      toast.success("Phone verified! Provide admin credentials.");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired access code");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const data = await adminApi.login(email, password, gateToken);
      
      // Save details to localStorage
      localStorage.setItem(
        "zupwell-admin",
        JSON.stringify({ name: data.admin.name, token: data.accessToken })
      );

      // Set auth cookies for server routing
      try {
        setAdminAuthCookie(data.accessToken);
      } catch (err) {}

      toast.success(`Welcome back, ${data.admin.name}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center pt-14 pb-12 px-6" style={{ background: 'var(--dk)' }}>
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors text-white hover:opacity-85">
        <ArrowLeft size={16} /> Back to Store
      </Link>

      {/* Decorative patterns */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full" style={{ background: 'rgba(255,92,0,0.06)' }} />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full" style={{ background: 'rgba(5,17,36,0.5)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-black text-white tracking-tight" style={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
              Zupwell<sup style={{ fontSize: "16px", fontWeight: 700, color: '#FF5C00', marginLeft: "2.5px", letterSpacing: "1px", verticalAlign: "super" }}>TM</sup>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-white">Admin Secure Gate</h1>
          <p className="mt-1 text-sm text-gray-300">
            {step === "phone" && "Enter your registered mobile number to request access"}
            {step === "otp" && "Enter the 6-digit verification code sent to your phone"}
            {step === "credentials" && "Complete credentials validation to launch console"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSendOtp} className="space-y-5">
                  {/* Honeypot field (hidden from view) */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label className="block mb-2 text-xs font-black tracking-widest text-[#0c1e39] uppercase opacity-75">Mobile Number</label>
                    <div className="flex items-center border-2 border-indigo-600/80 rounded-2xl p-1 bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                      <div className="flex items-center gap-1.5 px-3 py-2 shrink-0 select-none">
                        <span className="text-lg">🇮🇳</span>
                        <span className="text-sm font-bold text-gray-600">+91</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200 shrink-0" />
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                        required
                        className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-semibold"
                        placeholder="10-digit mobile number" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#FF5C00] hover:bg-[#E04B00] disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ cursor: "pointer" }}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <PhoneCall size={15} />
                        Send OTP Code
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-black tracking-widest text-[#0c1e39] uppercase opacity-75">Verification Code</label>
                      <button 
                        type="button" 
                        onClick={() => { setStep("phone"); setOtp(""); }} 
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Change number
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                      required
                      className="w-full px-4 py-3.5 text-center text-xl tracking-[0.5em] border-2 border-indigo-600/80 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 placeholder:text-gray-300 font-black"
                      placeholder="000000" 
                      autoFocus
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ cursor: "pointer" }}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Verify OTP & Proceed
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "credentials" && (
              <motion.div
                key="credentials-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-[#0C1E39] font-black tracking-widest uppercase text-[10px] opacity-80">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                      className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-[#F8FAFC]" 
                      placeholder="admin@zupwell.com" 
                      autoComplete="email" 
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1.5 text-[#0C1E39] font-black tracking-widest uppercase text-[10px] opacity-80">Password</label>
                    <div className="relative">
                      <input 
                        type={showPass ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value)} 
                        required
                        className="w-full border-2 border-gray-200 focus:border-indigo-600/80 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 bg-[#F8FAFC]" 
                        placeholder="••••••••" 
                        autoComplete="current-password" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0C1E39] hover:text-[#FF5C00]"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#FF5C00] hover:bg-[#E04B00] disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    style={{ cursor: "pointer" }}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn size={15} />
                        Validate Credentials
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
