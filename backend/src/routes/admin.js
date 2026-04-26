const router = require("express").Router();
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const VALID_ORDER_STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled"];

// ── Admin Auth ────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    const accessToken = signAccess({ id: admin.id, role: admin.role });
    res.json({ accessToken, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// ── Dashboard ─────────────────────────────────────────
router.get("/dashboard/stats", authAdmin, async (req, res) => {
  try {
    const [totalRevenue, totalOrders, totalUsers, totalProducts, recentOrders] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "paid" }, _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true, email: true } } } }),
    ]);
    // Raw SQL needed for field-to-field comparison — use actual DB table/column names
    const lowStockItems = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "inventory" WHERE "qty_in_stock" <= "low_stock_threshold"`;
    const lowStock = Number(lowStockItems[0]?.count ?? 0);
    res.json({ totalRevenue: totalRevenue._sum.totalAmount || 0, totalOrders, totalUsers, totalProducts, lowStockCount: lowStock, recentOrders });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load dashboard stats" });
  }
});

router.get("/dashboard/revenue-chart", authAdmin, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load revenue chart" });
  }
});

router.get("/dashboard/top-products", authAdmin, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load top products" });
  }
});

// ── Products ──────────────────────────────────────────
// BUG FIX: Show ALL products (including inactive/deactivated) in admin so admin can see & restore them
router.get("/products", authAdmin, async (req, res) => {
  try {
    const { page = 1, perPage = 15, search, id } = req.query;
    if (id) {
      const p = await prisma.product.findUnique({ where: { id: Number(id) }, include: { images: true, variants: true, category: true, inventory: true } });
      return res.json(p || {});
    }
    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] }
      : {};
    // No isActive filter — admin sees everything including soft-deleted products
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } }, category: { select: { name: true } }, inventory: true } }),
      prisma.product.count({ where }),
    ]);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

router.post("/products", authAdmin, upload.array("images", 10), async (req, res) => {
  try {
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
      if (req.files?.length) {
        for (let i = 0; i < req.files.length; i++) {
          await tx.productImage.create({ data: { productId: p.id, imageUrl: req.files[i].path, altText: name, isPrimary: i === 0, sortOrder: i } });
        }
      }
      await tx.inventory.create({ data: { productId: p.id, qtyInStock: 0 } });
      if (variants) {
        const vs = JSON.parse(variants);
        for (const v of vs) {
          await tx.productVariant.create({ data: { productId: p.id, variantName: v.variantName, sku: v.sku, price: parseFloat(v.price) } });
        }
      }
      return p;
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// BUG FIX: Added try/catch so errors return proper response instead of crashing server
router.put("/products/:id", authAdmin, upload.array("images", 10), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive, isFeatured, basePrice, sellingPrice, discountPercent, categoryId, ...rest } = req.body;
    const data = { ...rest };
    if (name)             { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
    if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;
    if (isFeatured !== undefined) data.isFeatured = isFeatured === "true" || isFeatured === true;
    if (basePrice)        data.basePrice = parseFloat(basePrice);
    if (sellingPrice)     data.sellingPrice = parseFloat(sellingPrice);
    if (discountPercent !== undefined) data.discountPercent = parseFloat(discountPercent);
    if (categoryId)       data.categoryId = Number(categoryId);

    const product = await prisma.product.update({ where: { id }, data });
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        await prisma.productImage.create({ data: { productId: id, imageUrl: req.files[i].path, altText: name || product.name, isPrimary: false, sortOrder: 99 + i } });
      }
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

// SOFT DELETE — sets isActive: false, does NOT remove from database
// This preserves order history, invoices and all related data
router.delete("/products/:id", authAdmin, async (req, res) => {
  try {
    await prisma.product.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to deactivate product" });
  }
});

// ── Categories ────────────────────────────────────────
// BUG FIX: Show ALL categories in admin (including inactive) so admin can see & restore
router.get("/categories", authAdmin, async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } }, children: true } });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch categories" });
  }
});

router.post("/categories", authAdmin, async (req, res) => {
  try {
    const { name, description, parentId, isActive = true } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await prisma.category.create({ data: { name, slug, description, parentId: parentId ? Number(parentId) : null, isActive } });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create category" });
  }
});

router.put("/categories/:id", authAdmin, async (req, res) => {
  try {
    const { name, ...rest } = req.body;
    const data = { ...rest };
    if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
    if (rest.parentId) data.parentId = Number(rest.parentId);
    const cat = await prisma.category.update({ where: { id: Number(req.params.id) }, data });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update category" });
  }
});

// SOFT DELETE — sets isActive: false, does NOT remove from database
router.delete("/categories/:id", authAdmin, async (req, res) => {
  try {
    await prisma.category.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Category deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to deactivate category" });
  }
});

// ── Inventory ─────────────────────────────────────────
router.get("/inventory", authAdmin, async (req, res) => {
  try {
    const inv = await prisma.inventory.findMany({ include: { product: { select: { id: true, name: true, sku: true, isActive: true } }, variant: true }, orderBy: { qtyInStock: "asc" } });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch inventory" });
  }
});

// BUG FIX: Added try/catch — previously crashed server on error
router.post("/inventory/movement", authAdmin, async (req, res) => {
  try {
    const { productId, variantId, movementType, qty, notes } = req.body;
    if (!productId || !movementType || !qty) return res.status(400).json({ error: "productId, movementType and qty are required" });
    if (!["in", "out", "adjustment"].includes(movementType)) return res.status(400).json({ error: "Invalid movementType" });

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
    if (qtyAfter <= inv.lowStockThreshold) {
      const p = await prisma.product.findUnique({ where: { id: Number(productId) }, select: { name: true } });
      await prisma.notification.create({ data: { type: "low_stock", title: "Low Stock Alert", message: `${p?.name} is low on stock (${qtyAfter} remaining)` } }).catch(() => {});
    }
    res.json({ message: "Stock updated", qtyBefore, qtyAfter });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update stock" });
  }
});

router.get("/inventory/movements", authAdmin, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { product: { select: { name: true } }, admin: { select: { name: true } } } });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch movements" });
  }
});

// ── Orders ────────────────────────────────────────────
router.get("/orders", authAdmin, async (req, res) => {
  try {
    const { page = 1, perPage = 20, search, status } = req.query;
    const where = {
      ...(status && status !== "all" ? { status } : {}),
      ...(search ? { OR: [{ orderNumber: { contains: search } }, { user: { name: { contains: search, mode: "insensitive" } } }] } : {}),
    };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } }, invoice: { select: { invoiceNumber: true } }, _count: { select: { items: true } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

router.get("/orders/:id", authAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) }, include: { user: true, address: true, items: { include: { product: true } }, invoice: true } });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch order" });
  }
});

// BUG FIX: Added try/catch + status validation
router.put("/orders/:id/status", authAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}` });
    }
    const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update order status" });
  }
});

