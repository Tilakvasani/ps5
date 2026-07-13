"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { Search, Package, MapPin, Truck, CheckCircle, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { API_URL } from "@/lib/api";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const trackOrder = async (code: string, phoneNumber: string) => {
    if (!code.trim() || !phoneNumber.trim()) {
      toast.error("Please enter both order number and phone number");
      return;
    }
    setLoading(true);
    setOrder(null);
    setSearched(false);
    try {
      const trimmedNum = code.trim().toUpperCase();
      const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }
      
      const res = await fetch(`${API_URL}/api/orders/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber: trimmedNum, phone: cleanPhone }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Order not found. Check your order number and phone.");
      }
      const data = await res.json();
      setOrder(data);
      setSearched(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("order") || params.get("code") || "";
      if (code) {
        setOrderNumber(code);
      }
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await trackOrder(orderNumber, phone);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard! 🔗");
    }
  };

  const getStatusStep = (status: string) => {
    // Map order status to stepper index (0-3)
    switch (status?.toLowerCase()) {
      case "pending":
        return 0;
      case "confirmed":
      case "processing":
        return 1;
      case "shipped":
      case "dispatched":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: "Order Placed", desc: "Waiting for confirmation", icon: Package },
    { title: "Processing", desc: "Preparing your supplement", icon: MapPin },
    { title: "Shipped", desc: "Out for delivery", icon: Truck },
    { title: "Delivered", desc: "Successfully completed", icon: CheckCircle },
  ];

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <main className="min-h-screen flex flex-col justify-between" style={{ background: "var(--gy)" }}>
      <div>
        <Navbar />

        <div className="pt-32 pb-20 px-6 mx-auto max-w-4xl relative">
          {/* Top-Right Share Button */}
          <div className="absolute top-32 right-6">
            <button 
              onClick={handleShare} 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold hover:opacity-85 transition-opacity shrink-0 bg-white" 
              style={{ borderColor: "#E2E8F0", color: "#0C1E39", boxShadow: "0 2px 8px rgba(12, 30, 57, 0.04)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
          </div>

          <div className="text-center mb-10">
            <span className="inline-block zbadge mb-4" style={{ background: "#0C1E39", color: "#FFFFFF", fontSize: "12px", letterSpacing: "1.2px" }}>
              SHIPMENT STATUS
            </span>
            <div className="mb-3">
              <h1 className="text-4xl md:text-5xl font-black text-[#0C1E39]" style={{ letterSpacing: "-0.04em" }}>
                Track Your <span style={{ color: "var(--or)" }}>Order</span>
              </h1>
            </div>
            <p className="text-sm max-w-md mx-auto text-[#4A5568] font-medium">
              Enter your Zupwell Order Number and registered phone number below to view delivery updates.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="max-w-md mx-auto mb-12 space-y-4">
            <div className="bg-white border-2 border-[#0C1E39]/12 rounded-2xl p-4 shadow-sm space-y-3 focus-within:border-[#0C1E39]/30 transition-all">
              <div>
                <label className="block mb-1.5 text-xs font-black tracking-widest text-[#0C1E39] uppercase opacity-75">Order Number</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ZW-2026-00001"
                  className="w-full px-3 py-2.5 text-sm border border-[#0C1E39]/10 rounded-xl focus:outline-none focus:border-[#0C1E39] text-[#0C1E39] font-bold bg-[#F8FAFC]"
                />
              </div>
              
              <div>
                <label className="block mb-1.5 text-xs font-black tracking-widest text-[#0C1E39] uppercase opacity-75">Phone Number</label>
                <div className="flex items-center border border-[#0C1E39]/10 rounded-xl bg-[#F8FAFC] focus-within:border-[#0C1E39] focus-within:bg-white transition-all overflow-hidden">
                  <span className="text-xs font-bold text-gray-500 pl-3 pr-2 shrink-0 select-none">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full px-1 py-2.5 text-sm focus:outline-none text-[#0C1E39] font-bold bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center font-bold text-sm shadow-md gap-2"
                style={{ cursor: "pointer" }}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Track Shipment
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tracking Results */}
          <AnimatePresence mode="wait">
            {searched && order && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="zcard p-8 bg-white border border-[#0C1E39]/8 rounded-3xl"
                style={{ boxShadow: "0 10px 30px rgba(12, 30, 57, 0.02)" }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#0C1E39]/8 pb-6 mb-8 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B7280]">Order Code</span>
                    <h2 className="text-xl font-black text-[#0C1E39]">{order.orderNumber}</h2>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B7280] block text-left md:text-right">Ordered On</span>
                    <p className="text-sm font-bold text-[#0C1E39]">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#6B7280] block text-left md:text-right">Payment Status</span>
                    <span className={`inline-block text-xs font-black uppercase px-2.5 py-1 rounded-lg mt-1 ${
                      order.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-600" :
                      order.paymentStatus === "failed" ? "bg-rose-500/10 text-rose-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {order.status === "cancelled" ? (
                  <div className="text-center py-6">
                    <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 mb-4 font-black">✕</span>
                    <h3 className="text-lg font-bold text-rose-600 mb-1">This order has been cancelled</h3>
                    <p className="text-xs text-[#6B7280]">Please contact our customer support team for further queries.</p>
                  </div>
                ) : (
                  <div>
                    {/* Stepper progress bar */}
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 mt-4">
                      {/* Horizontal line connector */}
                      <div className="hidden md:block absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[3px] bg-gray-200 -z-10">
                        <div
                          className="h-full bg-[var(--or)] transition-all duration-500"
                          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                      </div>

                      {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx <= currentStep;
                        const isActive = idx === currentStep;

                        return (
                          <div key={idx} className="flex md:flex-col items-center md:text-center w-full gap-4 md:gap-0 relative">
                            {/* Circle dot icon */}
                            <div
                              className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all shrink-0 md:mb-3 ${
                                isCompleted
                                  ? "bg-[var(--or)] border-[var(--or)] text-white shadow-lg shadow-orange-500/20"
                                  : "bg-white border-gray-200 text-gray-400"
                              }`}
                            >
                              <StepIcon size={18} className={isActive ? "animate-pulse" : ""} />
                            </div>

                            {/* Text labels */}
                            <div>
                              <h4 className={`text-sm font-extrabold ${isCompleted ? "text-[#0C1E39]" : "text-gray-400"}`}>
                                {step.title}
                              </h4>
                              <p className="text-xs text-[#6B7280] mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </main>
  );
}
