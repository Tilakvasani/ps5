"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setUser(data.user);
      setToken(data.accessToken);
      toast.success("Account created! Welcome to Zupwell 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F4F6FA] flex items-center justify-center px-6 py-12">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0B2C6F] transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* BG blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#F47C41]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#0B2C6F]/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <span className="text-4xl font-display font-black inline-flex items-start" style={{
              background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Zupwell
              <sup style={{
                fontSize: "0.4em",
                fontWeight: 700,
                lineHeight: 1,
                marginTop: "4px",
                background: "linear-gradient(90deg, #F47C41 0%, #0B2C6F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>™</sup>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-black text-[#111827]">Create account</h1>
          <p className="text-[#6B7280] mt-1">Start your wellness journey today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={update("name")} required
                className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={update("email")} required
                className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={update("phone")} required
                className="input-field" placeholder="+91 9999999999" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={update("password")} required minLength={8}
                  className="input-field pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2C6F]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
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

          <p className="text-center text-xs text-[#9CA3AF] mt-4">
            By creating an account you agree to our{" "}
            <Link href="#" className="text-[#F47C41] hover:text-[#d9673a]">Terms</Link> and{" "}
            <Link href="#" className="text-[#F47C41] hover:text-[#d9673a]">Privacy Policy</Link>
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D9DEE8]" />
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wide">or</span>
            <div className="h-px flex-1 bg-[#D9DEE8]" />
          </div>

          <p className="text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#F47C41] hover:text-[#d9673a]">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
