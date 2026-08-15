"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Package, MapPin, LogOut, Download, Plus, Trash2, Zap } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { accountApi, ordersApi, invoicesApi } from "@/lib/api";
import { useLogout } from "@/lib/useAuth";
import toast from "react-hot-toast";
import AddressForm from "@/components/storefront/AddressForm";
import { useHydrated } from "@/lib/useHydrated";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", confirmed: "badge-info", processing: "badge-info",
  shipped: "badge-purple", delivered: "badge-success", cancelled: "badge-danger",
};

function AccountPageContent() {
  const { user, setUser, token, srAddresses } = useStore();
  const hydrated = useHydrated();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab]         = useState(searchParams.get("tab") || "profile");
  const [orders, setOrders]   = useState<any[]>([]);
  const [dbAddresses, setDbAddresses] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [addingAddr, setAddingAddr] = useState(false);

  useEffect(() => {
    if (hydrated && !user && !token) router.push("/login?next=/account");
  }, [hydrated, user, token, router]);

  useEffect(() => {
    if (tab === "orders")    ordersApi.list().then(setOrders).catch(() => {});
    if (tab === "addresses") accountApi.getAddresses().then(setDbAddresses).catch(() => {});
  }, [tab]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await accountApi.updateProfile({ name: profile.name, email: profile.email || undefined });
      setUser(updated);
      toast.success("Profile updated!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddAddress = async (data: any) => {
    try {
      const addr = await accountApi.addAddress(data);
      setDbAddresses((prev) => [...prev, addr]);
      setAddingAddr(false);
      toast.success("Address added!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await accountApi.deleteAddress(id);
      setDbAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address deleted");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleLogout = useLogout();

  const TABS = [
    { id: "profile",   label: "Profile",   icon: User    },
    { id: "orders",    label: "Orders",    icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin  },
  ];

  return (
    <main className="min-h-screen" style={{ background: "var(--dk)" }}>
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "#FFFFFF" }}>My Account</h1>
            <p className="text-sm mt-1" style={{ color: "#F8F8F8" }}>{user?.phone ? `+91 ${user.phone}` : user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-4 py-2 rounded-xl transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card space-y-1">
              <div className="flex items-center gap-3 pb-4 mb-2 border-b" style={{ borderColor: "rgba(12, 30, 57, 0.08)" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: "var(--or)", color: "#FFF" }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#0C1E39" }}>{user?.name}</p>
                  <p className="text-xs font-medium" style={{ color: "#4A5568" }}>Customer</p>
                </div>
              </div>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={tab === t.id ? { background: "var(--or)", color: "#FFF" } : { background: "transparent", color: "#0C1E39" }}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* ── Profile Tab ──────────────────────────────────────────────────── */}
            {tab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                <h2 className="font-bold mb-6 text-xl" style={{ color: "#0C1E39" }}>Profile Information</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block" style={{ color: "#0C1E39" }}>Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block" style={{ color: "#0C1E39" }}>Email <span className="text-xs font-normal text-slate-400">(optional)</span></label>
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="input-field"
                      type="email"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block" style={{ color: "#0C1E39" }}>Phone</label>
                    <input
                      value={user?.phone ? `+91 ${user.phone}` : ""}
                      disabled
                      className="input-field opacity-50 cursor-not-allowed"
                      title="Phone number is managed by Shiprocket login"
                    />
                    <p className="text-xs text-slate-400 mt-1">Phone is linked to your Shiprocket login and cannot be changed here.</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProfile} className="btn-primary px-6 py-2.5">
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Orders Tab ───────────────────────────────────────────────────── */}
            {tab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-bold mb-4 text-xl" style={{ color: "#FFFFFF" }}>Order History</h2>
                {orders.length === 0 ? (
                  <div className="card text-center py-12" style={{ color: "#4A5568" }}>
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link key={order.id} href={`/order/${order.orderNumber}`}>
                        <div className="card hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold" style={{ color: "#0C1E39" }}>{order.orderNumber}</span>
                                <span className={`badge ${STATUS_BADGE[order.status] || "badge-info"}`}>{order.status}</span>
                              </div>
                              <p className="text-xs font-medium" style={{ color: "#4A5568" }}>
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              <p className="text-sm mt-1 font-medium" style={{ color: "#4A5568" }}>{order.items?.length} item(s)</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="text-lg font-black gradient-text">₹{Number(order.totalAmount).toFixed(2)}</p>
                              {order.invoice && (
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try { await invoicesApi.downloadPdf(order.invoice.invoiceNumber); }
                                    catch (err: any) { toast.error(err.message || "Download failed"); }
                                  }}
                                  className="flex items-center gap-1 text-xs mt-1 font-semibold"
                                  style={{ color: "var(--or)" }}
                                >
                                  <Download size={11} /> Invoice PDF
                                </button>
                              )}
                              <span className="text-xs mt-1 font-bold" style={{ color: "#0C1E39" }}>View Details →</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Addresses Tab ─────────────────────────────────────────────────── */}
            {tab === "addresses" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl" style={{ color: "#FFFFFF" }}>Saved Addresses</h2>
                  <button onClick={() => setAddingAddr(!addingAddr)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {/* Shiprocket vault addresses */}
                {srAddresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={14} className="text-indigo-400" />
                      <p className="text-sm font-bold text-indigo-300">Shiprocket Saved Addresses</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      {srAddresses.map((addr) => (
                        <div key={addr.id} className="card relative border border-indigo-100/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              <Zap size={9} /> Shiprocket
                            </span>
                            <span className="badge badge-info capitalize">{addr.label || "home"}</span>
                            {addr.isDefault && <span className="badge badge-success">Default</span>}
                          </div>
                          <p className="font-bold text-sm" style={{ color: "#0C1E39" }}>{addr.fullName}</p>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A5568" }}>
                            {addr.addressLine1}
                            {addr.addressLine2 ? <><br /><span className="text-xs text-slate-500">Landmark: {addr.addressLine2}</span></> : null}
                            <br />{addr.city}, {addr.state} – {addr.pincode}
                          </p>
                          <p className="text-sm mt-1 font-medium" style={{ color: "#4A5568" }}>📞 {addr.phone}</p>
                          <p className="text-xs text-slate-400 mt-2">Managed by Shiprocket • autofills at checkout</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add address form */}
                {addingAddr && (
                  <div className="mb-6">
                    <AddressForm
                      onSave={handleAddAddress}
                      onCancel={() => setAddingAddr(false)}
                      submitText="Save New Address"
                    />
                  </div>
                )}

                {/* Local DB addresses */}
                {dbAddresses.length > 0 && (
                  <>
                    {srAddresses.length > 0 && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Manually Added</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dbAddresses.map((addr) => (
                        <div key={addr.id} className="card relative group flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="badge badge-info capitalize">{addr.label || "home"}</span>
                                {addr.isDefault && <span className="badge badge-success">Default</span>}
                              </div>
                              <button
                                onClick={() => { if (confirm("Delete this address?")) handleDeleteAddress(addr.id); }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                            <p className="font-bold text-sm" style={{ color: "#0C1E39" }}>{addr.fullName}</p>
                            <p className="text-sm mt-1 leading-relaxed" style={{ color: "#4A5568" }}>
                              {addr.addressLine1}
                              {addr.addressLine2 ? <><br /><span className="text-xs text-slate-500">Landmark: {addr.addressLine2}</span></> : null}
                              <br />{addr.city}, {addr.state} – {addr.pincode}
                            </p>
                            <p className="text-sm mt-1 font-medium" style={{ color: "#4A5568" }}>📞 {addr.phone}</p>
                            {addr.gstin && <p className="text-xs mt-1 font-mono" style={{ color: "var(--or)" }}>GSTIN: {addr.gstin}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {srAddresses.length === 0 && dbAddresses.length === 0 && !addingAddr && (
                  <div className="card text-center py-10" style={{ color: "#4A5568" }}>
                    <MapPin size={36} className="mx-auto mb-2 opacity-40 text-[var(--or)]" />
                    <p className="font-medium text-sm">No saved addresses yet</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Add New" above to save your delivery location.</p>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk)" }}>
        <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--or)", borderTopColor: "transparent" }} />
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
