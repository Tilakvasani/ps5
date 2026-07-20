const prisma = require("./prisma");
const { generateInvoiceNumber } = require("./orderNumber");
const baselinker = require("./baselinker");
const { calculateGst } = require("./tax");
const { sendOrderConfirmation } = require("./mailer");

/**
 * markOrderPaid
 * Shared helper to mark an order as paid, deduct stock, increment coupon, create invoice, and push to BaseLinker.
 * @param {number} orderId - The database order ID
 * @param {string} paymentId - The Razorpay payment ID
 */
async function markOrderPaid(orderId, paymentId) {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { address: true, items: true, user: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "paid") return; // Already paid

  // Fetch store settings for GST and invoice details
  const settingRows = await prisma.setting.findMany();
  const settings = {};
  settingRows.forEach(r => { settings[r.key] = r.value; });

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount || 0);
  const shipping = Number(order.shippingCharge || 0);
  const { cgstRate, sgstRate, cgstAmount, sgstAmount, totalAmount: rawTotal } =
    calculateGst(subtotal, discount, settings.gst_rate, shipping);
  const totalAmount = Math.round(rawTotal);

  await prisma.$transaction(async (tx) => {
    // Mark order as paid
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid", status: "confirmed", razorpayPaymentId: paymentId, cgstAmount, sgstAmount, totalAmount },
    });

    // Deduct stock
    for (const item of order.items) {
      const inv = await tx.inventory.findFirst({ where: { productId: item.productId, variantId: item.variantId } });
      if (inv) {
        if (inv.qtyInStock < item.qty) throw new Error(`Stock insufficient for product ${item.productId}`);
        await tx.inventory.update({ where: { id: inv.id }, data: { qtyInStock: { decrement: item.qty } } });
      }
    }

    // Increment coupon usage
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
        invoiceNumber, orderId: order.id, userId: order.userId,
        status: "issued",
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        cgstRate, sgstRate, igstRate: 0,
        cgstAmount, sgstAmount, igstAmount: 0,
        totalAmount,
        sellerName:    settings.site_name    || "Zupwell",
        sellerAddress: settings.site_address || "A-102, Adarsh Lifestyle, Ahmedabad, Gujarat 382350",
        sellerGstin:   settings.site_gstin   || "24XXXXXXXXXXXXX",
        buyerName:     order.address?.fullName || order.user.name,
        buyerAddress:  order.address ? `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : "",
        buyerGstin:    order.address?.gstin || null,
      },
    });
  });

  // Send email confirmation
  sendOrderConfirmation(order, order.user).catch(err => {
    console.error("⚠️ Failed to send order confirmation email:", err.message);
  });

  // Push to BaseLinker
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: { select: { name: true, sku: true } }, variant: true } },
        address: true,
      },
    });

    const { baselinkerOrderId } = await baselinker.addOrder(fullOrder, order.user);

    await prisma.order.update({
      where: { id: order.id },
      data: { baselinkerOrderId },
    });

    console.log(`✅ BaseLinker: order ${order.orderNumber} pushed — BL ID: ${baselinkerOrderId}`);
  } catch (err) {
    console.error(`⚠️ BaseLinker push failed for order ${order.orderNumber}:`, err.message);
  }
}

module.exports = { markOrderPaid };
