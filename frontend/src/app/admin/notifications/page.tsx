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
          <h1 className="text-3xl font-display font-black text-white">Notifications</h1>
          {unread > 0 && <p className="text-white/40 text-sm mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-outline flex items-center gap-2 text-sm py-2"><CheckCheck size={14} /> Mark all read</button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-16 animate-pulse bg-white/5" />) :
          notifications.length === 0 ? (
            <div className="card text-center py-16 text-white/30">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : notifications.map((n: any) => (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className={`card flex items-start gap-4 cursor-pointer transition-all ${!n.isRead ? "border-pink-500/20 bg-pink-500/5" : "opacity-60"}`}>
              <div className="text-2xl flex-shrink-0">{ICON[n.type] || "🔔"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{n.title}</p>
                <p className="text-sm text-white/50 mt-0.5">{n.message}</p>
                <p className="text-xs text-white/30 mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
              </div>
              {!n.isRead && <div className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0 mt-1.5" />}
            </div>
          ))
        }
      </div>
    </div>
  );
}
