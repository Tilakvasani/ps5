"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { ordersApi, invoicesApi } from "@/lib/api";
import Link from "next/link";

export default function OrderPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(params.orderNumber).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [params.orderNumber]);

  if (loading) return (
    <main className="min-h-screen bg-[#FCFAF6] flex items-center justify-center">
      <Navbar />
      <div className="h-8 w-8 rounded-full border-2 border-[#EB9220] border-t-transparent animate-spin mt-20" />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FCFAF6]">
      <Navbar />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-3xl">
        {/* Success Header */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-[#C3E5D9] mb-4">
            <CheckCircle size={40} className="text-[#EB9220]" />
          </div>
          <h1 className="text-4xl font-black text-[#002A30] mb-2">Order Confirmed! 🎉</h1>
          <p className="text-[#45353E]">Order <span className="text-[#EB9220] font-mono font-bold">{params.orderNumber}</span> has been placed successfully.</p>
        </motion.div>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            {/* Order Details */}
            <div className="card">
              <h2 className="font-bold text-[#002A30] mb-4 flex items-center gap-2"><Package size={18} className="text-[#EB9220]" /> Order Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                {[["Order Number", order.orderNumber], ["Status", order.status], ["Payment", order.paymentMethod], ["Date", new Date(order.createdAt).toLocaleDateString("en-IN")]].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[#45353E] mb-0.5">{k}</p>
                    <p className="text-[#002A30] font-semibold capitalize">{v}</p>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="border-t border-[#E8E2D9] pt-4 space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#45353E]">{item.product?.name} × {item.qty}</span>
                    <span className="text-[#002A30] font-semibold">₹{Number(item.unitPrice * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#E8E2D9] pt-4 mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-[#45353E]"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between text-[#45353E]"><span>CGST</span><span>₹{Number(order.cgstAmount).toFixed(2)}</span></div>
                <div className="flex justify-between text-[#45353E]"><span>SGST</span><span>₹{Number(order.sgstAmount).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#002A30] border-t border-[#E8E2D9] pt-2 mt-1">
                  <span>Total Paid</span><span className="gradient-text text-lg">₹{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="card">
                <h2 className="font-bold text-[#002A30] mb-3">Delivery Address</h2>
                <p className="text-sm text-[#45353E] leading-relaxed">
                  {order.address.fullName}<br />
                  {order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                  📞 {order.address.phone}
                  {order.address.gstin && <><br /><span className="text-[#EB9220]">GSTIN: {order.address.gstin}</span></>}
                </p>
              </div>
            )}

            {/* Download Invoice */}
            {order.invoice && (
              <div className="card flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#002A30]">GST Invoice Ready</p>
                  <p className="text-sm text-[#45353E]">{order.invoice.invoiceNumber}</p>
                </div>
                <a href={invoicesApi.getPdf(order.invoice.invoiceNumber)} target="_blank" rel="noopener noreferrer">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                    <Download size={14} /> Download PDF
                  </motion.button>
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/account?tab=orders" className="flex-1">
                <motion.button whileHover={{ scale: 1.02 }} className="w-full btn-outline py-3 text-sm">View All Orders</motion.button>
              </Link>
              <Link href="/products" className="flex-1">
                <motion.button whileHover={{ scale: 1.02 }} className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
                  Continue Shopping <ArrowRight size={14} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}
