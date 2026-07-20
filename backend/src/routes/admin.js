const router = require("express").Router();
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authAdmin, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { sanitizeBody, validatePagination, validateProductBody, validateOrderStatus, validateIdParam, VALID_ORDER_STATUSES } = require("../middleware/validate");
const { sendSMS } = require("../utils/sms");
const jwt = require("jsonwebtoken");

function cleanPhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

// ── Admin Auth ────────────────────────────────────────
// NOTE: the phone-number gate for admin login issues a short-lived token
// that is later validated when credentials are submitted.
router.post("/auth/check-number", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (phone.length !== 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit phone number" });
    }

    const admin = await prisma.admin.findFirst({ where: { number: { contains: phone } } });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: "Unauthorized phone number" });
    }

    const gateToken = jwt.sign({ adminId: admin.id, scope: "admin-gate" }, process.env.JWT_SECRET, { expiresIn: "5m" });
    res.json({ gateToken });
  } catch (err) {
    console.error("admin/check-number error:", err);
    res.status(500).json({ error: "Failed to verify admin number" });
  }
});

router.post("/auth/verify-gate", async (req, res) => {
  try {
    const gateToken = req.body.gateToken;
    if (typeof gateToken !== "string" || !gateToken) {
      return res.status(400).json({ error: "Gate token is required" });
    }

    try {
      const payload = jwt.verify(gateToken, process.env.JWT_SECRET);
      if (payload.scope !== "admin-gate") {
        return res.json({ valid: false });
      }
      return res.json({ valid: true });
    } catch (err) {
      return res.json({ valid: false });
    }
  } catch (err) {
    console.error("admin/verify-gate error:", err);
    res.status(500).json({ error: "Failed to verify gate token" });
  }
});

// NOTE: the phone-number + OTP "gate" step now lives in /api/auth
// (identify → verify-identify-otp) so that admin and regular-user login
// share a single entry page. This route only handles the second factor:
// verifying the admin's email + password against the gate token issued
// by that OTP step, and finally issuing the 8-hour admin JWT.
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password, gateToken } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || typeof gateToken !== "string") {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (email.length > 255 || password.length > 128) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (!gateToken) return res.status(401).json({ error: "Gate token required to authenticate" });

    const jwtSecret = process.env.JWT_SECRET;
    let gatePayload;
    try {
      gatePayload = jwt.verify(gateToken, jwtSecret);
      if (gatePayload.scope !== "admin-gate") {
        return res.status(401).json({ error: "Invalid gate token scope" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Gate token invalid or expired. Please verify your phone number again." });
    }

    const admin = await prisma.admin.findFirst({ where: { email: { equals: email.toLowerCase().trim(), mode: "insensitive" } } });
    if (!admin || !admin.isActive) return res.status(401).json({ error: "Invalid credentials" });

    // The OTP gate was issued for one specific admin's phone number — the
    // credentials submitted here must belong to that exact same admin.
    // Without this check, verifying OTP on Admin A's phone could be reused
    // to log in as a *different* Admin B by simply knowing Admin B's password.
    if (gatePayload.adminId !== admin.id) {
      return res.status(401).json({ error: "Gate token does not match this account. Please verify your phone number again." });
    }

    // Check account lockout status
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMs = admin.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({ error: `Account temporarily locked due to failed attempts. Try again in ${remainingMin} minute(s).` });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      const attempts = admin.failedLoginAttempts + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock after 5 attempts
      } else if (attempts >= 3) {
        lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min cooldown after 3 attempts
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: { failedLoginAttempts: attempts, lockedUntil }
      });

      if (attempts >= 5) {
        return res.status(423).json({ error: "Account temporarily locked due to failed attempts. Try again in 30 minutes." });
      } else if (attempts >= 3) {
        return res.status(429).json({ error: "Too many failed attempts. Cooldown active. Try again in 5 minutes." });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset lock/attempts on successful login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null }
    });

    // Send SMS Notification Alert
    if (admin.number) {
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      sendSMS(admin.number, `Zupwell alert: Successful login to admin panel detected at ${timestamp}.`).catch(err => {
        console.error("⚠️ Failed to send admin login SMS notification:", err.message);
      });
    }

    const accessToken = signAccess(
      { id: admin.id, role: admin.role, tokenVersion: admin.tokenVersion },
      { expiresIn: "8h" }
    );

    res.json({ accessToken, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", authAdmin, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin || !admin.isActive) return res.status(401).json({ error: "Unauthorized" });
    res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
});

