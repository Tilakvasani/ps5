"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStore();
  const router = useRouter();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

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
    <main className="relative min-h-screen bg-[#050505] flex items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-yellow-400/8 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center">
              <Package size={20} className="text-black" />
            </div>
            <span className="text-2xl font-display font-black gradient-text">Zupwell</span>
          </Link>
          <h1 className="text-3xl font-display font-black text-white">Create account</h1>
          <p className="text-white/40 mt-1">Start ordering packaging materials today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={update("name")} required className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={update("email")} required className="input-field" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={update("phone")} required className="input-field" placeholder="+91 9999999999" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} required minLength={8} className="input-field pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Creating account...</span> : "Create Free Account"}
            </motion.button>
          </form>

          <p className="text-center text-xs text-white/30 mt-4">
            By creating an account you agree to our <Link href="#" className="text-pink-400">Terms</Link> and <Link href="#" className="text-pink-400">Privacy Policy</Link>
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30 uppercase">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-pink-400 hover:text-pink-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
