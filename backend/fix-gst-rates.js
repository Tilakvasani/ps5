/**
 * One-time fix: update all orders & invoices that have wrong cgstRate=9 / sgstRate=9
 * Run once: node fix-gst-rates.js
 */
const prisma = require("./src/utils/prisma");

async function fix() {
  console.log("Fixing GST rates in database...\n");

  // Fix all orders
  const orders = await prisma.order.findMany();
  let orderFixed = 0;
  for (const o of orders) {
    const subtotal    = Number(o.subtotal);
    const discount    = Number(o.discountAmount || 0);
    const taxable     = subtotal - discount;
    const cgstAmount  = +(taxable * 0.025).toFixed(2);
    const sgstAmount  = +(taxable * 0.025).toFixed(2);
    const shipping    = Number(o.shippingCharge || 0);
    const totalAmount = +(taxable + cgstAmount + sgstAmount + shipping).toFixed(2);

    await prisma.order.update({
      where: { id: o.id },
      data:  { cgstAmount, sgstAmount, totalAmount },
    });
    orderFixed++;
    console.log(`  Order ${o.orderNumber}: cgst=${cgstAmount}, sgst=${sgstAmount}, total=${totalAmount}`);
  }

  // Fix all invoices
  const invoices = await prisma.invoice.findMany();
  let invFixed = 0;
  for (const inv of invoices) {
    const subtotal    = Number(inv.subtotal);
    const discount    = Number(inv.discountAmount || 0);
    const taxable     = subtotal - discount;
    const cgstAmount  = +(taxable * 0.025).toFixed(2);
    const sgstAmount  = +(taxable * 0.025).toFixed(2);
    // shipping comes from the linked order
    const order       = await prisma.order.findUnique({ where: { id: inv.orderId } });
    const shipping    = Number(order?.shippingCharge || 0);
    const rawTotal    = taxable + cgstAmount + sgstAmount + shipping;
    const totalAmount = Math.round(rawTotal);

    await prisma.invoice.update({
      where: { id: inv.id },
      data:  { cgstRate: 2.5, sgstRate: 2.5, cgstAmount, sgstAmount, igstRate: 0, igstAmount: 0, totalAmount },
    });
    invFixed++;
    console.log(`  Invoice ${inv.invoiceNumber}: cgstRate=2.5%, cgst=${cgstAmount}, sgst=${sgstAmount}, total=${totalAmount}`);
  }

  console.log(`\nDone! Fixed ${orderFixed} orders and ${invFixed} invoices.`);
  await prisma.$disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
