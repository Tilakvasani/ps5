const router = require("express").Router();
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// ── Admin Auth ────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  const accessToken = signAccess({ id: admin.id, role: admin.role });
  res.json({ accessToken, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});

// ── Dashboard ─────────────────────────────────────────
router.get("/dashboard/stats", authAdmin, async (req, res) => {
  const [totalRevenue, totalOrders, totalUsers, totalProducts, lowStock, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.count({ where: { qtyInStock: { lte: prisma.inventory.fields.lowStockThreshold } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true, email: true } } } }),
  ]);
  res.json({ totalRevenue: totalRevenue._sum.totalAmount || 0, totalOrders, totalUsers, totalProducts, lowStockCount: lowStock, recentOrders });
});

router.get("/dashboard/revenue-chart", authAdmin, async (req, res) => {
  const days = 30;
  const from = new Date(); from.setDate(from.getDate() - days);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from }, paymentStatus: "paid" },
    select: { createdAt: true, totalAmount: true },
  });
  const map = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    map[d.toISOString().slice(0, 10)] = 0;
  }
  orders.forEach(o => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (map[key] !== undefined) map[key] += Number(o.totalAmount);
  });
  res.json(Object.entries(map).map(([date, revenue]) => ({ date: date.slice(5), revenue })));
});

router.get("/dashboard/top-products", authAdmin, async (req, res) => {
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true, unitPrice: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 8,
  });
  const products = await Promise.all(top.map(async t => {
    const p = await prisma.product.findUnique({ where: { id: t.productId }, select: { id: true, name: true } });
    return { ...p, totalSold: t._sum.qty, totalRevenue: (t._sum.unitPrice || 0) * (t._sum.qty || 0) };
  }));
  res.json(products);
});

// ── Products ──────────────────────────────────────────
router.get("/products", authAdmin, async (req, res) => {
  const { page = 1, perPage = 15, search, id } = req.query;
  if (id) {
    const p = await prisma.product.findUnique({ where: { id: Number(id) }, include: { images: true, variants: true, category: true, inventory: true } });
    return res.json(p || {});
  }
  const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] } : {};
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } }, category: { select: { name: true } }, inventory: true } }),
    prisma.product.count({ where }),
  ]);
  res.json({ products, total });
});

router.post("/products", authAdmin, upload.array("images", 10), async (req, res) => {
  const { name, sku, hsnCode = "3919", brand, unit = "NOS", categoryId, basePrice, sellingPrice, discountPercent = 0, description, shortDescription, metaTitle, metaDescription, isActive = true, isFeatured = false, variants } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const product = await prisma.$transaction(async tx => {
    const p = await tx.product.create({
      data: {
        name, slug, sku, hsnCode, brand, unit,
        categoryId: categoryId ? Number(categoryId) : null,
        basePrice: parseFloat(basePrice), sellingPrice: parseFloat(sellingPrice), discountPercent: parseFloat(discountPercent),
        description, shortDescription, metaTitle, metaDescription,
        isActive: isActive === "true" || isActive === true,
        isFeatured: isFeatured === "true" || isFeatured === true,
      },
    });
    // Images
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        await tx.productImage.create({ data: { productId: p.id, imageUrl: req.files[i].path, altText: name, isPrimary: i === 0, sortOrder: i } });
      }
    }
    // Inventory
    await tx.inventory.create({ data: { productId: p.id, qtyInStock: 0 } });
    // Variants
    if (variants) {
      const vs = JSON.parse(variants);
      for (const v of vs) {
        await tx.productVariant.create({ data: { productId: p.id, variantName: v.variantName, sku: v.sku, price: parseFloat(v.price) } });
      }
    }
    return p;
  });
  res.status(201).json(product);
});

