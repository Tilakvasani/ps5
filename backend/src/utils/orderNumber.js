const prisma = require("./prisma");

async function getPrefix() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "order_prefix" } });
    return (setting?.value || "ZW").toUpperCase();
  } catch {
    return "ZW";
  }
}

async function generateOrderNumber() {
  const prefix = await getPrefix();
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  return `${prefix}-${year}-${String(count + 1).padStart(5, "0")}`;
}

async function generateInvoiceNumber() {
  const prefix = await getPrefix();
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  return `${prefix}-INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

module.exports = { generateOrderNumber, generateInvoiceNumber };
