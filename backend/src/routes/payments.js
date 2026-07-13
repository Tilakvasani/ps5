const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { authUser } = require("../middleware/auth");
const { generateInvoiceNumber } = require("../utils/orderNumber");
const baselinker = require("../utils/baselinker");
const { calculateGst } = require("../utils/tax");

// POST /api/payments/create-razorpay-order
router.post("/create-razorpay-order", authUser, async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: "Order ID is required" });

  const order = await prisma.order.findFirst({ where: { id: Number(orderId), userId: req.user.id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const amountPaise = Math.round(Number(order.totalAmount) * 100);
  if (amountPaise < 100) {
    return res.status(400).json({ error: "Amount must be at least 100 paise (1 INR)" });
  }

  // Fetch store settings for Razorpay credentials
  const settingRows = await prisma.setting.findMany();
  const settings = {};
  settingRows.forEach(r => { settings[r.key] = r.value; });

  let keyId = settings.razorpay_key_id;
  let keySecret = settings.razorpay_key_secret;

  // If secret is not configured in database settings, use the env variables together to avoid key ID/secret mismatch
  if (!keySecret) {
    keyId = process.env.RAZORPAY_KEY_ID;
    keySecret = process.env.RAZORPAY_KEY_SECRET;
  }

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay credentials are not configured" });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const rzpOrder = await razorpay.orders.create({
      amount:   amountPaise, // paise
      currency: "INR",
      receipt:  order.orderNumber,
    });

    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });
    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: keyId
    });
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ error: "Razorpay API error: " + err.message });
  }
});

const express = require("express");
const { markOrderPaid } = require("../utils/orderPayment");

// POST /api/payments/verify
router.post("/verify", authUser, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ error: "Missing required verification fields" });
  }

  // Fetch store settings for Razorpay credentials
  const settingRows = await prisma.setting.findMany();
  const settings = {};
  settingRows.forEach(r => { settings[r.key] = r.value; });

  const keySecret = settings.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(500).json({ error: "Razorpay client secret is not configured" });
  }

  // Verify Razorpay signature
  const expectedSig = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Prevent double-processing if webhook already confirmed it
  if (order.paymentStatus === "paid") {
    return res.json({ message: "Payment already verified" });
  }

  try {
    await markOrderPaid(order.id, razorpay_payment_id);
  } catch (err) {
    console.error("Payment transaction error:", err);
    return res.status(400).json({ error: err.message || "Failed to process payment details" });
  }

  res.json({ message: "Payment verified and invoice generated" });
});

// POST /api/payments/webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!webhookSecret || !signature) {
    return res.status(400).json({ error: "Webhook secret or signature missing" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    const payload = JSON.parse(req.body.toString());

    if (payload.event === "payment.captured") {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payload.payment.entity.id;

      const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
      if (order && order.paymentStatus !== "paid") {
        await markOrderPaid(order.id, razorpayPaymentId);
        console.log(`✅ Webhook: Order ${order.orderNumber} successfully marked paid`);
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(400).json({ error: "Failed to process webhook" });
  }

  res.json({ status: "ok" });
});

module.exports = router;