// ── Dashboard ─────────────────────────────────────────
router.get("/dashboard/stats", authAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRevenueAgg, thisMonthRevenueAgg, lastMonthRevenueAgg,
      todayRevenueAgg,
      totalOrders, thisMonthOrders, lastMonthOrders,
      totalUsers, thisMonthUsers, lastMonthUsers,
      totalProducts,
      recentOrders,
      orderStatusGroups,
      paymentMethodGroups,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { status: { notIn: ["cancelled"] } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: { notIn: ["cancelled"] }, createdAt: { gte: startOfThisMonth } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: { notIn: ["cancelled"] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: { notIn: ["cancelled"] }, createdAt: { gte: startOfToday } }, _sum: { totalAmount: true } }),
      prisma.order.count({ where: { status: { notIn: ["cancelled"] } } }),
      prisma.order.count({ where: { status: { notIn: ["cancelled"] }, createdAt: { gte: startOfThisMonth } } }),
      prisma.order.count({ where: { status: { notIn: ["cancelled"] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true, email: true } } } }),
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.order.groupBy({ by: ["paymentMethod"], where: { status: { notIn: ["cancelled"] } }, _count: { id: true }, _sum: { totalAmount: true } }),
    ]);

    // Profit = revenue - cost (basePrice * qty) for all non-cancelled orders
    const profitData = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(oi.unit_price * oi.qty), 0)::float AS total_revenue,
        COALESCE(SUM(p.base_price  * oi.qty), 0)::float AS total_cost
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o   ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled')
    `;
    const totalRevenue = Number(profitData[0]?.total_revenue ?? 0);
    const totalCost    = Number(profitData[0]?.total_cost    ?? 0);
    const totalProfit  = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    // This month profit
    const thisMonthProfitData = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(oi.unit_price * oi.qty), 0)::float AS total_revenue,
        COALESCE(SUM(p.base_price  * oi.qty), 0)::float AS total_cost
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o   ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled') AND o.created_at >= ${startOfThisMonth}
    `;
    const lastMonthProfitData = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(oi.unit_price * oi.qty), 0)::float AS total_revenue,
        COALESCE(SUM(p.base_price  * oi.qty), 0)::float AS total_cost
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o   ON o.id = oi.order_id
      WHERE o.status NOT IN ('cancelled') AND o.created_at >= ${startOfLastMonth} AND o.created_at <= ${endOfLastMonth}
    `;

    const thisMonthProfit = Number(thisMonthProfitData[0]?.total_revenue ?? 0) - Number(thisMonthProfitData[0]?.total_cost ?? 0);
    const lastMonthProfit = Number(lastMonthProfitData[0]?.total_revenue ?? 0) - Number(lastMonthProfitData[0]?.total_cost ?? 0);

    // Change % helper: compare this month vs last month
    const changePct = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const thisMonthRev  = Number(thisMonthRevenueAgg._sum.totalAmount ?? 0);
    const lastMonthRev  = Number(lastMonthRevenueAgg._sum.totalAmount ?? 0);
    const todayRevenue  = Number(todayRevenueAgg._sum.totalAmount ?? 0);

    // Order status breakdown
    const statusBreakdown = {};
    orderStatusGroups.forEach(g => { statusBreakdown[g.status] = g._count.id; });

    // Payment method split
    const paymentSplit = paymentMethodGroups.map(g => ({
      method: g.paymentMethod,
      count: g._count.id,
      revenue: Number(g._sum.totalAmount ?? 0),
    }));

    // Top customers by total spend
    const topCustomers = await prisma.order.groupBy({
      by: ["userId"],
      where: { status: { notIn: ["cancelled"] } },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 5,
    });
    const topCustomersWithDetails = await Promise.all(topCustomers.map(async c => {
      const user = await prisma.user.findUnique({ where: { id: c.userId }, select: { id: true, name: true, email: true } });
      return { ...user, totalSpent: Number(c._sum.totalAmount ?? 0), orderCount: c._count.id };
    }));

    // Low stock
    const lowStockItems = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "inventory" WHERE "qty_in_stock" <= "low_stock_threshold"`;
    const lowStock = Number(lowStockItems[0]?.count ?? 0);

    // Average order value
    const avgOrderValue = totalOrders > 0 ? (Number(totalRevenueAgg._sum.totalAmount ?? 0) / totalOrders) : 0;

    res.json({
      totalRevenue: Number(totalRevenueAgg._sum.totalAmount ?? 0),
      totalProfit,
      profitMargin,
      todayRevenue,
      avgOrderValue,
      totalOrders,
      totalUsers,
      totalProducts,
      lowStockCount: lowStock,
      recentOrders,
      statusBreakdown,
      paymentSplit,
      topCustomers: topCustomersWithDetails,
      revenueChange: changePct(thisMonthRev, lastMonthRev),
      profitChange:  changePct(thisMonthProfit, lastMonthProfit),
      ordersChange:  changePct(thisMonthOrders, lastMonthOrders),
      usersChange:   changePct(thisMonthUsers, lastMonthUsers),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

router.get("/dashboard/revenue-chart", authAdmin, async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const from = new Date(); from.setDate(from.getDate() - days);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from }, status: { notIn: ["cancelled"] } },
      include: { items: { select: { qty: true, product: { select: { basePrice: true } } } } },
    });

    const revenueMap = {};
    const profitMap  = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      revenueMap[key] = 0;
      profitMap[key]  = 0;
    }

    orders.forEach(o => {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (revenueMap[key] === undefined) return;
      const rev  = Number(o.totalAmount);
      const cost = (o.items || []).reduce((s, it) => s + Number(it.product?.basePrice ?? 0) * it.qty, 0);
      revenueMap[key] += rev;
      profitMap[key]  += rev - cost;
    });

    res.json(Object.keys(revenueMap).map(date => ({
      date:    date.slice(5),
      revenue: Math.round(revenueMap[date]),
      profit:  Math.round(profitMap[date]),
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to load revenue chart" });
  }
});

router.get("/dashboard/top-products", authAdmin, async (req, res) => {
  try {
    const top = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 8,
    });
    const products = await Promise.all(top.map(async t => {
      const p = await prisma.product.findUnique({ where: { id: t.productId }, select: { id: true, name: true, basePrice: true } });
      const items = await prisma.orderItem.findMany({
        where: { productId: t.productId },
        select: { unitPrice: true, qty: true },
      });
      const totalRevenue = items.reduce((s, i) => s + Number(i.unitPrice) * i.qty, 0);
      const totalCost    = Number(p?.basePrice ?? 0) * (t._sum.qty ?? 0);
      const totalProfit  = totalRevenue - totalCost;
      const marginPct    = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";
      return { ...p, totalSold: t._sum.qty, totalRevenue, totalProfit, marginPct };
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to load top products" });
  }
});

// ── Products ──────────────────────────────────────────
// BUG FIX: Show ALL products (including inactive/deactivated) in admin so admin can see & restore them
router.get("/products", validatePagination, authAdmin, async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/products", sanitizeBody, authAdmin, requireRole("admin", "super_admin"), upload.array("images", 10), async (req, res) => {
  try {
    const { name, sku, hsnCode = "2106", brand, unit = "NOS", categoryId, basePrice, sellingPrice, discountPercent = 0, description, shortDescription, metaTitle, metaDescription, isActive = true, isFeatured = false, variants, flavors, nutritionFacts } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    let parsedNutrition = null;
    if (nutritionFacts) {
      try {
        parsedNutrition = typeof nutritionFacts === "string" ? JSON.parse(nutritionFacts) : nutritionFacts;
      } catch (e) {
        console.error("Failed to parse nutritionFacts in POST:", e);
      }
    }

    const product = await prisma.$transaction(async tx => {
      const p = await tx.product.create({
        data: {
          name, slug, sku, hsnCode, brand, unit,
          categoryId: categoryId ? Number(categoryId) : null,
          basePrice: parseFloat(basePrice), sellingPrice: parseFloat(sellingPrice), discountPercent: parseFloat(discountPercent),
          description, shortDescription, metaTitle, metaDescription, flavors,
          nutritionFacts: parsedNutrition,
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
    res.status(500).json({ error: "Failed to create product" });
  }
});

// BUG FIX: Added try/catch so errors return proper response instead of crashing server
router.put("/products/:id", sanitizeBody, authAdmin, requireRole("admin", "super_admin"), upload.array("images", 10), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive, isFeatured, basePrice, sellingPrice, discountPercent, categoryId, flavors, nutritionFacts, ...rest } = req.body;
    const data = { ...rest };
    if (name)             { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
    if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;
    if (isFeatured !== undefined) data.isFeatured = isFeatured === "true" || isFeatured === true;
    if (basePrice)        data.basePrice = parseFloat(basePrice);
    if (sellingPrice)     data.sellingPrice = parseFloat(sellingPrice);
    if (discountPercent !== undefined) data.discountPercent = parseFloat(discountPercent);
    if (categoryId)       data.categoryId = Number(categoryId);
    if (flavors !== undefined) data.flavors = flavors;
    if (nutritionFacts !== undefined) {
      if (nutritionFacts === "" || nutritionFacts === null) {
        data.nutritionFacts = null;
      } else {
        try {
          data.nutritionFacts = typeof nutritionFacts === "string" ? JSON.parse(nutritionFacts) : nutritionFacts;
        } catch (e) {
          console.error("Failed to parse nutritionFacts in PUT:", e);
        }
      }
    }

    const product = await prisma.product.update({ where: { id }, data });
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        await prisma.productImage.create({ data: { productId: id, imageUrl: req.files[i].path, altText: name || product.name, isPrimary: false, sortOrder: 99 + i } });
      }
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product image by ID
router.delete("/products/images/:imageId", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const imageId = Number(req.params.imageId);
    const img = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!img) return res.status(404).json({ error: "Image not found" });

    if (img.isPrimary) {
      const nextImg = await prisma.productImage.findFirst({
        where: { productId: img.productId, id: { not: imageId } }
      });
      if (nextImg) {
        await prisma.productImage.update({ where: { id: nextImg.id }, data: { isPrimary: true } });
      }
    }

    await prisma.productImage.delete({ where: { id: imageId } });
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// Try hard delete first, fall back to soft deactivate if referenced in orderItems
router.delete("/products/:id", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({ where: { productId: id } });
      await tx.inventory.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
    res.json({ message: "Product deleted completely" });
  } catch (err) {
    try {
      await prisma.product.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
      res.json({ message: "Product is referenced in orders, deactivated instead" });
    } catch (innerErr) {
      res.status(500).json({ error: innerErr.message || "Failed to delete product" });
    }
  }
});

// ── Categories ────────────────────────────────────────
// BUG FIX: Show ALL categories in admin (including inactive) so admin can see & restore
router.get("/categories", authAdmin, async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } }, children: true } });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const { name, description, parentId, isActive = true } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await prisma.category.create({ data: { name, slug, description, parentId: parentId ? Number(parentId) : null, isActive } });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/categories/:id", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const { name, ...rest } = req.body;
    const data = { ...rest };
    if (name) { data.name = name; data.slug = slugify(name, { lower: true, strict: true }); }
    if (rest.parentId) data.parentId = Number(rest.parentId);
    const cat = await prisma.category.update({ where: { id: Number(req.params.id) }, data });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Try hard delete first, fall back to soft deactivate if referenced in products
