"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const data = await adminApi.checkNumber(cleanPhone);
      localStorage.setItem("zupwell-admin-gate-token", data.gateToken);
      toast.success("Phone verified! Proceed to credentials gate.");
      router.push("/admin/login/credentials");
    } catch (err: any) {
      toast.error(err.message || "Unauthorized phone number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center pt-14 pb-12 px-6" style={{ background: 'var(--dk)' }}>
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors text-white hover:opacity-80">
        <ArrowLeft size={16} /> Back to Store
      </Link>

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
          <p className="mt-1 text-sm text-gray-300">Enter your registered mobile number to request portal access</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-xs font-black tracking-widest text-[#0c1e39] uppercase opacity-75">Mobile Number</label>
              <div className="flex items-center border-2 border-indigo-600/80 rounded-2xl p-1 bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                {/* Flag prefix */}
                <div className="flex items-center gap-1.5 px-3 py-2 shrink-0 select-none">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm font-bold text-gray-600">+91</span>
                </div>
                {/* Vertical Divider */}
                <div className="w-px h-6 bg-gray-200 shrink-0" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required
                  className="w-full px-3 py-2 text-base text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 font-semibold"
                  placeholder="10-digit mobile number" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#FF5C00] hover:bg-[#E04B00] disabled:bg-gray-300 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <PhoneCall size={15} />
                  Verify Phone Number
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
