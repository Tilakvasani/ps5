const router = require("express").Router();
const PDFDocument = require("pdfkit");
const prisma = require("../utils/prisma");
const { verifyAccess } = require("../utils/jwt");

// GET /api/invoices/:invoiceNumber/pdf
// Auth: accepts either admin token or user token (user can only view their own invoice)
router.get("/:invoiceNumber/pdf", async (req, res) => {
  // Validate token — accept from Authorization header OR ?token= query param (for direct browser download)
  const header = req.headers.authorization;
  const rawToken = header?.startsWith("Bearer ") ? header.slice(7) : req.query.token;
  if (!rawToken) return res.status(401).json({ error: "Not authenticated" });
  let payload;
  try { payload = verifyAccess(rawToken); } catch { return res.status(401).json({ error: "Invalid token" }); }

  const invoice = await prisma.invoice.findUnique({
    where:   { invoiceNumber: req.params.invoiceNumber },
    include: {
      order: {
        include: {
          items:   { include: { product: { select: { name: true, hsnCode: true, unit: true } }, variant: true } },
          address: true,
          user:    { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  // Users can only download their own invoices; admins can download any
  if (payload.role === "user" && invoice.userId !== payload.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Fetch store settings for dynamic GSTIN etc.
  const settingRows = await prisma.setting.findMany();
  const settings = {};
  settingRows.forEach(r => { settings[r.key] = r.value; });
  const storeGstin     = settings.site_gstin      || "24XXXXXXXXXXXXX";
  const storeStateCode = settings.site_state_code || "24 (Gujarat)";
  const storeName      = settings.site_name        || "Zupwell";
  const storeEmail     = settings.site_email       || "info@zupwell.com";
  const storeAddress   = settings.site_address     || "A-102, Adarsh Lifestyle, New India Colony Road, Ahmedabad, Gujarat - 382350";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);

  const doc = new PDFDocument({ margin: 0, size: "A4" });
  doc.pipe(res);

  // Helper: format currency — PDFKit built-in fonts don't support ₹ unicode, use Rs.
  const rs = (n) => `Rs. ${Number(n).toFixed(2)}`;
  const rsRound = (n) => `Rs. ${Math.round(Number(n)).toLocaleString("en-IN")}`;

  const PW = 595, PH = 842;
  const ML = 45, MR = 45, CW = PW - ML - MR;

  const C = {
    orange:   "#F47C41",
    orangeL:  "#FEF3EC",
    dark:     "#1A1A2E",
    navy:     "#0F3460",
    white:    "#FFFFFF",
    offWhite: "#F8F9FC",
    gray:     "#6B7280",
    grayL:    "#E5E7EB",
    grayXL:   "#F3F4F6",
    text:     "#111827",
    textMid:  "#374151",
    green:    "#059669",
  };

  const date = new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const payStatus = (invoice.order?.paymentStatus || "PENDING").toUpperCase();
  const isPaid = payStatus === "PAID" || payStatus === "SUCCESS";

  // ── Tax: Load dynamically from the linked order ──
  const subtotal      = Number(invoice.subtotal);
  const discountAmt   = Number(invoice.discountAmount || 0);
  const cgstAmt       = Number(invoice.order?.cgstAmount || 0);
  const sgstAmt       = Number(invoice.order?.sgstAmount || 0);
  const taxable       = subtotal - discountAmt;
  // Calculate effective rates to show in table headers
  const cgstRate      = Number(invoice.cgstRate || 2.5);
  const sgstRate      = Number(invoice.sgstRate || 2.5);
  const shippingAmt   = Number(invoice.order?.shippingCharge || 0);
  const rawTotal      = taxable + cgstAmt + sgstAmt + shippingAmt;
  const roundedTotal  = Math.round(rawTotal);
  const roundOffDiff  = +(roundedTotal - rawTotal).toFixed(2);

  // ═══════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════
  doc.rect(0, 0, PW, 125).fill(C.dark);
  doc.rect(0, 0, 5, 125).fill(C.orange);

  // Left: brand
  doc.fillColor(C.orange).font("Helvetica-Bold").fontSize(32).text("ZUPWELL", ML + 8, 26);
  doc.fillColor(C.white).font("Helvetica").fontSize(8.5).text("Performance-Driven Nutrition", ML + 8, 66);
  doc.fillColor(C.grayL).fontSize(7.5).text(`GSTIN: ${storeGstin}   |   State: ${storeStateCode}`, ML + 8, 80);

  // Right: TAX INVOICE box
  const bx = PW - MR - 165;
  doc.rect(bx, 22, 165, 32).fill(C.orange);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(14)
    .text("TAX INVOICE", bx, 30, { width: 165, align: "center" });

  doc.fillColor(C.grayL).font("Helvetica").fontSize(8)
    .text("Invoice No :", bx, 63, { width: 80 })
    .text(invoice.invoiceNumber, bx + 62, 63, { width: 103, align: "right" });
  doc.text("Date :", bx, 76, { width: 80 })
    .text(date, bx + 62, 76, { width: 103, align: "right" });

  // ═══════════════════════════════════════════════════
  // SELLER / BILL TO — side by side
  // ═══════════════════════════════════════════════════
  const cardY = 140, colW = (CW - 14) / 2;

  // Seller
  doc.rect(ML, cardY, colW, 108).fill(C.grayXL);
  doc.rect(ML, cardY, colW, 22).fill(C.navy);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8).text("FROM  (SELLER)", ML + 10, cardY + 7);
  doc.fillColor(C.text).font("Helvetica-Bold").fontSize(9).text("Zupwell", ML + 10, cardY + 30);
  doc.fillColor(C.gray).font("Helvetica").fontSize(8)
    .text("A-102, Adarsh Lifestyle, New India Colony Road", ML + 10, cardY + 44)
    .text("Ahmedabad, Gujarat - 382350", ML + 10, cardY + 56)
    .text(`GSTIN: ${storeGstin}`, ML + 10, cardY + 68)
    .text(`State Code: ${storeStateCode}`, ML + 10, cardY + 80);

  // Buyer
  const buyerX = ML + colW + 14;
  doc.rect(buyerX, cardY, colW, 108).fill(C.grayXL);
  doc.rect(buyerX, cardY, colW, 22).fill(C.orange);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(8).text("TO  (BILL TO)", buyerX + 10, cardY + 7);

  const buyerName  = invoice.buyerName  || invoice.order?.user?.name  || "-";
  const buyerAddr  = invoice.buyerAddress || "-";
  const buyerPhone = invoice.order?.user?.phone || "";
  doc.fillColor(C.text).font("Helvetica-Bold").fontSize(9).text(buyerName, buyerX + 10, cardY + 30);
  doc.fillColor(C.gray).font("Helvetica").fontSize(8)
    .text(buyerAddr, buyerX + 10, cardY + 44, { width: colW - 20 });
  let bY = cardY + 68;
  if (invoice.buyerGstin) { doc.text("GSTIN: " + invoice.buyerGstin, buyerX + 10, bY); bY += 12; }
  if (buyerPhone) doc.text("Phone: " + buyerPhone, buyerX + 10, bY);

  // ═══════════════════════════════════════════════════
  // ORDER META PILLS
  // ═══════════════════════════════════════════════════
  const pillY = cardY + 118, pillW = (CW - 20) / 3;
  const pills = [
    { label: "ORDER NUMBER",   value: invoice.order?.orderNumber || "-" },
    { label: "PAYMENT METHOD", value: (invoice.order?.paymentMethod || "-").toUpperCase() },
    { label: "PAYMENT STATUS", value: payStatus, accent: isPaid ? C.green : C.orange },
  ];
  pills.forEach((p, i) => {
    const px = ML + i * (pillW + 10);
    doc.rect(px, pillY, pillW, 40).fill(C.white);
    doc.rect(px, pillY, pillW, 40).stroke(C.grayL);
    doc.rect(px, pillY, 3, 40).fill(p.accent || C.navy);
    doc.fillColor(C.gray).font("Helvetica").fontSize(7).text(p.label, px + 10, pillY + 7);
    doc.fillColor(p.accent || C.text).font("Helvetica-Bold").fontSize(9.5)
      .text(p.value, px + 10, pillY + 21, { width: pillW - 20 });
  });

  // ═══════════════════════════════════════════════════
  // ITEMS TABLE
  // ═══════════════════════════════════════════════════
  const tableY = pillY + 52;
  // col start x positions
  const c = [ML, ML+168, ML+228, ML+278, ML+328, ML+392, ML+452];
  const hdrs = ["ITEM / DESCRIPTION", "HSN", "QTY", "UNIT", `RATE`, `CGST ${cgstRate}%`, "AMOUNT"];

  doc.rect(ML, tableY, CW, 24).fill(C.dark);
  doc.rect(ML, tableY, 4, 24).fill(C.orange);
  hdrs.forEach((h, i) => {
    const rightAlign = i >= 4;
    const x = rightAlign ? c[i] - 4 : c[i] + 7;
    const w = i < hdrs.length - 1 ? c[i+1] - c[i] - 8 : 55;
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(7)
      .text(h, x, tableY + 8, { width: w, align: rightAlign ? "right" : "left" });
  });

  let rowY = tableY + 24;
  const items = invoice.order?.items || [];
  const discountRatio = subtotal > 0 ? ((subtotal - discountAmt) / subtotal) : 1;

  items.forEach((item, i) => {
    const rh = 26;
    doc.rect(ML, rowY, CW, rh).fill(i % 2 === 0 ? C.white : C.offWhite);
    doc.rect(ML, rowY + rh - 1, CW, 1).fill(C.grayL);

    const baseRaw = Number(item.unitPrice) * item.qty;
    const discountedBase = baseRaw * discountRatio;
    const itemCgst = discountedBase * (cgstRate / 100);

    const displayName = item.variant
      ? `${item.product?.name || "-"} (${item.variant.variantName})`
      : (item.product?.name || "-");

    const cells = [
      displayName,
      item.product?.hsnCode || "-",
      String(item.qty),
      item.product?.unit || "NOS",
      Number(item.unitPrice).toFixed(2),
      itemCgst.toFixed(2),
      discountedBase.toFixed(2),
    ];
    cells.forEach((val, j) => {
      const rightAlign = j >= 4;
      const x = rightAlign ? c[j] - 4 : c[j] + 7;
      const w = j < cells.length - 1 ? c[j+1] - c[j] - 8 : 55;
      doc.fillColor(j === 0 ? C.text : C.textMid)
        .font(j === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8)
        .text(val, x, rowY + 9, { width: w, align: rightAlign ? "right" : "left", ellipsis: true });
    });
    rowY += rh;
  });

  // Orange bottom border of table
  doc.rect(ML, rowY, CW, 2).fill(C.orange);

  // ═══════════════════════════════════════════════════
  // TOTALS BOX (right) + NOTES (left)
  // ═══════════════════════════════════════════════════
  rowY += 18;
  const sumW = 215, sumX = ML + CW - sumW;
  let sumY = rowY;

  const sumRows = [
    { label: "Subtotal",                     value: rs(subtotal) },
    ...(discountAmt > 0 ? [{ label: "Discount", value: "- " + rs(discountAmt), color: C.green }] : []),
    { label: `CGST @ ${cgstRate}%`,           value: rs(cgstAmt) },
    { label: `SGST @ ${sgstRate}%`,           value: rs(sgstAmt) },
    ...(shippingAmt > 0 ? [{ label: "Shipping", value: rs(shippingAmt) }] : []),
    ...(Math.abs(roundOffDiff) >= 0.01 ? [{ label: "Round Off", value: (roundOffDiff > 0 ? "+ " : "- ") + "Rs. " + Math.abs(roundOffDiff).toFixed(2), italic: true }] : []),
  ];

  const sumBoxH = sumRows.length * 22 + 10;
  doc.rect(sumX, sumY, sumW, sumBoxH).fill(C.grayXL);
  doc.rect(sumX, sumY, sumW, 1).fill(C.orange);

  sumRows.forEach((row, i) => {
    const sy = sumY + 7 + i * 22;
    doc.fillColor(C.gray).font("Helvetica").fontSize(8.5)
      .text(row.label, sumX + 10, sy, { width: 100 });
    doc.fillColor(row.color || C.text)
      .font(row.italic ? "Helvetica-Oblique" : "Helvetica-Bold").fontSize(8.5)
      .text(row.value, sumX + 10, sy, { width: sumW - 20, align: "right" });
    if (i < sumRows.length - 1)
      doc.rect(sumX + 10, sy + 18, sumW - 20, 0.5).fill(C.grayL);
  });

  // Grand Total bar
  const gtY = sumY + sumBoxH + 4;
  doc.rect(sumX, gtY, sumW, 38).fill(C.dark);
  doc.rect(sumX, gtY, 4, 38).fill(C.orange);
  doc.fillColor(C.grayL).font("Helvetica").fontSize(8).text("GRAND TOTAL", sumX + 10, gtY + 7);
  doc.fillColor(C.orange).font("Helvetica-Bold").fontSize(20)
    .text(rsRound(roundedTotal), sumX + 10, gtY + 10, { width: sumW - 20, align: "right" });

  // Notes box (left of totals)
  const notesW = sumX - ML - 16;
  const notesH = sumBoxH + 42;
  doc.rect(ML, rowY, notesW, notesH).fill(C.orangeL);
  doc.rect(ML, rowY, 3, notesH).fill(C.orange);
  doc.fillColor(C.orange).font("Helvetica-Bold").fontSize(8).text("NOTES", ML + 12, rowY + 10);
  doc.fillColor(C.textMid).font("Helvetica").fontSize(7.5)
    .text("* Payment is due upon receipt.", ML + 12, rowY + 26)
    .text("* This is a system-generated invoice.", ML + 12, rowY + 40)
    .text(`* For queries: ${storeEmail}`, ML + 12, rowY + 54);

  // ═══════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════
  const footerY = PH - 50;
  doc.rect(0, footerY, PW, 50).fill(C.dark);
  doc.rect(0, footerY, PW, 3).fill(C.orange);
  doc.fillColor(C.orange).font("Helvetica-Bold").fontSize(10).text(storeName.toUpperCase(), ML, footerY + 12);
  doc.fillColor(C.grayL).font("Helvetica").fontSize(7.5).text(storeAddress, ML, footerY + 27);
  doc.fillColor(C.gray).font("Helvetica").fontSize(7)
    .text("Computer-generated invoice. No signature required.", 0, footerY + 14, { width: PW - MR, align: "right" })
    .text("Thank you for your business!", 0, footerY + 27, { width: PW - MR, align: "right" });

  doc.end();
});

module.exports = router;