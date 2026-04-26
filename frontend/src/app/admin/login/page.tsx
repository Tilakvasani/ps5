"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package2, Eye, EyeOff, Lock } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await adminApi.login(email, password);
      localStorage.setItem("zupwell-admin", JSON.stringify({ name: data.admin.name, token: data.accessToken }));
      // also update api auth header
      toast.success(`Welcome, ${data.admin.name}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[#F47C41]/8 blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F47C41] to-[#FFD166] mb-4">
            <Package2 size={28} className="text-black" />
          </div>
          <h1 className="text-3xl font-display font-black text-[#111827]">Admin Panel</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Zupwell Dashboard</p>
        </div>
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-6 text-[#6B7280] text-sm">
            <Lock size={14} /> <span>Restricted Access</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="admin@zupwell.in" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2C6F]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-[#D9DEE8] border-t-transparent animate-spin" />Signing in...</span> : "Sign In to Dashboard"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
