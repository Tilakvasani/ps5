/**
 * /api/shiprocket — Webhook receiver & admin manual actions
 *
 * Routes:
 *  POST /api/shiprocket/webhook          ← Shiprocket calls this on status change
 *  POST /api/shiprocket/push/:orderId    ← Admin: manually push order to Shiprocket
 *  POST /api/shiprocket/awb/:orderId     ← Admin: generate AWB for an existing shipment
 *  GET  /api/shiprocket/track/:orderId   ← Admin/User: get live tracking info
 */

const router      = require("express").Router();
const prisma      = require("../utils/prisma");
const { authAdmin } = require("../middleware/auth");
const shiprocket  = require("../utils/shiprocket");

// ── Status map: Shiprocket → your order status ────────────────────────
const STATUS_MAP = {
  "NEW":               "confirmed",
  "PICKUP PENDING":    "confirmed",
  "PICKUP QUEUED":     "confirmed",
  "MANIFEST GENERATED":"confirmed",
  "PICKUP SCHEDULED":  "confirmed",
  "PICKED UP":         "shipped",
  "IN TRANSIT":        "shipped",
  "OUT FOR DELIVERY":  "out_for_delivery",
  "DELIVERED":         "delivered",
  "CANCELLED":         "cancelled",
  "RTO INITIATED":     "rto",
  "RTO DELIVERED":     "rto",
  "LOST":              "lost",
};

// ── POST /api/shiprocket/webhook ──────────────────────────────────────
// Register this URL in Shiprocket: Settings → API → Webhooks
// No auth — Shiprocket doesn't send an auth header by default
router.post("/webhook", async (req, res) => {
  try {
    const { awb, current_status, order_id } = req.body;

    console.log("📦 Shiprocket webhook:", { awb, current_status, order_id });

    if (!awb && !order_id) {
      return res.status(400).json({ error: "Missing awb or order_id" });
    }

    // Find the order in our DB
    const order = awb
      ? await prisma.order.findFirst({ where: { awbCode: awb } })
      : await prisma.order.findFirst({ where: { shiprocketOrderId: String(order_id) } });

    if (!order) {
      // Order not found — could be a test ping; respond 200 so Shiprocket doesn't retry
      return res.json({ message: "Order not found, ignored" });
    }

    // Map Shiprocket status to our status
    const upperStatus = (current_status || "").toUpperCase();
    const newStatus   = STATUS_MAP[upperStatus];

    if (newStatus && newStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: newStatus },
      });

      // Create a notification for the admin
      await prisma.notification.create({
        data: {
          type:    "shipment_update",
          title:   "Shipment Update",
          message: `Order ${order.orderNumber} is now: ${current_status}`,
        },
      }).catch(() => {});

      console.log(`✅ Webhook: Order ${order.orderNumber} → ${newStatus}`);
    }

    res.json({ message: "OK" });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/shiprocket/push/:orderId ───────────────────────────────
// Admin: Manually push an order to Shiprocket (retry if auto-push failed)
router.post("/push/:orderId", authAdmin, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.orderId) },
    include: {
      items:   { include: { product: { select: { name: true, sku: true } } } },
      address: true,
      user:    { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === "pending" && order.paymentMethod !== "cod") {
    return res.status(400).json({ error: "Cannot push an unpaid non-COD order" });
  }

  try {
    const { shiprocketOrderId, shipmentId } = await shiprocket.createOrder(order, order.user);
    const { awbCode, courierName, trackingUrl } = await shiprocket.generateAWB(shipmentId);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data:  { shiprocketOrderId, awbCode, courierName, trackingUrl, status: "confirmed" },
    });

    res.json({ message: "Order pushed to Shiprocket", awbCode, courierName, trackingUrl, order: updated });
  } catch (err) {
    res.status(502).json({ error: `Shiprocket error: ${err.message}` });
  }
});

// ── POST /api/shiprocket/awb/:orderId ────────────────────────────────
// Admin: Generate AWB for an order that was pushed but AWB is missing
router.post("/awb/:orderId", authAdmin, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: Number(req.params.orderId) } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!order.shiprocketOrderId) return res.status(400).json({ error: "Order not yet pushed to Shiprocket" });
  if (order.awbCode) return res.json({ message: "AWB already exists", awbCode: order.awbCode });

  try {
    // We need the shipmentId — fetch from Shiprocket order details
    const { awbCode, courierName, trackingUrl } = await shiprocket.generateAWB(order.shiprocketOrderId);

    await prisma.order.update({
      where: { id: order.id },
      data:  { awbCode, courierName, trackingUrl },
    });

    res.json({ message: "AWB generated", awbCode, courierName, trackingUrl });
  } catch (err) {
    res.status(502).json({ error: `Shiprocket error: ${err.message}` });
  }
});

// ── GET /api/shiprocket/track/:orderNumber ───────────────────────────
// Customer or Admin: Get live tracking info
router.get("/track/:orderNumber", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { orderNumber: req.params.orderNumber },
    select: { awbCode: true, courierName: true, trackingUrl: true, status: true },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!order.awbCode) return res.json({ message: "Shipment not yet assigned", tracking: null });

  try {
    const tracking = await shiprocket.getTracking(order.awbCode);
    res.json({ awbCode: order.awbCode, courierName: order.courierName, trackingUrl: order.trackingUrl, tracking });
  } catch (err) {
    res.status(502).json({ error: `Tracking fetch failed: ${err.message}` });
  }
});

module.exports = router;
