"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { setLoading(true); try { setNotifications(await adminApi.getNotifications()); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id: number) => {
    try { await adminApi.markRead(id); setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n)); } catch {}
  };

  const markAll = async () => {
    try { await adminApi.markAllRead(); setNotifications(ns => ns.map(n => ({ ...n, isRead: true }))); toast.success("All marked as read"); } catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  const ICON: Record<string, string> = {
    new_order: "🛍️", low_stock: "⚠️", new_user: "👤", payment: "💳", review: "⭐",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#627d98", letterSpacing: "-0.04em" }}>Notifications</h1>
          {unread > 0 && <p className="text-sm mt-1" style={{ color: "#8F9CAE" }}>{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="zbtn-out flex items-center gap-2 text-sm py-2"><CheckCheck size={14} /> Mark all read</button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="zcard h-16 animate-pulse" style={{ background: "#0C1E3E", borderColor: "#1E2D4A" }} />) :
          notifications.length === 0 ? (
            <div className="zcard text-center py-16" style={{ color: "#8F9CAE" }}>
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : notifications.map((n: any) => (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className="zcard flex items-start gap-4 cursor-pointer transition-all"
              style={{
                background: !n.isRead ? "rgba(255, 92, 0, 0.08)" : "#0C1E3E",
                borderColor: !n.isRead ? "var(--or)" : "#1E2D4A",
                opacity: n.isRead ? 0.65 : 1,
              }}
            >
              <div className="text-2xl flex-shrink-0">{ICON[n.type] || "🔔"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>{n.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8F9CAE" }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: "#627d98" }}>{new Date(n.createdAt).toLocaleString("en-IN")}</p>
              </div>
              {!n.isRead && <div className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "var(--or)" }} />}
            </div>
          ))
        }
      </div>
    </div>
  );
}

