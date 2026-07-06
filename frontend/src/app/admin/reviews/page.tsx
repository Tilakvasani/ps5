"use client";
import { useEffect, useState } from "react";
import { Star, CheckCircle, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const fetch = async () => { setLoading(true); try { setReviews(await adminApi.getReviews()); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const approve = async (id: number) => {
    try { await adminApi.approveReview(id); toast.success("Approved!"); fetch(); } catch (err: any) { toast.error(err.message); }
  };
  const del = async (id: number) => {
    if (!confirm("Delete review?")) return;
    try { await adminApi.deleteReview(id); toast.success("Deleted"); fetch(); } catch (err: any) { toast.error(err.message); }
  };

  const filtered = reviews.filter(r => tab === "all" || (tab === "pending" ? !r.isApproved : r.isApproved));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>Reviews</h1>
      </div>
      <div className="flex gap-1.5 mb-4">
        {["pending", "approved", "all"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="zpill font-semibold capitalize transition-all"
            style={{
              background: tab === t ? "var(--or)" : "transparent",
              color: tab === t ? "#FFFFFF" : "#8F9CAE",
              borderColor: tab === t ? "var(--or)" : "#1E2D4A",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="zcard h-20 animate-pulse" style={{ background: "#0C1E3E", borderColor: "#1E2D4A" }} />)
          : filtered.map((r: any) => (
          <div key={r.id} className="zcard">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />)}</div>
                  <span className="font-bold" style={{ color: "#FFFFFF", fontSize: "13px" }}>{r.user?.name}</span>
                  <span className="text-xs" style={{ color: "#8F9CAE" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  {r.isApproved ? <span className="zbadge zbadge-gr text-[9px]">Approved</span> : <span className="zbadge zbadge-am text-[9px]">Pending</span>}
                </div>
                <p className="text-sm font-semibold" style={{ color: "#627d98" }}>{r.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8F9CAE" }}>{r.body}</p>
                <p className="text-xs mt-1" style={{ color: "#627d98" }}>Product: {r.product?.name}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!r.isApproved && (
                  <button onClick={() => approve(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "var(--or)" }} onMouseEnter={e => { e.currentTarget.style.background = "#1E2D4A"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><CheckCircle size={14} /></button>
                )}
                <button onClick={() => del(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "#EF4444" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="zcard text-center py-10" style={{ color: "#8F9CAE" }}>No {tab} reviews</div>}
      </div>
    </div>
  );
}

