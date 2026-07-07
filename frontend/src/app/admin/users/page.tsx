"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers({ page, perPage, search }).then(d => { setUsers(d.users); setTotal(d.total); }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#0C1E39" }}>Users</h1>
          <p className="text-sm mt-1" style={{ color: "#4A5568" }}>{total} registered users</p>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email, phone..." className="input-field pl-9 text-sm" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39" }} />
        </div>
      </div>
      <div className="card p-0 overflow-hidden" style={{ background: "#FFFFFF", border: "1.5px solid rgba(12, 30, 57, 0.08)", boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ borderBottom: "1.5px solid rgba(12, 30, 57, 0.08)", background: "#0C1E39", color: "#F8F8F8" }}>
              {["User", "Phone", "Orders", "Total Spent", "Verified", "Joined"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(12,30,57,0.08)]">
            {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(12, 30, 57, 0.08)" }} /></td></tr>)
              : users.map(u => (
              <tr key={u.id} className="transition-colors border-b" style={{ color: "#0C1E39", borderColor: "rgba(12, 30, 57, 0.08)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8F8F8")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: "#0C1E39", color: "#FFFFFF" }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "#0C1E39" }}>{u.name}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "#4A5568" }}>{u.phone || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#4A5568" }}>{u._count?.orders ?? 0}</td>
                <td className="px-4 py-3 font-bold" style={{ color: "#0C1E39" }}>₹{Number(u.totalSpent || 0).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`badge ${u.isVerified ? "badge-success" : "badge-warning"}`}>{u.isVerified ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {Math.ceil(total / perPage) > 1 && (
          <div className="flex justify-between items-center px-4 py-3" style={{ borderTop: "1.5px solid rgba(12, 30, 57, 0.08)" }}>
            <p className="text-xs" style={{ color: "#4A5568" }}>Page {page} of {Math.ceil(total / perPage)}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / perPage)} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30" style={{ border: "1.5px solid rgba(12, 30, 57, 0.08)", color: "#0C1E39", borderRadius: "30px" }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
