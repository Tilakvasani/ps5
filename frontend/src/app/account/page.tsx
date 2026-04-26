"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Package, MapPin, LogOut, Download, Plus, Trash2, Edit3 } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { accountApi, ordersApi, invoicesApi, authApi } from "@/lib/api";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", confirmed: "badge-info", processing: "badge-info",
  shipped: "badge-purple", delivered: "badge-success", cancelled: "badge-danger",
};

export default function AccountPage() {
  const { user, setUser, logout } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", addressLine1: "", city: "Ahmedabad", state: "Gujarat", pincode: "", gstin: "", label: "work" });

  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);

  useEffect(() => {
    if (tab === "orders") ordersApi.list().then(setOrders).catch(() => {});
    if (tab === "addresses") accountApi.getAddresses().then(setAddresses).catch(() => {});
  }, [tab]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await accountApi.updateProfile(profile);
      setUser(updated);
      toast.success("Profile updated!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddAddress = async () => {
    try {
      const addr = await accountApi.addAddress(newAddr);
      setAddresses([...addresses, addr]);
      setAddingAddr(false);
      toast.success("Address added!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await accountApi.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success("Address deleted");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout(); router.push("/");
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-black text-white">My Account</h1>
            <p className="text-white/40 text-sm mt-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-4 py-2 rounded-xl transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card space-y-1">
              <div className="flex items-center gap-3 pb-4 mb-2 border-b border-white/10">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center text-lg font-black text-black">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-white/40">Customer</p>
                </div>
              </div>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-pink-500/20 text-pink-400" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {tab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                <h2 className="font-display font-bold text-white mb-6">Profile Information</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-semibold text-white/60 mb-1.5 block">Full Name</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white/60 mb-1.5 block">Email</label>
                    <input value={user?.email || ""} disabled className="input-field opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white/60 mb-1.5 block">Phone</label>
                    <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProfile} className="btn-primary px-6 py-2.5">
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display font-bold text-white mb-4">Order History</h2>
                {orders.length === 0 ? (
                  <div className="card text-center py-12 text-white/30">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="card hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-bold text-white">{order.orderNumber}</span>
                              <span className={`badge ${STATUS_BADGE[order.status] || "badge-info"}`}>{order.status}</span>
                            </div>
                            <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            <p className="text-sm text-white/60 mt-1">{order.items?.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-display font-black gradient-text">₹{Number(order.totalAmount).toFixed(2)}</p>
                            {order.invoice && (
                              <a href={invoicesApi.getPdf(order.invoice.invoiceNumber)} target="_blank" rel="noopener noreferrer">
                                <button className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 mt-1">
                                  <Download size={11} /> Invoice PDF
                                </button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {tab === "addresses" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-white">Saved Addresses</h2>
                  <button onClick={() => setAddingAddr(!addingAddr)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {addingAddr && (
                  <div className="card mb-4 space-y-3">
                    <h3 className="font-semibold text-white text-sm">New Address</h3>
                    {[["fullName","Full Name"],["phone","Phone"],["addressLine1","Address Line 1"],["city","City"],["state","State"],["pincode","Pincode"],["gstin","GSTIN (optional)"]].map(([k, label]) => (
                      <div key={k}>
                        <label className="text-xs text-white/40 mb-1 block">{label}</label>
                        <input value={(newAddr as any)[k]} onChange={e => setNewAddr(n => ({ ...n, [k]: e.target.value }))} className="input-field text-sm" placeholder={label} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={handleAddAddress} className="btn-primary text-sm px-4 py-2">Save</button>
                      <button onClick={() => setAddingAddr(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="card relative group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-info capitalize">{addr.label}</span>
                        {addr.isDefault && <span className="badge badge-success">Default</span>}
                      </div>
                      <p className="font-bold text-white text-sm">{addr.fullName}</p>
                      <p className="text-sm text-white/50 mt-1 leading-relaxed">{addr.addressLine1}<br />{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-white/40 mt-1">{addr.phone}</p>
                      {addr.gstin && <p className="text-xs text-pink-400 mt-1">GSTIN: {addr.gstin}</p>}
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