router.delete("/categories/:id", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Category deleted completely" });
  } catch (err) {
    try {
      await prisma.category.update({ where: { id }, data: { isActive: false } });
      res.json({ message: "Category has product references, deactivated instead" });
    } catch (innerErr) {
      res.status(500).json({ error: innerErr.message || "Failed to delete category" });
    }
  }
});

// ── Inventory ─────────────────────────────────────────
router.get("/inventory", authAdmin, async (req, res) => {
  try {
    const inv = await prisma.inventory.findMany({ include: { product: { select: { id: true, name: true, sku: true, isActive: true } }, variant: true }, orderBy: { qtyInStock: "asc" } });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
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
    res.status(500).json({ error: "Failed to update stock" });
  }
});

router.get("/inventory/movements", authAdmin, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { product: { select: { name: true } }, admin: { select: { name: true } } } });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movements" });
  }
});

// ── Orders ────────────────────────────────────────────
router.get("/orders", validatePagination, authAdmin, async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", authAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) }, include: { user: true, address: true, items: { include: { product: true } }, invoice: true } });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// BUG FIX: Added try/catch + status validation
router.put("/orders/:id/status", authAdmin, validateOrderStatus, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}` });
    }
    const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
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
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.put("/invoices/:id/cancel", authAdmin, async (req, res) => {
  try {
    const inv = await prisma.invoice.update({ where: { id: Number(req.params.id) }, data: { status: "cancelled" } });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel invoice" });
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
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/users/:id", authAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { orders: { orderBy: { createdAt: "desc" }, take: 10 }, addresses: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// SOFT DELETE user — deactivate instead of remove from DB
router.delete("/users/:id", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    await prisma.user.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.json({ message: "User deactivated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// ── Coupons ───────────────────────────────────────────
router.get("/coupons", authAdmin, async (req, res) => {
  try {
    // Show ALL coupons (active and inactive) in admin
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/coupons", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
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
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// BUG FIX: Added try/catch + explicit field updates (not raw req.body) to prevent type errors
router.put("/coupons/:id", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
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
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// Try hard delete first, fall back to soft deactivate if referenced in orders
router.delete("/coupons/:id", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: "Coupon deleted completely" });
  } catch (err) {
    try {
      await prisma.coupon.update({ where: { id }, data: { isActive: false } });
      res.json({ message: "Coupon is referenced in orders, deactivated instead" });
    } catch (innerErr) {
      res.status(500).json({ error: innerErr.message || "Failed to delete coupon" });
    }
  }
});

// ── Reviews ───────────────────────────────────────────
router.get("/reviews", authAdmin, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true } } } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.put("/reviews/:id/approve", authAdmin, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const r = await prisma.review.update({ where: { id: Number(req.params.id) }, data: { isApproved: true } });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve review" });
  }
});

// Hard delete reviews completely from the database
router.delete("/reviews/:id", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Review deleted completely" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ── Settings ──────────────────────────────────────────
router.get("/settings", authAdmin, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/settings", authAdmin, requireRole("super_admin"), async (req, res) => {
  try {
    const updates = Object.entries(req.body);
    await Promise.all(updates.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value), group: "general" } })
    ));
    res.json({ message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Upload setting image (logo, founder photo, etc.) to Cloudinary
router.post("/settings/upload", authAdmin, requireRole("super_admin"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload setting image" });
  }
});

// ── Notifications ─────────────────────────────────────
router.get("/notifications", authAdmin, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// BUG FIX: "read-all" route MUST be before "/:id/read" — otherwise Express matches
// "read-all" as id="read-all" and calls the wrong handler, causing a crash
router.put("/notifications/read-all", authAdmin, async (req, res) => {
  try {
    await prisma.notification.updateMany({ data: { isRead: true } });
    res.json({ message: "All marked read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

router.put("/notifications/:id/read", authAdmin, async (req, res) => {
  try {
    const n = await prisma.notification.update({ where: { id: Number(req.params.id) }, data: { isRead: true } });
    res.json(n);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

// ── GST Rates ─────────────────────────────────────────
router.get("/gst-rates", authAdmin, async (req, res) => {
  try {
    const rates = await prisma.gstRate.findMany();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch GST rates" });
  }
});

const crypto = require("crypto");
const { sendPasswordReset } = require("../utils/mailer");

// POST /api/admin/auth/forgot-password
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
    if (!admin || !admin.isActive) {
      return res.json({ message: "If your email is registered, you will receive a reset link shortly." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: cleanEmail, tokenHash, isAdmin: true, expiresAt }
    });

    await sendPasswordReset(cleanEmail, token, true);

    res.json({ message: "If your email is registered, you will receive a reset link shortly." });
  } catch (err) {
    console.error("Admin forgot password error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// POST /api/admin/auth/reset-password
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }
    if (password.length < 12) {
      return res.status(400).json({ error: "Password must be at least 12 characters long" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, isAdmin: true, expiresAt: { gt: new Date() } }
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const newPasswordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.admin.update({
        where: { email: record.email },
        data: { passwordHash: newPasswordHash, failedLoginAttempts: 0, lockedUntil: null, tokenVersion: { increment: 1 } }
      }),
      prisma.passwordResetToken.delete({ where: { id: record.id } })
    ]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Admin reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;