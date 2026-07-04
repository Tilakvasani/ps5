"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      toast.success("Welcome back!");
      router.push("/account");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "80vh", background: "var(--dk)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div className="zcard" style={{ width: "100%", maxWidth: "380px", padding: "30px" }}>
          <div style={{ textAlign: "center", marginBottom: "22px" }}>
            <Link href="/" style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-1px", color: "var(--wh)", textDecoration: "none" }}>
              zupwell<span style={{ color: "var(--or)" }}>•</span>
            </Link>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8F9CAE", marginTop: "4px", letterSpacing: "0.5px" }}>YOUR HYDRATION HQ</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--dk)", border: "1.5px solid var(--bd-soft)", borderRadius: "8px", padding: "3px", marginBottom: "20px" }}>
            <div style={{ flex: 1, textAlign: "center", background: "var(--dk-card)", borderRadius: "6px", padding: "9px", fontSize: "11px", fontWeight: 800, border: "1.5px solid var(--bd-soft)", color: "var(--wh)", letterSpacing: "0.5px" }}>SIGN IN</div>
            <Link href="/register" style={{ flex: 1, textAlign: "center", padding: "9px", fontSize: "11px", fontWeight: 700, color: "#8F9CAE", letterSpacing: "0.5px", textDecoration: "none" }}>REGISTER</Link>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input className="zinp" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="zinp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <div style={{ textAlign: "right" }}>
              <Link href="/forgot-password" style={{ fontSize: "11px", fontWeight: 700, color: "var(--or)", textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <button type="submit" className="zbtn-or" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "12px", borderRadius: "30px", justifyContent: "center", letterSpacing: "1px" }}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0" }}>
            <div style={{ flex: 1, height: "1.5px", background: "var(--bd-soft)" }} />
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9CAE" }}>OR</span>
            <div style={{ flex: 1, height: "1.5px", background: "var(--bd-soft)" }} />
          </div>

          <button className="zbtn-out" style={{ width: "100%", padding: "12px", justifyContent: "center", letterSpacing: "0.5px", borderRadius: "30px" }}>
            CONTINUE WITH GOOGLE
          </button>

          <div style={{ marginTop: "16px", background: "rgba(255, 92, 0, 0.08)", border: "1.5px solid var(--bd-soft)", borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.5px", marginBottom: "8px", color: "var(--wh)" }}>WHY JOIN ZUPWELL•?</div>
            {["Track orders in real-time", "Earn loyalty reward points", "Early access to new drops"].map(b => (
              <div key={b} style={{ fontSize: "11px", fontWeight: 600, display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px", color: "#8F9CAE" }}>
                <span style={{ color: "var(--or)", fontWeight: 900 }}>★</span> {b}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "11px", color: "#8F9CAE" }}>
            New here? <Link href="/register" style={{ color: "var(--or)", fontWeight: 700, textDecoration: "none" }}>Create account</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
