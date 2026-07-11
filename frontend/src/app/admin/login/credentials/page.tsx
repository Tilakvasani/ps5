"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { adminApi } from "@/lib/api";
import { setAdminAuthCookie } from "@/lib/auth-cookie";
import toast from "react-hot-toast";

export default function AdminCredentialsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isValidGate, setIsValidGate] = useState(false);
  const [gateToken, setGateToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("zupwell-admin-gate-token") || "";
    if (!token) {
      setChecking(false);
      setIsValidGate(false);
      return;
    }

    setGateToken(token);
    adminApi.verifyGate(token)
      .then((res) => {
        if (res.valid) {
          setIsValidGate(true);
        } else {
          setIsValidGate(false);
          localStorage.removeItem("zupwell-admin-gate-token");
        }
      })
      .catch(() => {
        setIsValidGate(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adminData = await adminApi.login(email, password, gateToken);
      localStorage.setItem(
        "zupwell-admin",
        JSON.stringify({ name: adminData.admin.name, token: adminData.accessToken })
      );
      try {
        setAdminAuthCookie(adminData.accessToken);
      } catch (err) {}
      
      // Clean up gate token after successful authentication
      localStorage.removeItem("zupwell-admin-gate-token");
      
      toast.success(`Welcome, ${adminData.admin.name}!`);
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
        <div className="h-8 w-8 rounded-full animate-spin" style={{ border: "4px solid rgba(255,92,0,0.2)", borderTopColor: "var(--or)" }} />
      </div>
    );
  }

  // Cloaked 404 Page Fallback for unauthorized/unverified requests
  if (!isValidGate) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--dk)" }}>
        <div className="text-center">
          <h1 className="text-[10rem] font-black leading-none" style={{ color: "var(--or)", letterSpacing: "-0.05em" }}>
            404
          </h1>
          <h2 className="text-2xl font-black mt-2" style={{ color: "#FFFFFF" }}>
            Page not found
          </h2>
          <p className="mt-2 max-w-sm mx-auto" style={{ color: "#F8F8F8", opacity: 0.85 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className="zbtn-or mt-8 inline-block" style={{ padding: "12px 32px" }}>
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center pt-14 pb-12 px-6" style={{ background: 'var(--dk)' }}>
      <Link href="/admin/login" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: '#F8F8F8' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={e => (e.currentTarget.style.color = '#F8F8F8')}>
        <ArrowLeft size={16} /> Back to Phone Gate
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
          <h1 className="text-2xl font-black" style={{ color: '#FFFFFF' }}>Admin Credentials</h1>
          <p className="mt-1" style={{ color: '#F8F8F8' }}>Enter your email and password to access the portal</p>
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
