"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending"|"approved">("pending");

  const load = async () => { setLoading(true); try { setReviews(await adminApi.getReviews()); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    try { await adminApi.approveReview(id); toast.success("Approved!"); load(); } catch (e: any) { toast.error(e.message); }
  };
  const del = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    try { await adminApi.deleteReview(id); toast.success("Deleted!"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const filtered = reviews.filter(r => tab === "pending" ? !r.isApproved : r.isApproved);

  return (
    <div>
      <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px", marginBottom:"18px" }}>REVIEWS</h1>

      <div style={{ display:"flex", gap:"6px", marginBottom:"16px" }}>
        {(["pending","approved"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`zpill ${tab===t?"zpill-on":"zpill-off"}`} style={{ fontSize:"10px", padding:"5px 14px" }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {[...Array(4)].map((_,i) => <div key={i} style={{ height:"80px", background:"#F0F0F0", borderRadius:"10px" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#888", fontSize:"13px" }}>No {tab} reviews.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {filtered.map(r => (
            <div key={r.id} className="zcard" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"12px", alignItems:"start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"#FF4500", color:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900, flexShrink:0 }}>
                    {r.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:800 }}>{r.user?.name || "Anonymous"}</div>
                    <div style={{ fontSize:"10px", color:"#888" }}>{r.product?.name || "Unknown product"}</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:"12px", color:"#FF4500", fontWeight:900 }}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                  <div style={{ fontSize:"10px", color:"#888", fontWeight:600 }}>{new Date(r.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}</div>
                </div>
                {r.title && <div style={{ fontSize:"12px", fontWeight:700, marginBottom:"4px" }}>{r.title}</div>}
                <p style={{ fontSize:"12px", color:"#555", lineHeight:1.7 }}>{r.body || r.comment}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {!r.isApproved && (
                  <button onClick={() => approve(r.id)} className="zbtn-or" style={{ fontSize:"10px", padding:"7px 12px", whiteSpace:"nowrap" }}>
                    <CheckCircle size={12} /> APPROVE
                  </button>
                )}
                <button onClick={() => del(r.id)} className="zbtn-out" style={{ fontSize:"10px", padding:"7px 12px", borderColor:"#DC2626", color:"#DC2626" }}>
                  <Trash2 size={12} /> DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
