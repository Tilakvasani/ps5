const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { authUser } = require("../middleware/auth");
const { generateInvoiceNumber } = require("../utils/orderNumber");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-razorpay-order
router.post("/create-razorpay-order", authUser, async (req, res) => {
  const { orderId } = req.body;
  const order = await prisma.order.findFirst({ where: { id: Number(orderId), userId: req.user.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const rzpOrder = await razorpay.orders.create({
    amount:   Math.round(Number(order.totalAmount) * 100), // paise
    currency: "INR",
    receipt:  order.orderNumber,
  });

  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });
  res.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency });
});

// POST /api/payments/verify
router.post("/verify", authUser, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // Verify Razorpay signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const order = await prisma.order.findFirst({
    where: { id: Number(orderId), userId: req.user.id },
    include: { address: true, items: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Prevent double-processing if webhook already confirmed it
  if (order.paymentStatus === "paid") {
    return res.json({ message: "Payment already verified" });
  }

  // Fetch store settings for seller info
  const settingRows = await prisma.setting.findMany();
  const settings = {};
  settingRows.forEach(r => { settings[r.key] = r.value; });

  // Recalculate correct 2.5% GST
  const subtotal    = Number(order.subtotal);
  const discount    = Number(order.discountAmount || 0);
  const cgstAmount  = +((subtotal - discount) * 0.025).toFixed(2);
  const sgstAmount  = +((subtotal - discount) * 0.025).toFixed(2);
  const shipping    = Number(order.shippingCharge || 0);
  const rawTotal    = (subtotal - discount) + cgstAmount + sgstAmount + shipping;
  const totalAmount = Math.round(rawTotal);

  await prisma.$transaction(async (tx) => {
    // Mark order as paid
    await tx.order.update({
      where: { id: order.id },
      data:  { paymentStatus: "paid", status: "confirmed", razorpayPaymentId: razorpay_payment_id, cgstAmount, sgstAmount, totalAmount },
    });

    // FIX: Deduct stock now — only after payment confirmed
    for (const item of order.items) {
      const inv = await tx.inventory.findFirst({ where: { productId: item.productId, variantId: item.variantId } });
      if (inv) {
        if (inv.qtyInStock < item.qty) throw new Error(`Stock insufficient for product ${item.productId}`);
        await tx.inventory.update({ where: { id: inv.id }, data: { qtyInStock: { decrement: item.qty } } });
      }
    }

    // FIX: Increment coupon usage now — only after payment confirmed
    if (order.couponCode) {
      const coupon = await tx.coupon.findFirst({ where: { code: order.couponCode } });
      if (coupon) {
        await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    // Create GST invoice
    const invoiceNumber = await generateInvoiceNumber();
    await tx.invoice.create({
      data: {
        invoiceNumber, orderId: order.id, userId: req.user.id,
        status: "issued",
        subtotal:       order.subtotal,
        discountAmount: order.discountAmount,
        cgstRate: 2.5, sgstRate: 2.5, igstRate: 0,
        cgstAmount, sgstAmount, igstAmount: 0,
        totalAmount,
        sellerName:    settings.site_name    || "Zupwell",
        sellerAddress: settings.site_address || "A-102, Adarsh Lifestyle, Ahmedabad, Gujarat 382350",
        sellerGstin:   settings.site_gstin   || "24XXXXXXXXXXXXX",
        buyerName:    order.address?.fullName || req.user.name,
        buyerAddress: order.address ? `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : "",
        buyerGstin:   order.address?.gstin || null,
      },
    });
  });

  res.json({ message: "Payment verified and invoice generated" });
});

module.exports = router;