// ── Invoices ──────────────────────────────────────────
router.get("/invoices", authAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? { OR: [{ invoiceNumber: { contains: search } }, { order: { user: { name: { contains: search, mode: "insensitive" } } } }] } : {};
    const invoices = await prisma.invoice.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { include: { user: { select: { name: true } } } } } });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch invoices" });
  }
});

router.put("/invoices/:id/cancel", authAdmin, async (req, res) => {
  try {
    const inv = await prisma.invoice.update({ where: { id: Number(req.params.id) }, data: { status: "cancelled" } });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to cancel invoice" });
  }
});

// ── Users ─────────────────────────────────────────────
router.get("/users", authAdmin, async (req, res) => {
  try {
    const { page = 1, perPage = 20, search } = req.query;
    const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (Number(page) - 1) * Number(perPage), take: Number(perPage), orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, isVerified: true, isActive: true, createdAt: true, _count: { select: { orders: true } } } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch users" });
  }
});

router.get("/users/:id", authAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { orders: { orderBy: { createdAt: "desc" }, take: 10 }, addresses: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch user" });
  }
});

// SOFT DELETE user — deactivate instead of remove from DB
router.delete("/users/:id", authAdmin, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ message: "User deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to deactivate user" });
  }
});

// ── Coupons ───────────────────────────────────────────
router.get("/coupons", authAdmin, async (req, res) => {
  try {
    // Show ALL coupons (active and inactive) in admin
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch coupons" });
  }
});

