const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authUser } = require("../middleware/auth");
const { generateOrderNumber, generateInvoiceNumber } = require("../utils/orderNumber");

// POST /api/orders - create order
router.post("/", authUser, async (req, res) => {
  const { addressId, paymentMethod, couponCode, items } = req.body;
  if (!addressId || !paymentMethod || !items?.length) {
    return res.status(400).json({ error: "Address, payment method, and items required" });
  }

  const address = await prisma.userAddress.findFirst({ where: { id: Number(addressId), userId: req.user.id } });
  if (!address) return res.status(404).json({ error: "Address not found" });

  // Validate and price items
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true, inventory: true },
    });
    if (!product || !product.isActive) return res.status(400).json({ error: `Product ${item.productId} not found` });

    // FIX: check stock before accepting order
    const inv = product.inventory.find(i => i.variantId === (item.variantId || null));
    if (!inv || inv.qtyInStock < item.qty) {
      return res.status(400).json({ error: `Not enough stock for "${product.name}"` });
    }

    const unitPrice = item.variantId
      ? product.variants.find(v => v.id === item.variantId)?.price || product.sellingPrice
      : product.sellingPrice;

    subtotal += Number(unitPrice) * item.qty;
    orderItems.push({ productId: item.productId, variantId: item.variantId || null, qty: item.qty, unitPrice, hsnCode: product.hsnCode });
  }

  // Coupon
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findFirst({ where: { code: couponCode.toUpperCase(), isActive: true } });
    if (coupon) {
      if (subtotal >= Number(coupon.minOrderValue)) {
        discountAmount = coupon.discountType === "percent"
          ? Math.min(subtotal * Number(coupon.discountValue) / 100, coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity)
          : Number(coupon.discountValue);
      }
    }
  }

  // GST (5% = 2.5% CGST + 2.5% SGST for intra-state Gujarat)
  const taxableAmount = subtotal - discountAmount;
  const cgstRate = 2.5, sgstRate = 2.5;
  const cgstAmount = +(taxableAmount * cgstRate / 100).toFixed(2);
  const sgstAmount = +(taxableAmount * sgstRate / 100).toFixed(2);
  const shippingCharge = subtotal > 500 ? 0 : 50;
  const totalAmount = taxableAmount + cgstAmount + sgstAmount + shippingCharge;

  // Fetch store settings for seller info
  const settingRows = await prisma.setting.findMany();
  const cfg = {};
  settingRows.forEach(r => { cfg[r.key] = r.value; });

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber, userId: req.user.id, addressId: address.id,
        paymentMethod, paymentStatus: "pending",
        status: "pending",
        subtotal, discountAmount, cgstAmount, sgstAmount, shippingCharge, totalAmount,
        couponCode: coupon?.code || null,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // FIX: For Razorpay orders, do NOT deduct stock or increment coupon here.
    // Stock and coupon are handled in /api/payments/verify after payment is confirmed.
    if (paymentMethod === "cod") {
      // Deduct stock for COD immediately (payment guaranteed on delivery)
      for (const item of orderItems) {
        const inv = await tx.inventory.findFirst({ where: { productId: item.productId, variantId: item.variantId } });
        if (inv) {
          if (inv.qtyInStock < item.qty) throw new Error(`Stock changed for product ${item.productId}`);
          await tx.inventory.update({ where: { id: inv.id }, data: { qtyInStock: { decrement: item.qty } } });
        }
      }

      // Create invoice for COD orders immediately
      const invoiceNumber = await generateInvoiceNumber();
      await tx.invoice.create({
        data: {
          invoiceNumber, orderId: newOrder.id, userId: req.user.id,
          status: "issued",
          subtotal, discountAmount, cgstRate: 2.5, sgstRate: 2.5, igstRate: 0,
          cgstAmount, sgstAmount, igstAmount: 0,
          totalAmount,
          sellerName:    cfg.site_name    || "Zupwell",
          sellerAddress: cfg.site_address || "A-102, Adarsh Lifestyle, Ahmedabad, Gujarat 382350",
          sellerGstin:   cfg.site_gstin   || "24XXXXXXXXXXXXX",
          buyerName: address.fullName, buyerAddress: `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`,
          buyerGstin: address.gstin || null,
        },
      });

      // Increment coupon usage for COD only — Razorpay coupon is incremented in /verify
      if (coupon) await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    // Notification
    await tx.notification.create({
      data: { type: "new_order", title: "New Order", message: `Order ${orderNumber} placed by ${req.user.name}` },
    }).catch(() => {});

    return newOrder;
  });

  const full = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items:   { include: { product: { select: { name: true } } } },
      address: true,
      invoice: true,
    },
  });

  res.status(201).json(full);
});

// GET /api/orders - user's orders
router.get("/", authUser, async (req, res) => {
  const orders = await prisma.order.findMany({
    where:   { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } }, invoice: true },
  });
  res.json(orders);
});

// DELETE /api/orders/:id/cancel — cancel a pending unpaid order
// Called by the frontend when Razorpay payment is dismissed or fails.
// Only works on orders that are still "pending" + "unpaid" so it cannot
// be abused to cancel already-paid or COD-confirmed orders.
router.delete("/:id/cancel", authUser, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  // Guard: only cancel orders that haven't been paid yet
  if (order.paymentStatus === "paid") {
    return res.status(400).json({ error: "Cannot cancel a paid order" });
  }
  if (order.status === "cancelled") {
    return res.json({ message: "Order already cancelled" }); // idempotent
  }

  await prisma.order.update({
    where: { id: order.id },
    data:  { status: "cancelled", paymentStatus: "failed" },
  });

  res.json({ message: "Order cancelled" });
});

// GET /api/orders/:orderNumber
router.get("/:orderNumber", authUser, async (req, res) => {
  const order = await prisma.order.findFirst({
    where:   { orderNumber: req.params.orderNumber, userId: req.user.id },
    include: {
      items:   { include: { product: { select: { name: true, images: true } } } },
      address: true,
      invoice: true,
    },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

module.exports = router;