router.put("/products/:id", authAdmin, upload.array("images", 10), async (req, res) => {
  const id = Number(req.params.id);
  const { name, isActive, ...rest } = req.body;
  const data = { ...rest, isActive: isActive === "true" || isActive === true };
  if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
  if (rest.basePrice) data.basePrice = parseFloat(rest.basePrice);
  if (rest.sellingPrice) data.sellingPrice = parseFloat(rest.sellingPrice);
  if (rest.discountPercent) data.discountPercent = parseFloat(rest.discountPercent);
  if (rest.categoryId) data.categoryId = Number(rest.categoryId);

  const product = await prisma.product.update({ where: { id }, data });
  if (req.files?.length) {
    for (let i = 0; i < req.files.length; i++) {
      await prisma.productImage.create({ data: { productId: id, imageUrl: req.files[i].path, altText: name || product.name, isPrimary: false, sortOrder: 99 + i } });
    }
  }
  res.json(product);
});

router.delete("/products/:id", authAdmin, async (req, res) => {
  await prisma.product.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.json({ message: "Product deactivated" });
});

// ── Categories ────────────────────────────────────────
router.get("/categories", authAdmin, async (req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } }, children: true } });
  res.json(cats);
});
router.post("/categories", authAdmin, async (req, res) => {
  const { name, description, parentId, isActive = true } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const cat = await prisma.category.create({ data: { name, slug, description, parentId: parentId ? Number(parentId) : null, isActive } });
  res.status(201).json(cat);
});
router.put("/categories/:id", authAdmin, async (req, res) => {
  const { name, ...rest } = req.body;
  const data = { ...rest };
  if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
  if (rest.parentId) data.parentId = Number(rest.parentId);
  const cat = await prisma.category.update({ where: { id: Number(req.params.id) }, data });
  res.json(cat);
});
router.delete("/categories/:id", authAdmin, async (req, res) => {
  await prisma.category.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.json({ message: "Category deactivated" });
});

// ── Inventory ─────────────────────────────────────────
router.get("/inventory", authAdmin, async (req, res) => {
  const inv = await prisma.inventory.findMany({ include: { product: { select: { id: true, name: true, sku: true } }, variant: true }, orderBy: { qtyInStock: "asc" } });
  res.json(inv);
});
router.post("/inventory/movement", authAdmin, async (req, res) => {
  const { productId, variantId, movementType, qty, notes } = req.body;
  const inv = await prisma.inventory.findFirst({ where: { productId: Number(productId), variantId: variantId ? Number(variantId) : null } });
  if (!inv) return res.status(404).json({ error: "Inventory record not found" });
  const qtyBefore = inv.qtyInStock;
  const delta = movementType === "out" ? -Number(qty) : Number(qty);
  const qtyAfter = qtyBefore + delta;
  if (qtyAfter < 0) return res.status(400).json({ error: "Insufficient stock" });
  await prisma.$transaction([
    prisma.inventory.update({ where: { id: inv.id }, data: { qtyInStock: qtyAfter } }),
    prisma.stockMovement.create({ data: { productId: Number(productId), variantId: variantId ? Number(variantId) : null, movementType, qty: Number(qty), qtyBefore, qtyAfter, notes, createdBy: req.admin.id } }),
  ]);
  // Low stock notification
  if (qtyAfter <= inv.lowStockThreshold) {
    const p = await prisma.product.findUnique({ where: { id: Number(productId) }, select: { name: true } });
    await prisma.notification.create({ data: { type: "low_stock", title: "Low Stock Alert", message: `${p?.name} is low on stock (${qtyAfter} remaining)` } }).catch(() => {});
  }
  res.json({ message: "Stock updated", qtyBefore, qtyAfter });
});
router.get("/inventory/movements", authAdmin, async (req, res) => {
  const movements = await prisma.stockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { product: { select: { name: true } }, admin: { select: { name: true } } } });
  res.json(movements);
});

