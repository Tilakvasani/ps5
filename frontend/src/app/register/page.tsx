"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { authApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, phone: "", password });
      setUser(data.user);
      toast.success("Account created!");
      router.push("/account");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
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
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#8F9CAE", marginTop: "4px", letterSpacing: "0.5px" }}>JOIN THE SQUAD</div>
          </div>

          <div style={{ display: "flex", background: "var(--dk)", border: "1.5px solid var(--bd-soft)", borderRadius: "8px", padding: "3px", marginBottom: "20px" }}>
            <Link href="/login" style={{ flex: 1, textAlign: "center", padding: "9px", fontSize: "11px", fontWeight: 700, color: "#8F9CAE", letterSpacing: "0.5px", textDecoration: "none" }}>SIGN IN</Link>
            <div style={{ flex: 1, textAlign: "center", background: "var(--dk-card)", borderRadius: "6px", padding: "9px", fontSize: "11px", fontWeight: 800, border: "1.5px solid var(--bd-soft)", color: "var(--wh)", letterSpacing: "0.5px" }}>REGISTER</div>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input className="zinp" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="zinp" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="zinp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="zbtn-or" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "12px", borderRadius: "30px", justifyContent: "center", letterSpacing: "1px" }}>
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "11px", color: "#8F9CAE" }}>
            Already a member? <Link href="/login" style={{ color: "var(--or)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
