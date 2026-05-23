"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingBag, Users, Package, IndianRupee,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Zap,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const fmt  = (n: number) => Math.round(n).toLocaleString("en-IN");
const fmtK = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${Math.round(n)}`;

function ChangeBadge({ pct }: { pct?: number }) {
  if (pct === undefined || pct === null) return null;
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-500" : "text-red-400"}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(pct)}%
    </span>
  );
}

const StatCard = ({ title, value, sub, icon: Icon, change, color, href }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="card hover:shadow-sm transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <ChangeBadge pct={change} />
    </div>
    <p className="text-2xl font-black text-[#002A30]">{value}</p>
    <p className="text-sm text-[#45353E] mt-0.5">{title}</p>
    {sub && <p className="text-xs text-[#8C8276] mt-1">{sub}</p>}
    {href && <Link href={href} className="text-xs text-[#48C062] hover:underline mt-2 block">View →</Link>}
  </motion.div>
);

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E8E2D9] bg-white p-3 text-sm shadow-sm">
      <p className="text-[#45353E] mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name === "profit" ? "Profit" : "Revenue"}: ₹{fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", processing: "#8B5CF6",
  shipped: "#06B6D4", delivered: "#10B981", cancelled: "#EF4444",
};
const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", confirmed: "badge-info", processing: "badge-purple",
  shipped: "badge-purple", delivered: "badge-success", cancelled: "badge-danger",
};

export default function AdminDashboard() {
  const [stats, setStats]             = useState<any>(null);
  const [revenue, setRevenue]         = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartDays, setChartDays]     = useState(30);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.revenueChart(30), adminApi.topProducts()])
      .then(([s, r, t]) => { setStats(s); setRevenue(r); setTopProducts(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    adminApi.revenueChart(chartDays).then(setRevenue).catch(() => {});
  }, [chartDays]);

  const statusData  = stats ? Object.entries(stats.statusBreakdown || {}) : [];
  const maxRevenue  = Math.max(...topProducts.map((p: any) => p.totalRevenue || 0), 1);
  const statusTotal = statusData.reduce((s, [, v]) => s + (v as number), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#002A30]">Dashboard</h1>
          <p className="text-[#45353E] text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/orders?status=pending">
            <button className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
              <Clock size={14} /> Pending
              {stats?.statusBreakdown?.pending > 0 && (
                <span className="bg-[#48C062] text-white text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">
                  {stats.statusBreakdown.pending}
                </span>
              )}
            </button>
          </Link>
          <Link href="/admin/products/new">
            <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <Zap size={14} /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-xl border border-yellow-400/40 bg-yellow-50 px-4 py-3 text-sm">
          <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
          <span className="text-yellow-800">
            <span className="font-bold">{stats.lowStockCount} product{stats.lowStockCount > 1 ? "s" : ""}</span> are low on stock.
          </span>
          <Link href="/admin/inventory" className="ml-auto text-yellow-600 hover:text-yellow-800 font-semibold">Fix now →</Link>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"  icon={IndianRupee} color="bg-[#48C062]"
          value={stats ? `₹${fmt(stats.totalRevenue)}` : "—"}
          sub={stats ? `Today ₹${fmt(stats.todayRevenue)}` : undefined}
          change={stats?.revenueChange} />
        <StatCard title="Total Profit" icon={TrendingUp} color="bg-emerald-500"
          value={stats ? `₹${fmt(stats.totalProfit)}` : "—"}
          sub={stats ? `Margin ${stats.profitMargin}%` : undefined}
          change={stats?.profitChange} />
        <StatCard title="Total Orders" icon={ShoppingBag} color="bg-[#48C062]"
          value={stats?.totalOrders ?? "—"}
          sub={stats ? `Avg ₹${fmt(stats.avgOrderValue)}` : undefined}
          change={stats?.ordersChange} href="/admin/orders" />
        <StatCard title="Total Users" icon={Users} color="bg-[#002A30]"
          value={stats?.totalUsers ?? "—"}
          change={stats?.usersChange} href="/admin/users" />
      </div>

      {/* Revenue + Profit Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#48C062]" />
            <h2 className="font-bold text-[#002A30]">Revenue & Profit</h2>
          </div>
          <div className="flex items-center gap-1 bg-[#FCFAF6] rounded-lg p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setChartDays(d)}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${chartDays === d ? "bg-white text-[#48C062] shadow-sm" : "text-[#45353E] hover:text-[#002A30]"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs text-[#45353E]">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-[#48C062] rounded" />Revenue</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />Profit</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#48C062" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#48C062" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#8C8276", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8C8276", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#48C062" fill="url(#revGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="profit"  name="profit"  stroke="#10B981" fill="url(#profGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Pipeline + Payment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-[#002A30] mb-4">Order Pipeline</h2>
          {statusData.length > 0 ? (
            <div className="space-y-2">
              {statusData.map(([name, value]: any) => {
                const pct = statusTotal > 0 ? Math.round((value / statusTotal) * 100) : 0;
                return (
                  <Link key={name} href={`/admin/orders?status=${name}`}>
                    <div className="flex items-center gap-3 hover:bg-[#FCFAF6] rounded-lg p-2 -mx-2 transition-all cursor-pointer">
                      <span className={`badge ${STATUS_BADGE[name] || "badge-info"} w-24 text-center shrink-0`}>{name}</span>
                      <div className="flex-1 h-2 bg-[#FCFAF6] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[name] || "#45353E" }} />
                      </div>
                      <span className="text-sm font-bold text-[#002A30] w-6 text-right">{value}</span>
                      <span className="text-xs text-[#8C8276] w-8 text-right">{pct}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : <p className="text-[#45353E] text-sm py-4">No orders yet</p>}
        </div>

        <div className="card">
          <h2 className="font-bold text-[#002A30] mb-4">Payment Methods</h2>
          {stats?.paymentSplit?.length > 0 ? (
            <div className="space-y-4">
              {stats.paymentSplit.map((p: any) => (
                <div key={p.method} className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${p.method === "razorpay" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {p.method === "razorpay" ? "R" : "C"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-[#002A30]">{p.method === "razorpay" ? "Razorpay" : "Cash on Delivery"}</span>
                      <span className="text-sm font-bold text-[#48C062]">₹{fmt(p.revenue)}</span>
                    </div>
                    <p className="text-xs text-[#45353E]">{p.count} order{p.count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-[#45353E] text-sm py-4">No payment data yet</p>}
        </div>
      </div>

      {/* Top Products + Top Customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#002A30]">Top Products</h2>
            <Link href="/admin/products" className="text-xs text-[#48C062] hover:underline">View all →</Link>
          </div>
          <div className="space-y-4">
            {topProducts.slice(0, 6).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#D1D5DB] w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#002A30] truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[#FCFAF6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#48C062] rounded-full"
                        style={{ width: `${Math.round((p.totalRevenue / maxRevenue) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-[#8C8276] shrink-0">{p.totalSold} sold</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#48C062]">₹{fmt(p.totalRevenue)}</p>
                  <p className="text-xs text-emerald-500 font-semibold">+₹{fmt(p.totalProfit)} · {p.marginPct}%</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-[#45353E] text-sm">No data yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#002A30]">Top Customers</h2>
            <Link href="/admin/users" className="text-xs text-[#48C062] hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats?.topCustomers?.length > 0 ? stats.topCustomers.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#48C062]/10 flex items-center justify-center text-sm font-bold text-[#48C062] shrink-0">
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#002A30] truncate">{c.name || "—"}</p>
                  <p className="text-xs text-[#45353E] truncate">{c.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#002A30]">₹{fmt(c.totalSpent)}</p>
                  <p className="text-xs text-[#8C8276]">{c.orderCount} order{c.orderCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )) : <p className="text-[#45353E] text-sm py-4">No customer data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#002A30]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#48C062] hover:text-[#48C062]">View all →</Link>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#45353E] border-b border-[#E8E2D9]">
                  {["Order #", "Customer", "Amount", "Payment", "Status", "Date"].map(h => (
                    <th key={h} className="pb-3 font-semibold pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCFAF6]">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-[#FCFAF6] transition-colors">
                    <td className="py-3 pr-4 font-mono text-[#002A30] font-semibold text-xs">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-[#45353E]">{o.user?.name || "—"}</td>
                    <td className="py-3 pr-4 font-bold text-[#002A30]">₹{fmt(Number(o.totalAmount))}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.paymentMethod === "razorpay" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {o.paymentMethod === "razorpay" ? "Online" : "COD"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${STATUS_BADGE[o.status] || "badge-info"}`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-[#45353E] text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-[#45353E] text-sm py-4">No orders yet</p>}
      </div>

    </div>
  );
}
