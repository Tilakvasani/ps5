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

  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  const order = await prisma.order.findFirst({ where: { id: Number(orderId), userId: req.user.id }, include: { address: true } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data:  { paymentStatus: "paid", status: "confirmed", razorpayPaymentId: razorpay_payment_id },
    });

    // Create GST invoice
    const invoiceNumber = await generateInvoiceNumber();
    await tx.invoice.create({
      data: {
        invoiceNumber, orderId: order.id, userId: req.user.id,
        status: "issued",
        subtotal:       order.subtotal,
        discountAmount: order.discountAmount,
        cgstRate: 9, sgstRate: 9, igstRate: 0,
        cgstAmount: order.cgstAmount,
        sgstAmount: order.sgstAmount,
        igstAmount: 0,
        totalAmount: order.totalAmount,
        sellerName:    "Zupwell",
        sellerAddress: "A-102, Adarsh Lifestyle, Ahmedabad, Gujarat 382350",
        sellerGstin:   "24XXXXXXXXXXXXX",
        buyerName:    order.address?.fullName || req.user.name,
        buyerAddress: order.address ? `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : "",
        buyerGstin:   order.address?.gstin || null,
      },
    });
  });

  res.json({ message: "Payment verified and invoice generated" });
});

module.exports = router;
