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
        <div><h1 className="text-3xl font-black text-[#002A30]">Users</h1><p className="text-[#45353E] text-sm mt-1">{total} registered users</p></div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45353E]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email, phone..." className="input-field pl-9 text-sm" />
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#E8E2D9] text-[#45353E] text-left">
            {["User", "Phone", "Orders", "Total Spent", "Verified", "Joined"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {loading ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 rounded bg-[#FCFAF6] animate-pulse" /></td></tr>)
              : users.map(u => (
              <tr key={u.id} className="hover:bg-[#FCFAF6] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#FCFAF6] flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div><p className="font-semibold text-[#002A30]">{u.name}</p><p className="text-xs text-[#45353E]">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#45353E]">{u.phone || "—"}</td>
                <td className="px-4 py-3 text-[#45353E]">{u._count?.orders ?? 0}</td>
                <td className="px-4 py-3 font-bold text-[#002A30]">₹{Number(u.totalSpent || 0).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`badge ${u.isVerified ? "badge-success" : "badge-warning"}`}>{u.isVerified ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3 text-[#45353E] text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {Math.ceil(total / perPage) > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-[#E8E2D9]">
            <p className="text-xs text-[#45353E]">Page {page} of {Math.ceil(total / perPage)}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / perPage)} className="btn-outline text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
