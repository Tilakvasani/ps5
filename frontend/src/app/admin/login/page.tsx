"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { adminApi } from "@/lib/api";
import { setAdminAuthCookie } from "@/lib/auth-cookie";
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
      const adminData = await adminApi.login(email, password);
      localStorage.setItem(
        "zupwell-admin",
        JSON.stringify({ name: adminData.admin.name, token: adminData.accessToken })
      );
      try {
        setAdminAuthCookie(adminData.accessToken);
      } catch (err) {}
      toast.success(`Welcome, ${adminData.admin.name}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Admin Portal</h1>
          <p className="mt-1" style={{ color: '#F8F8F8' }}>Sign in to manage store operations</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ color: '#0C1E39', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.8 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input-field" placeholder="admin@zupwell.com" autoComplete="email" />
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
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </span>
                : "Sign In as Admin"
              }
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
