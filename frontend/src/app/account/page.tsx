"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Package, MapPin, LogOut, Download, Plus, Trash2, Edit3, ShieldAlert } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { useStore } from "@/lib/store";
import { accountApi, ordersApi, invoicesApi } from "@/lib/api";
import { useLogout } from "@/lib/useAuth";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", confirmed: "badge-info", processing: "badge-info",
  shipped: "badge-purple", delivered: "badge-success", cancelled: "badge-danger",
};

function AccountPageContent() {
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
    if (!profile.name || !profile.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const updated = await accountApi.updateProfile(profile);
      setUser(updated);
      toast.success("Profile updated!");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddAddress = async () => {
    if (!newAddr.fullName || !newAddr.phone || !newAddr.addressLine1 || !newAddr.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }
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

  const handleLogout = useLogout();

  const TABS = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
  ];

  return (
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-6xl">
        
        {/* Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#E8E2D9]/40 pb-5">
          <div>
            <span className="font-sans text-[10px] font-bold text-[#8C8276] uppercase tracking-[0.15em] mb-1.5 block">Customer Portal</span>
            <h1 className="font-display text-3xl font-black text-[#002A30] tracking-tight">My Account</h1>
            <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider border border-red-200 hover:border-red-400 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all self-start sm:self-center">
            <LogOut size={13} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tab Selection */}
          <aside className="lg:col-span-3">
            <div className="card bg-white border border-[#E8E2D9] shadow-soft p-5 space-y-1">
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-[#E8E2D9]/40">
                <div className="h-10 w-10 rounded-xl bg-[#FCFAF6] border border-[#E8E2D9] flex items-center justify-center font-display font-black text-[#002A30] text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-bold text-xs uppercase tracking-wider text-[#002A30] leading-tight">{user?.name}</p>
                  <p className="text-[10px] font-sans font-bold text-[#8C8276] uppercase tracking-wider mt-0.5">Zupwell Member</p>
                </div>
              </div>
              
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    tab === t.id 
                      ? "border-[#48C062] bg-[#48C062]/5 text-[#48C062]" 
                      : "border-transparent text-[#45353E] hover:text-[#002A30] hover:bg-[#FCFAF6]"
                  }`}>
                  <t.icon size={14} className="shrink-0" /> {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Display Tab Panels */}
          <div className="lg:col-span-9">
            
            {/* Profile Info Form Tab */}
            {tab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card bg-white border border-[#E8E2D9] shadow-soft">
                <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider border-b border-[#E8E2D9]/40 pb-3 mb-6">Profile Details</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Full Name</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field text-xs font-semibold rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Registered Email Address</label>
                    <input value={user?.email || ""} disabled className="input-field text-xs font-semibold rounded-xl opacity-50 cursor-not-allowed bg-[#FCFAF6]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">Contact Number</label>
                    <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field text-xs font-semibold rounded-xl" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProfile} className="btn-primary w-full py-3 text-xs font-sans font-bold uppercase tracking-wider">
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider border-b border-[#E8E2D9]/40 pb-3 mb-4">My Orders</h2>
                
                {orders.length === 0 ? (
                  <div className="card text-center py-16 bg-white border border-[#E8E2D9] shadow-soft">
                    <Package size={36} className="mx-auto mb-4 text-[#8C8276] opacity-35" />
                    <p className="font-display font-bold text-sm text-[#002A30] uppercase tracking-wider mb-1">No orders found</p>
                    <p className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider">You haven't placed any orders with us yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Link key={order.id} href={`/order/${order.orderNumber}`}>
                        <div className="card bg-white border border-[#E8E2D9] hover:border-[#48C062]/20 hover:shadow-premium transition-all cursor-pointer">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1.5 text-xs font-semibold text-[#8C8276] uppercase tracking-wider">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-bold text-[#002A30]">#{order.orderNumber}</span>
                                <span className={`badge ${STATUS_BADGE[order.status] || "badge-info"} text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg`}>{order.status}</span>
                              </div>
                              <p className="text-[10px]">Ordered: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              <p className="text-[#002A30] font-bold mt-1">Items Count: {order.items?.length}</p>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-1 text-xs font-semibold text-[#8C8276] uppercase tracking-wider">
                              <p className="font-display text-lg font-black text-[#48C062]">₹{Number(order.totalAmount).toFixed(0)}</p>
                              
                              {order.invoice && (
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      await invoicesApi.downloadPdf(order.invoice.invoiceNumber);
                                    } catch (err: any) {
                                      toast.error(err.message || "Download failed");
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-[9px] text-[#48C062] font-bold hover:underline mt-1 bg-[#E8F5E9] px-2 py-1 rounded-lg border border-[#C8E6C9]"
                                >
                                  <Download size={11} /> Invoice PDF
                                </button>
                              )}
                              <span className="text-[9px] font-bold text-[#48C062] uppercase tracking-widest mt-1">View Details ➔</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Saved Addresses Tab */}
            {tab === "addresses" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E8E2D9]/40 pb-3">
                  <h2 className="font-display font-bold text-base text-[#002A30] uppercase tracking-wider">Saved Addresses</h2>
                  <button onClick={() => setAddingAddr(!addingAddr)} className="btn-primary text-xs font-bold uppercase tracking-wider py-2 px-4 flex items-center gap-1.5">
                    <Plus size={13} strokeWidth={2.5} /> Add Address
                  </button>
                </div>

                {addingAddr && (
                  <div className="card bg-white border border-[#E8E2D9] shadow-soft space-y-4">
                    <h3 className="font-display font-bold text-sm text-[#002A30] uppercase tracking-wider">New Delivery Address</h3>
                    {[
                      ["fullName","Full Name"],
                      ["phone","Phone Number"],
                      ["addressLine1","Address Line 1"],
                      ["city","City"],
                      ["state","State"],
                      ["pincode","Pincode"],
                      ["gstin","GSTIN (optional)"]
                    ].map(([k, label]) => (
                      <div key={k}>
                        <label className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1 block">{label}</label>
                        <input value={(newAddr as any)[k]} onChange={e => setNewAddr(n => ({ ...n, [k]: e.target.value }))} className="input-field text-xs font-semibold rounded-xl" placeholder={label} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={handleAddAddress} className="btn-primary text-xs font-bold uppercase tracking-wider py-2.5 px-6">Save</button>
                      <button onClick={() => setAddingAddr(false)} className="btn-outline text-xs font-bold uppercase tracking-wider py-2.5 px-6">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="card bg-white border border-[#E8E2D9] shadow-soft relative group hover:border-[#48C062]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge badge-silver text-[9px] font-bold uppercase tracking-wider capitalize">{addr.label}</span>
                        {addr.isDefault && <span className="badge badge-green-tint text-[9px] font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">Default</span>}
                      </div>
                      <p className="font-display font-bold text-sm text-[#002A30] capitalize">{addr.fullName}</p>
                      <p className="text-xs font-semibold text-[#45353E] uppercase tracking-wider mt-1 leading-relaxed">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">Phone: {addr.phone}</p>
                      {addr.gstin && <p className="text-[10px] font-bold text-[#48C062] uppercase tracking-wider mt-1">GSTIN: {addr.gstin}</p>}
                      
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl text-red-400 border border-transparent hover:border-red-100 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
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

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-[#48C062] border-t-transparent animate-spin" /></div>}>
      <AccountPageContent />
    </Suspense>
  );
}
