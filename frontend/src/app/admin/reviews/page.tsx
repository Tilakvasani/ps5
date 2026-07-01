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
        <h1 className="text-3xl font-black text-[#001c54]">Reviews</h1>
      </div>
      <div className="flex gap-1 mb-4">
        {["pending", "approved", "all"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "bg-[#EB9220] text-[#001c54]" : "border border-[#E8E2D9] text-[#45353E] hover:text-[#001c54]"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-[#FCFAF6]" />)
          : filtered.map((r: any) => (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}</div>
                  <span className="font-bold text-[#001c54] text-sm">{r.user?.name}</span>
                  <span className="text-xs text-[#45353E]">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  {r.isApproved ? <span className="badge badge-success text-[10px]">Approved</span> : <span className="badge badge-warning text-[10px]">Pending</span>}
                </div>
                <p className="text-sm text-[#001c54] font-medium">{r.title}</p>
                <p className="text-sm text-[#45353E] mt-0.5">{r.body}</p>
                <p className="text-xs text-[#45353E] mt-1">Product: {r.product?.name}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!r.isApproved && (
                  <button onClick={() => approve(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-[#EB9220]/60 hover:text-[#EB9220] hover:bg-emerald-400/10 transition-all"><CheckCircle size={14} /></button>
                )}
                <button onClick={() => del(r.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="card text-center py-10 text-[#45353E]">No {tab} reviews</div>}
      </div>
    </div>
  );
}
