const prisma = require("./prisma");

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  return `ZW-${year}-${String(count + 1).padStart(5, "0")}`;
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  return `ZW-INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

module.exports = { generateOrderNumber, generateInvoiceNumber };
