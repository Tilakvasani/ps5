"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setNotifs(await adminApi.getNotifications()); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    try { await adminApi.markRead(id); setNotifs(n => n.map(x => x.id===id ? { ...x, isRead:true } : x)); } catch {}
  };
  const markAll = async () => {
    try { await adminApi.markAllRead(); setNotifs(n => n.map(x => ({ ...x, isRead:true }))); toast.success("All marked as read!"); } catch {}
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <h1 style={{ fontSize:"24px", fontWeight:900, letterSpacing:"-1px" }}>NOTIFICATIONS</h1>
          {unread > 0 && <div style={{ fontSize:"11px", color:"#FF4500", fontWeight:700, marginTop:"2px" }}>{unread} unread</div>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="zbtn-out" style={{ fontSize:"11px", padding:"8px 14px" }}>
            <CheckCheck size={13} /> MARK ALL READ
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {[...Array(5)].map((_,i) => <div key={i} style={{ height:"64px", background:"#F0F0F0", borderRadius:"10px" }} />)}
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px" }}>
          <Bell size={40} color="#E0E0E0" style={{ margin:"0 auto 14px" }} />
          <div style={{ fontSize:"14px", color:"#888", fontWeight:600 }}>You're all caught up!</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className="zcard" style={{ display:"flex", gap:"12px", alignItems:"flex-start", cursor: n.isRead ? "default" : "pointer", background: n.isRead ? "#FAFAFA" : "#FFF", borderLeft: n.isRead ? "1.5px solid #E0E0E0" : "3px solid #FF4500" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: n.isRead ? "transparent" : "#FF4500", flexShrink:0, marginTop:"5px" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"12px", fontWeight: n.isRead ? 600 : 800, color: n.isRead ? "#666" : "#0A0A0A" }}>{n.message || n.title}</div>
                <div style={{ fontSize:"10px", color:"#888", fontWeight:600, marginTop:"3px" }}>{new Date(n.createdAt).toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
