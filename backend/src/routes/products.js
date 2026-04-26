const router = require("express").Router();
const prisma = require("../utils/prisma");
const slugify = require("slugify");

// GET /api/products
router.get("/", async (req, res) => {
  const { page = 1, perPage = 12, search, category, sort = "newest", priceMin, priceMax } = req.query;

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name:  { contains: search, mode: "insensitive" } },
        { sku:   { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(priceMin || priceMax ? {
      sellingPrice: {
        ...(priceMin ? { gte: parseFloat(priceMin) } : {}),
        ...(priceMax ? { lte: parseFloat(priceMax) } : {}),
      },
    } : {}),
  };

  const orderBy = {
    newest:     { createdAt: "desc" },
    oldest:     { createdAt: "asc"  },
    price_asc:  { sellingPrice: "asc"  },
    price_desc: { sellingPrice: "desc" },
    popular:    { orderItems: { _count: "desc" } },
  }[sort] || { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (Number(page) - 1) * Number(perPage),
      take: Number(perPage),
      include: {
        images:   { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        inventory:{ select: { qtyInStock: true, lowStockThreshold: true } },
        _count:   { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Average rating
  const productsWithRating = await Promise.all(products.map(async (p) => {
    const agg = await prisma.review.aggregate({ where: { productId: p.id, isApproved: true }, _avg: { rating: true } });
    return { ...p, avgRating: agg._avg.rating };
  }));

  res.json({ products: productsWithRating, total, page: Number(page), perPage: Number(perPage) });
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where:   { slug: req.params.slug },
    include: {
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
      category: true,
      inventory:true,
      reviews:  { where: { isApproved: true }, include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      _count:   { select: { reviews: true } },
    },
  });
  if (!product || !product.isActive) return res.status(404).json({ error: "Product not found" });

  const agg = await prisma.review.aggregate({ where: { productId: product.id, isApproved: true }, _avg: { rating: true } });
  res.json({ ...product, avgRating: agg._avg.rating });
});

// GET /api/categories
router.get("/meta/categories", async (req, res) => {
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(cats);
});

module.exports = router;