// ── Orders ────────────────────────────────────────────
router.get("/orders", authAdmin, async (req, res) => {
  const { page = 1, perPage = 20, search, status } = req.query;
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ orderNumber: { contains: search } }, { user: { name: { contains: search, mode: "insensitive" } } }] } : {}),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } }, invoice: { select: { invoiceNumber: true } }, _count: { select: { items: true } } } }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total });
});
router.get("/orders/:id", authAdmin, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) }, include: { user: true, address: true, items: { include: { product: true } }, invoice: true } });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});
router.put("/orders/:id/status", authAdmin, async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
  res.json(order);
});

// ── Invoices ──────────────────────────────────────────
router.get("/invoices", authAdmin, async (req, res) => {
  const { search } = req.query;
  const where = search ? { OR: [{ invoiceNumber: { contains: search } }, { order: { user: { name: { contains: search, mode: "insensitive" } } } }] } : {};
  const invoices = await prisma.invoice.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { include: { user: { select: { name: true } } } } } });
  res.json(invoices);
});
router.put("/invoices/:id/cancel", authAdmin, async (req, res) => {
  const inv = await prisma.invoice.update({ where: { id: Number(req.params.id) }, data: { status: "cancelled" } });
  res.json(inv);
});

// ── Users ─────────────────────────────────────────────
router.get("/users", authAdmin, async (req, res) => {
  const { page = 1, perPage = 20, search } = req.query;
  const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, isVerified: true, isActive: true, createdAt: true, _count: { select: { orders: true } } } }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total });
});
router.get("/users/:id", authAdmin, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { orders: { orderBy: { createdAt: "desc" }, take: 10 }, addresses: true } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// ── Coupons ───────────────────────────────────────────
router.get("/coupons", authAdmin, async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json(coupons);
});
router.post("/coupons", authAdmin, async (req, res) => {
  const coupon = await prisma.coupon.create({ data: { ...req.body, code: req.body.code.toUpperCase(), discountValue: parseFloat(req.body.discountValue), minOrderValue: parseFloat(req.body.minOrderValue || 0), maxDiscount: req.body.maxDiscount ? parseFloat(req.body.maxDiscount) : null, usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit) : null } });
  res.status(201).json(coupon);
});
router.put("/coupons/:id", authAdmin, async (req, res) => {
  const coupon = await prisma.coupon.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(coupon);
});
router.delete("/coupons/:id", authAdmin, async (req, res) => {
  await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Deleted" });
});

// ── Reviews ───────────────────────────────────────────
router.get("/reviews", authAdmin, async (req, res) => {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true } } } });
  res.json(reviews);
});
router.put("/reviews/:id/approve", authAdmin, async (req, res) => {
  const r = await prisma.review.update({ where: { id: Number(req.params.id) }, data: { isApproved: true } });
  res.json(r);
});
router.delete("/reviews/:id", authAdmin, async (req, res) => {
  await prisma.review.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Deleted" });
});

// ── Settings ──────────────────────────────────────────
router.get("/settings", authAdmin, async (req, res) => {
  const settings = await prisma.setting.findMany();
  res.json(settings);
});
router.put("/settings", authAdmin, async (req, res) => {
  const updates = Object.entries(req.body);
  await Promise.all(updates.map(([key, value]) =>
    prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), group: "general" } })
  ));
  res.json({ message: "Settings updated" });
});

// ── Notifications ─────────────────────────────────────
router.get("/notifications", authAdmin, async (req, res) => {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  res.json(notifications);
});
router.put("/notifications/:id/read", authAdmin, async (req, res) => {
  const n = await prisma.notification.update({ where: { id: Number(req.params.id) }, data: { isRead: true } });
  res.json(n);
});
router.put("/notifications/read-all", authAdmin, async (req, res) => {
  await prisma.notification.updateMany({ data: { isRead: true } });
  res.json({ message: "All marked read" });
});

// ── GST Rates ─────────────────────────────────────────
router.get("/gst-rates", authAdmin, async (req, res) => {
  const rates = await prisma.gstRate.findMany();
  res.json(rates);
});

module.exports = router;
