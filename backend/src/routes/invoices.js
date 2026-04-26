const router = require("express").Router();
const PDFDocument = require("pdfkit");
const prisma = require("../utils/prisma");

// GET /api/invoices/:invoiceNumber/pdf
router.get("/:invoiceNumber/pdf", async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where:   { invoiceNumber: req.params.invoiceNumber },
    include: {
      order: {
        include: {
          items:   { include: { product: { select: { name: true, hsnCode: true, unit: true } } } },
          address: true,
          user:    { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  const W = 515;
  const colors = { pink: "#ec4899", dark: "#111111", gray: "#555555", lightGray: "#f5f5f5" };

  // ── Header ───────────────────────────────────────
  doc.rect(0, 0, 595, 100).fill(colors.dark);
  doc.fillColor(colors.pink).fontSize(28).font("Helvetica-Bold").text("ZUPWELL", 40, 28);
  doc.fillColor("white").fontSize(8).text("B2B / B2C Packaging Materials", 40, 62);
  doc.fillColor("white").fontSize(8).text("GSTIN: 24XXXXXXXXXXXXX  |  State: Gujarat (24)", 40, 74);
  doc.fillColor(colors.pink).fontSize(16).font("Helvetica-Bold").text("TAX INVOICE", 390, 36, { width: 165, align: "right" });
  doc.fillColor("white").fontSize(8).font("Helvetica").text(invoice.invoiceNumber, 390, 58, { width: 165, align: "right" });
  doc.fillColor("white").fontSize(8).text(new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), 390, 70, { width: 165, align: "right" });

  // ── Seller / Buyer ───────────────────────────────
  doc.fillColor(colors.dark).fontSize(8).font("Helvetica-Bold").text("SELLER", 40, 120);
  doc.font("Helvetica").fillColor(colors.gray).text("Zupwell", 40, 134);
  doc.text("A-102, Adarsh Lifestyle, New India Colony Road", 40, 146);
  doc.text("Ahmedabad, Gujarat - 382350", 40, 158);
  doc.text("GSTIN: 24XXXXXXXXXXXXX  |  State Code: 24", 40, 170);

  doc.fillColor(colors.dark).font("Helvetica-Bold").text("BILL TO", 310, 120);
  doc.font("Helvetica").fillColor(colors.gray).text(invoice.buyerName || invoice.order?.user?.name || "—", 310, 134);
  doc.text(invoice.buyerAddress || "—", 310, 146, { width: 240 });
  if (invoice.buyerGstin) doc.text(`GSTIN: ${invoice.buyerGstin}`, 310, 182);

  // Order info
  const infoY = 210;
  doc.fillColor(colors.dark).font("Helvetica-Bold").fontSize(7).text("ORDER NUMBER", 40, infoY);
  doc.font("Helvetica").fillColor(colors.gray).text(invoice.order?.orderNumber || "—", 40, infoY + 11);
  doc.fillColor(colors.dark).font("Helvetica-Bold").text("PAYMENT METHOD", 160, infoY);
  doc.font("Helvetica").fillColor(colors.gray).text((invoice.order?.paymentMethod || "—").toUpperCase(), 160, infoY + 11);
  doc.fillColor(colors.dark).font("Helvetica-Bold").text("PAYMENT STATUS", 280, infoY);
  doc.font("Helvetica").fillColor(colors.gray).text((invoice.order?.paymentStatus || "—").toUpperCase(), 280, infoY + 11);

  // ── Table Header ─────────────────────────────────
  const tableY = 250;
  doc.rect(40, tableY, W, 20).fill(colors.dark);
  const cols = [40, 220, 285, 340, 390, 445, 495];
  const headers = ["ITEM / DESCRIPTION", "HSN", "QTY", "UNIT", "RATE", "CGST 9%", "AMOUNT"];
  headers.forEach((h, i) => {
    doc.fillColor("white").font("Helvetica-Bold").fontSize(7).text(h, cols[i] + 3, tableY + 6, { width: cols[i + 1] ? cols[i + 1] - cols[i] - 6 : 50 });
  });

  // ── Table Rows ───────────────────────────────────
  let rowY = tableY + 22;
  let totalBase = 0;
  (invoice.order?.items || []).forEach((item, i) => {
    const bg = i % 2 === 0 ? "#fafafa" : "white";
    doc.rect(40, rowY, W, 18).fill(bg);
    const baseAmt = Number(item.unitPrice) * item.qty;
    totalBase += baseAmt;

    doc.fillColor(colors.dark).font("Helvetica").fontSize(7)
      .text(item.product?.name || "—", cols[0] + 3, rowY + 5, { width: 175, ellipsis: true })
      .text(item.product?.hsnCode || "—", cols[1] + 3, rowY + 5)
      .text(item.qty.toString(), cols[2] + 3, rowY + 5)
      .text(item.product?.unit || "NOS", cols[3] + 3, rowY + 5)
      .text(`₹${Number(item.unitPrice).toFixed(2)}`, cols[4] + 3, rowY + 5)
      .text(`₹${(baseAmt * 0.09).toFixed(2)}`, cols[5] + 3, rowY + 5)
      .text(`₹${baseAmt.toFixed(2)}`, cols[6] + 3, rowY + 5);
    rowY += 18;
  });

  // ── Totals ───────────────────────────────────────
  rowY += 10;
  const rightX = 380;
  const valX = 500;
  const addRow = (label, value, bold = false) => {
    doc.fillColor(colors.dark).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8)
      .text(label, rightX, rowY, { width: 115, align: "right" })
      .text(value, valX, rowY, { width: 55, align: "right" });
    rowY += 15;
  };

  addRow("Subtotal:", `₹${Number(invoice.subtotal).toFixed(2)}`);
  if (Number(invoice.discountAmount) > 0) addRow("Discount:", `-₹${Number(invoice.discountAmount).toFixed(2)}`);
  addRow(`CGST @${invoice.cgstRate}%:`, `₹${Number(invoice.cgstAmount).toFixed(2)}`);
  addRow(`SGST @${invoice.sgstRate}%:`, `₹${Number(invoice.sgstAmount).toFixed(2)}`);
  if (Number(invoice.order?.shippingCharge) > 0) addRow("Shipping:", `₹${Number(invoice.order.shippingCharge).toFixed(2)}`);
  rowY += 4;
  doc.rect(rightX, rowY, 175, 24).fill(colors.dark);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(10)
    .text("TOTAL:", rightX + 5, rowY + 7, { width: 110, align: "right" })
    .text(`₹${Number(invoice.totalAmount).toFixed(2)}`, valX, rowY + 7, { width: 55, align: "right" });
  rowY += 36;

  // ── Footer ───────────────────────────────────────
  doc.fillColor(colors.gray).font("Helvetica").fontSize(7)
    .text("This is a computer-generated invoice and does not require a signature.", 40, rowY + 10, { align: "center", width: W });
  doc.text("Thank you for your business! — Zupwell, Ahmedabad, Gujarat", 40, rowY + 22, { align: "center", width: W });

  doc.end();
});

module.exports = router;
