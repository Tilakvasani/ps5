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
    adminApi.getUsers({ page, perPage, search })
      .then((d: any) => { setUsers(d.users || d || []); setTotal(d.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px", marginBottom:"18px" }}>USERS</h1>
      <div style={{ position:"relative", marginBottom:"16px" }}>
        <Search size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#888" }} />
        <input className="zinp" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft:"34px" }} />
      </div>
      <div className="zcard" style={{ padding:0, overflow:"hidden" }}>
        <div className="ztr ztr-head" style={{ gridTemplateColumns:"1.5fr 1.5fr 0.8fr 0.8fr 80px" }}>
          <span>NAME</span><span>EMAIL</span><span>PHONE</span><span>JOINED</span><span>ORDERS</span>
        </div>
        {loading ? (
          [...Array(6)].map((_,i) => (
            <div key={i} className="ztr" style={{ gridTemplateColumns:"1.5fr 1.5fr 0.8fr 0.8fr 80px", background:i%2?"#FFF":"#FAFAFA" }}>
              {[...Array(5)].map((_,j) => <div key={j} style={{ height:"14px", background:"#F0F0F0", borderRadius:"4px" }} />)}
            </div>
          ))
        ) : users.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:"13px" }}>No users found.</div>
        ) : users.map((u, i) => (
          <div key={u.id} className="ztr" style={{ gridTemplateColumns:"1.5fr 1.5fr 0.8fr 0.8fr 80px", background:i%2?"#FFF":"#FAFAFA" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"#FF4500", color:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900, flexShrink:0 }}>
                {u.name?.[0]?.toUpperCase() || "?"}
              </div>
              <span style={{ fontSize:"12px", fontWeight:700 }}>{u.name}</span>
            </div>
            <span style={{ fontSize:"11px", color:"#888" }}>{u.email}</span>
            <span style={{ fontSize:"11px", color:"#888" }}>{u.phone || "—"}</span>
            <span style={{ fontSize:"11px", fontWeight:600 }}>{new Date(u.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"2-digit" })}</span>
            <span style={{ fontSize:"12px", fontWeight:800 }}>{u._count?.orders ?? 0}</span>
          </div>
        ))}
      </div>
      {total > perPage && (
        <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", marginTop:"12px" }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="zpill zpill-off" style={{ fontSize:"10px", padding:"5px 12px" }}>← PREV</button>
          <span style={{ fontSize:"11px", fontWeight:700, padding:"6px 12px" }}>Page {page} of {Math.ceil(total/perPage)}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page>=Math.ceil(total/perPage)} className="zpill zpill-off" style={{ fontSize:"10px", padding:"5px 12px" }}>NEXT →</button>
        </div>
      )}
    </div>
  );
}