router.post("/coupons", authAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, startDate, endDate, description, isActive = true } = req.body;
    if (!code || !discountType || !discountValue) return res.status(400).json({ error: "code, discountType and discountValue are required" });
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive === "true" || isActive === true,
      }
    });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create coupon" });
  }
});

// BUG FIX: Added try/catch + explicit field updates (not raw req.body) to prevent type errors
router.put("/coupons/:id", authAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, startDate, endDate, description, isActive } = req.body;
    const data = {};
    if (code !== undefined)          data.code = code.toUpperCase();
    if (description !== undefined)   data.description = description;
    if (discountType !== undefined)  data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue);
    if (minOrderValue !== undefined) data.minOrderValue = parseFloat(minOrderValue);
    if (maxDiscount !== undefined)   data.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined)    data.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (startDate !== undefined)     data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)       data.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined)      data.isActive = isActive === "true" || isActive === true;
    const coupon = await prisma.coupon.update({ where: { id: Number(req.params.id) }, data });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update coupon" });
  }
});

// SOFT DELETE — deactivate coupon instead of removing from DB
// Prevents bugs where orders that used this coupon lose their reference
router.delete("/coupons/:id", authAdmin, async (req, res) => {
  try {
    await prisma.coupon.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Coupon deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to deactivate coupon" });
  }
});

// ── Reviews ───────────────────────────────────────────
router.get("/reviews", authAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true } } } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch reviews" });
  }
});

router.put("/reviews/:id/approve", authAdmin, async (req, res) => {
  try {
    const r = await prisma.review.update({ where: { id: Number(req.params.id) }, data: { isApproved: true } });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to approve review" });
  }
});

// SOFT DELETE — hide review (isApproved: false) instead of deleting from DB
// Prevents broken foreign key references if review is tied to product ratings
router.delete("/reviews/:id", authAdmin, async (req, res) => {
  try {
    await prisma.review.update({ where: { id: Number(req.params.id) }, data: { isApproved: false } });
    res.json({ message: "Review hidden" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to hide review" });
  }
});

// ── Settings ──────────────────────────────────────────
router.get("/settings", authAdmin, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch settings" });
  }
});

router.put("/settings", authAdmin, async (req, res) => {
  try {
    const updates = Object.entries(req.body);
    await Promise.all(updates.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), group: "general" } })
    ));
    res.json({ message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update settings" });
  }
});

// ── Notifications ─────────────────────────────────────
router.get("/notifications", authAdmin, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

// BUG FIX: "read-all" route MUST be before "/:id/read" — otherwise Express matches
// "read-all" as id="read-all" and calls the wrong handler, causing a crash
router.put("/notifications/read-all", authAdmin, async (req, res) => {
  try {
    await prisma.notification.updateMany({ data: { isRead: true } });
    res.json({ message: "All marked read" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to mark all read" });
  }
});

router.put("/notifications/:id/read", authAdmin, async (req, res) => {
  try {
    const n = await prisma.notification.update({ where: { id: Number(req.params.id) }, data: { isRead: true } });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to mark notification read" });
  }
});

// ── GST Rates ─────────────────────────────────────────
router.get("/gst-rates", authAdmin, async (req, res) => {
  try {
    const rates = await prisma.gstRate.findMany();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch GST rates" });
  }
});

module.exports = router;