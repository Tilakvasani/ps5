const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { authUser } = require("../middleware/auth");
const { generateInvoiceNumber } = require("../utils/orderNumber");
const baselinker = require("../utils/baselinker");

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

  const keyId = settings.razorpay_key_id || process.env.RAZORPAY_KEY_ID;
  const keySecret = settings.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

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

  const order = await prisma.order.findFirst({
    where: { id: Number(orderId), userId: req.user.id },
    include: { address: true, items: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Prevent double-processing if webhook already confirmed it
  if (order.paymentStatus === "paid") {
    return res.json({ message: "Payment already verified" });
  }

  // Recalculate correct dynamic GST from settings
  const gstPct = parseFloat(settings.gst_rate || "5.0");
  const cgstRateVal = gstPct / 200; // e.g. 0.025 for 5% GST
  const sgstRateVal = gstPct / 200;
  const subtotal    = Number(order.subtotal);
  const discount    = Number(order.discountAmount || 0);
  const cgstAmount  = +((subtotal - discount) * cgstRateVal).toFixed(2);
  const sgstAmount  = +((subtotal - discount) * sgstRateVal).toFixed(2);
  const shipping    = Number(order.shippingCharge || 0);
  const rawTotal    = (subtotal - discount) + cgstAmount + sgstAmount + shipping;
  const totalAmount = Math.round(rawTotal);

  try {
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
          cgstRate: gstPct / 2, sgstRate: gstPct / 2, igstRate: 0,
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
  } catch (err) {
    console.error("Payment transaction error:", err);
    return res.status(400).json({ error: err.message || "Failed to process payment details" });
  }

  res.json({ message: "Payment verified and invoice generated" });

  // ── Push to BaseLinker (eHandler) after successful Razorpay payment ─
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items:   { include: { product: { select: { name: true, sku: true } }, variant: true } },
        address: true,
      },
    });

    const { baselinkerOrderId } = await baselinker.addOrder(fullOrder, req.user);

    await prisma.order.update({
      where: { id: order.id },
      data:  { baselinkerOrderId },
    });

    console.log(`✅ BaseLinker: Razorpay order ${order.orderNumber} pushed — BL ID: ${baselinkerOrderId}`);
  } catch (err) {
    console.error(`⚠️  BaseLinker push failed for order ${order.orderNumber}:`, err.message);
  }
});

module.exports = router;