"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Truck, RotateCcw, ShieldCheck, Star, ChevronLeft, Droplets, Zap, CheckCircle, Leaf, FlaskConical } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { productsApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

function sanitizeHtml(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "").replace(/on\w+="[^"]*"/gi, "");
}

const TABS = ["WHAT'S IN IT", "HOW TO USE", "REVIEWS"];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [mainImg, setMainImg] = useState(0);
  const { addToCart } = useStore();

  useEffect(() => {
    productsApi.get(params.slug).then(d => { setProduct(d); setLoading(false); }).catch(() => setLoading(false));
  }, [params.slug]);

  const handleAdd = () => {
    if (!product) return;
    const img = product.images?.find((i: any) => i.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
    addToCart({ productId: product.id, name: product.name, sku: product.slug, price: Number(product.sellingPrice), qty, imageUrl: img, unit: product.unit });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {[0,1].map(i => <div key={i} style={{ background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)", borderRadius: "10px", height: "400px", animation: "pulse 1.5s infinite" }} />)}
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "14px" }}>😬</div>
        <h2 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "10px", color: "var(--wh)" }}>PRODUCT NOT FOUND</h2>
        <Link href="/products" className="zbtn-or" style={{ borderRadius: "30px" }}>BACK TO SHOP</Link>
      </div>
      <Footer />
    </>
  );

  const images = product.images || [];
  const discount = Number(product.discountPercent);
  const reviews = product.reviews || [];
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) : null;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: 700, color: "#8F9CAE", letterSpacing: "0.5px", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "#8F9CAE", textDecoration: "none" }}>HOME</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#8F9CAE", textDecoration: "none" }}>SHOP</Link>
          <span>/</span>
          <span style={{ color: "var(--wh)" }}>{product.name.toUpperCase()}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "32px" }}>
          {/* Images */}
          <div>
            <div style={{ background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)", borderRadius: "12px", height: "320px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", overflow: "hidden", position: "relative" }}>
              {images[mainImg]?.imageUrl ? (
                <img src={images[mainImg].imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ fontSize: "80px" }}>🍊</div>
              )}
              {discount > 0 && (
                <div className="zbadge zbadge-or" style={{ position: "absolute", top: "12px", left: "12px", fontSize: "10px", padding: "4px 10px" }}>-{discount}% OFF</div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, 1fr)`, gap: "6px" }}>
                {images.slice(0, 4).map((img: any, i: number) => (
                  <div key={i} onClick={() => setMainImg(i)}
                    style={{ border: `${mainImg === i ? "2px solid var(--or)" : "1.5px solid var(--bd-soft)"}`, borderRadius: "7px", height: "56px", overflow: "hidden", cursor: "pointer", background: "var(--dk-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={img.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", letterSpacing: "1px", marginBottom: "6px" }}>{product.brand.toUpperCase()}</div>
            )}
            <h1 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "8px", color: "var(--wh)" }}>{product.name}</h1>

            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                <span style={{ fontSize: "13px", color: "var(--or)", fontWeight: 900 }}>{"★".repeat(Math.round(avgRating))}</span>
                <span style={{ fontSize: "12px", color: "#8F9CAE", fontWeight: 600 }}>{avgRating.toFixed(1)} · {reviews.length} reviews</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", color: "var(--wh)" }}>₹{Number(product.sellingPrice).toFixed(0)}</span>
              {discount > 0 && (
                <span style={{ fontSize: "14px", color: "#8F9CAE", textDecoration: "line-through", fontWeight: 600 }}>₹{Number(product.basePrice).toFixed(0)}</span>
              )}
              {discount > 0 && <span className="zbadge zbadge-lm">{discount}% OFF</span>}
            </div>
            <div style={{ fontSize: "11px", color: "var(--lm)", fontWeight: 700, marginBottom: "18px" }}>Inclusive of all taxes · {product.unit}</div>

            <div className="zdiv" />

            {/* Qty */}
            <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.8px", marginBottom: "10px", color: "#8F9CAE" }}>QUANTITY</div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", border: "1.5px solid var(--bd-soft)", borderRadius: "7px", padding: "8px 16px", fontWeight: 900, fontSize: "14px", background: "var(--dk-card)" }}>
                <button onClick={() => qty > 1 && setQty(q => q - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8F9CAE", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}>−</button>
                <span style={{ color: "var(--wh)" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--or)", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}>+</button>
              </div>
              <button onClick={handleAdd} className="zbtn-or" style={{ flex: 1, padding: "13px", fontSize: "12px", justifyContent: "center", letterSpacing: "0.5px", borderRadius: "30px" }}>
                <ShoppingCart size={14} /> ADD TO CART
              </button>
            </div>
            <button className="zbtn-dk" style={{ width: "100%", padding: "13px", fontSize: "12px", justifyContent: "center", letterSpacing: "0.5px", marginBottom: "18px", borderRadius: "30px", background: "var(--dk-card)", border: "1.5px solid var(--bd-soft)", color: "var(--wh)" }}>
              BUY IT NOW
            </button>

            {/* Trust */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
              {[
                { icon: Truck,       label: "FREE SHIP ₹500+" },
                { icon: RotateCcw,   label: "20-DAY RETURNS" },
                { icon: ShieldCheck, label: "LAB CERTIFIED" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ textAlign: "center", fontSize: "9px", fontWeight: 900, color: "#8F9CAE", letterSpacing: "0.3px" }}>
                  <Icon size={18} color="var(--or)" style={{ display: "block", margin: "0 auto 5px" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1.5px solid var(--bd-soft)", marginBottom: "20px" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              style={{ padding: "12px 20px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.5px", border: "none", cursor: "pointer", background: "transparent", borderBottom: activeTab === i ? "2.5px solid var(--or)" : "2.5px solid transparent", color: activeTab === i ? "var(--or)" : "#8F9CAE", marginBottom: "-1.5px" }}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div>
            {product.description ? (
              <div style={{ fontSize: "13px", color: "#8F9CAE", lineHeight: 1.8, marginBottom: "20px" }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} />
            ) : (
              <p style={{ fontSize: "13px", color: "#8F9CAE", lineHeight: 1.8, marginBottom: "20px" }}>
                Fast-dissolving effervescent tablets with 5 essential electrolytes and B-vitamins. Drop one in water for instant hydration and sustained stamina, without the sugar crash.
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[{ s: "Na+", n: "Sodium" },{ s: "K+", n: "Potassium" },{ s: "Mg²+", n: "Magnesium" },{ s: "B6+C", n: "Vitamins" }].map(({ s, n }) => (
                <div key={n} className="zcard" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "var(--or)", letterSpacing: "-0.5px" }}>{s}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, marginTop: "4px", color: "var(--wh)" }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {[
              { icon: Droplets,     step: "01", title: "DROP IT",         desc: "Drop 1 tablet into 250ml of water" },
              { icon: Zap,          step: "02", title: "WATCH THE FIZZ",  desc: "Let it fully dissolve — takes about 30 seconds" },
              { icon: CheckCircle,  step: "03", title: "DRINK & GO",      desc: "Sip and feel the difference" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="zcard" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--or)", letterSpacing: "1px", marginBottom: "8px" }}>{step}</div>
                <Icon size={22} color="var(--wh)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.3px", marginBottom: "5px", color: "var(--wh)" }}>{title}</div>
                <div style={{ fontSize: "11px", color: "#8F9CAE", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div>
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#888", fontSize: "13px" }}>No reviews yet. Be the first!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {reviews.map((r: any) => (
                  <div key={r.id} className="zcard">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--wh)" }}>{r.user?.name || "Customer"}</span>
                        <div style={{ fontSize: "11px", color: "var(--or)", fontWeight: 900 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                      </div>
                      <span style={{ fontSize: "10px", color: "#8F9CAE", fontWeight: 600 }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#8F9CAE", lineHeight: 1.7 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
