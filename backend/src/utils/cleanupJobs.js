const prisma = require("./prisma");

/**
 * Auto-cancel pending Razorpay orders older than 30 minutes.
 *
 * Why this exists:
 *   When a user opens Razorpay and closes it without paying, the frontend
 *   calls DELETE /api/orders/:id/cancel to clean up. But in Razorpay TEST
 *   mode (and occasionally in live mode on poor networks) the ondismiss
 *   callback never fires, so the cancel request is never sent.
 *   This job runs every 10 minutes and cancels any order that is:
 *     - paymentMethod = "razorpay"
 *     - paymentStatus = "pending"  (not yet paid)
 *     - status        = "pending"  (not confirmed / shipped / etc.)
 *     - createdAt     > 30 minutes ago
 */
async function cancelStaleOrders() {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    const stale = await prisma.order.findMany({
      where: {
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        status:        "pending",
        createdAt:     { lt: cutoff },
      },
      select: { id: true, orderNumber: true, createdAt: true },
    });

    if (stale.length === 0) return;

    const ids = stale.map((o) => o.id);

    await prisma.order.updateMany({
      where: { id: { in: ids } },
      data:  { status: "cancelled", paymentStatus: "failed" },
    });

    console.log(
      `🧹 Cleanup: auto-cancelled ${stale.length} stale pending order(s):`,
      stale.map((o) => o.orderNumber).join(", ")
    );
  } catch (err) {
    // Never crash the server — just log
    console.error("⚠️  Cleanup job error:", err.message);
  }
}

/**
 * Start the cleanup job on an interval.
 * Call this once from index.js after the server starts.
 * @param {number} intervalMs - how often to run (default: 10 minutes)
 */
function startCleanupJobs(intervalMs = 10 * 60 * 1000) {
  // Run once immediately on startup to clean any leftovers from last deploy
  cancelStaleOrders();

  // Then run on interval
  setInterval(cancelStaleOrders, intervalMs);

  console.log(
    `🧹 Cleanup job started — stale pending orders cancelled every ${intervalMs / 60000} min`
  );
}

module.exports = { startCleanupJobs, cancelStaleOrders };
