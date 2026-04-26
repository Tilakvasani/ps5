"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Users, Package, IndianRupee, AlertTriangle, ArrowUpRight } from "lucide-react";
import { adminApi } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="card hover:border-white/20 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          <ArrowUpRight size={12} className={change < 0 ? "rotate-180" : ""} />{Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-display font-black text-white">{value}</p>
    <p className="text-sm text-white/40 mt-1">{title}</p>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-3 text-sm">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }} className="font-bold">₹{p.value?.toLocaleString("en-IN")}</p>)}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.revenueChart(), adminApi.topProducts()])
      .then(([s, r, t]) => { setStats(s); setRevenue(r); setTopProducts(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { title: "Total Revenue", value: stats ? `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}` : "—", icon: IndianRupee, change: stats?.revenueChange, color: "bg-pink-500" },
    { title: "Total Orders", value: stats?.totalOrders ?? "—", icon: ShoppingBag, change: stats?.ordersChange, color: "bg-violet-500" },
    { title: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, change: stats?.usersChange, color: "bg-blue-500" },
    { title: "Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-emerald-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s, i) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Alerts */}
      {stats?.lowStockCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 mb-6 text-sm">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-200"><span className="font-bold">{stats.lowStockCount} products</span> are low on stock.</span>
          <Link href="/admin/inventory" className="ml-auto text-yellow-400 hover:text-yellow-300 font-semibold">View →</Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-white">Revenue (Last 30 Days)</h2>
            <TrendingUp size={16} className="text-pink-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#ec4899" fill="url(#pinkGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="font-display font-bold text-white mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.slice(0, 6).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/20 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                  <p className="text-xs text-white/40">{p.totalSold} units sold</p>
                </div>
                <span className="text-sm font-bold text-pink-400">₹{Number(p.totalRevenue).toLocaleString("en-IN")}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-white/30 text-sm">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-pink-400 hover:text-pink-300">View all →</Link>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/30 border-b border-white/10">
                  {["Order #", "Customer", "Amount", "Status", "Date"].map(h => <th key={h} className="pb-3 font-semibold pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 font-mono text-white font-semibold">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-white/70">{o.user?.name || "—"}</td>
                    <td className="py-3 pr-4 font-bold text-white">₹{Number(o.totalAmount).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${({ pending:"badge-warning",delivered:"badge-success",cancelled:"badge-danger",shipped:"badge-purple" } as any)[o.status] || "badge-info"}`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-white/40">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-white/30 text-sm py-4">No orders yet</p>}
      </div>
    </div>
  );
}
